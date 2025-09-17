import json
import threading
from collections import defaultdict
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from src.logging.app_logger import AppLogger
import time
from datetime import datetime, timezone

class Poll(object):

    latest_data = {}
    data_lock = threading.Lock()
    window_groups = defaultdict(dict)  # Shared across threads

    @staticmethod
    def poll(socket, room, ip, num_ips, port, polling_request, polling_interval, pollingType, pollSeatNumber, stop_event):
        logger = AppLogger.get_logger()
        logger.info(str(pollSeatNumber))

        while not stop_event.is_set():
            #logger.info("polling on " + str(ip))
            
            try:
                #request_time = datetime.now()  #.isoformat()

                # Send the message
                socket.sendto(polling_request, (ip, port))

                response, addr = socket.recvfrom(4096)

                #response_time = datetime.now() #.isoformat()
                response_time = datetime.now(timezone.utc) #.isoformat()

                #logger.info("tcc2_response_time: " + str(response_time.isoformat()))
                iso_8601_string = response_time.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
                #logger.info("iso_8601_string: " + str(iso_8601_string))
                epoch_ms = int(response_time.timestamp() * 1000)

                response_json = json.loads(response.decode())
                #logger.info(str(response_json))

                # room, IP, response timestamp
                response_json["m"]["beam"]["room"] = room
                response_json["m"]["beam"]["ip"] = str(ip)
                # response_json["m"]["beam"]["tcc2_response_time"] = str(response_time.isoformat())  #.replace("T", " "))
                #response_json["m"]["beam"]["tcc2_response_time"] = str(iso_8601_string)  
                #response_json["m"]["beam"]["epoch_ms"] = str(epoch_ms)  
                
                # beam, azimuth
                beam_data = {"azimuth": response_json["m"]["beam"]["azimuth"], "elevation": response_json["m"]["beam"]["elevation"]}
                #logger.info("beam data:" + str(beam_data))

                # signal strength
                signal_data = {"peak": response_json["m"]["in1"]["peak"], "rms": response_json["m"]["ref1"]["rms"]}
                #logger.info("signal_data:" + str(signal_data))

                bucket_time = Poll.round_time(response_time)
                key = str(bucket_time)

                data = {"ip": ip,
                        "room" : room,
                        "response_time": str(bucket_time),
                        #"tcc2_response_time": str(response_time.isoformat()),
                        "tcc2_response_time": str(iso_8601_string),
                        "epoch_ms": int(epoch_ms),
                        "azimuth": beam_data["azimuth"], 
                        "elevation": beam_data["elevation"],
                        "peak": signal_data["peak"],
                        "rms": signal_data["rms"]
                        }

                #print("poll data: " + str(data))
                #logger.info(" ----> " + str(data["ip"]) + "       " + str(data["tcc2_response_time"]))

                with Poll.data_lock:
                    Poll.window_groups[key][data["ip"]] = data

                    if len(Poll.window_groups[key]) == num_ips:
                        group = Poll.window_groups.pop(key)
                        # logger.info(str(group[ip]["ip"]) 
                        #             + " " + str(group[ip]["tcc2_response_time"]) 
                        #             + " " + str(group[ip]["azimuth"]) 
                        #             + " " + str(group[ip]["elevation"]))

                        # pollSeatNumber will be 0 if pollingType is not "seat"
                        Poll.latest_data["beam_data"] = group
                        Poll.latest_data["pollingType"] = pollingType
                        Poll.latest_data["pollSeatNumber"] = pollSeatNumber 

            except Exception as e:
                logger.error("UDP polling error: " + str(e))
                time.sleep(5)
                continue

            #time.sleep(1)
            #time.sleep(0.5)
            #time.sleep(0.2)
            time.sleep(polling_interval)

        socket.close()

    @staticmethod
    def round_time_half_second(dt: datetime) -> datetime:
        micro = dt.microsecond
        if micro >= 750_000:
            dt = dt + timedelta(seconds=1)
            rounded_micro = 0
        elif micro >= 250_000:
            rounded_micro = 500_000
        else:
            rounded_micro = 0
        return dt.replace(microsecond=rounded_micro)
    
    @staticmethod
    def round_time(dt: datetime) -> str:
        tm = Poll.round_time_half_second(dt)
        seconds_int = tm.second
        # microsecond is either 0 or 500000 after rounding
        fraction = 0 if tm.microsecond == 0 else 5
        # Format each part zero-padded, separated by '.'
        # seconds decimal is seconds_int.fraction/10 (so .0 or .5)
        return f"{tm.hour:02d}.{tm.minute:02d}.{seconds_int:02d}.{fraction}"

    # @staticmethod
    # def cleanup_stale_windows(timeout_seconds=3):
    #     now = datetime.now()
    #     with Poll.data_lock:
    #         keys_to_delete = []
    #         for key in list(Poll.window_groups.keys()):
    #             try:
    #                 bucket_time = datetime.fromisoformat(key)
    #             except ValueError:
    #                 # In case of unexpected key format, skip or log error
    #                 continue
    #             age = (now - bucket_time).total_seconds()
    #             if age > timeout_seconds:
    #                 keys_to_delete.append(key)
    #         for key in keys_to_delete:
    #             del Poll.window_groups[key]
    #             # Optional: log cleanup
    #             logger = AppLogger.get_logger()
    #             logger.info(f"Cleaned up stale window {key} aged {age:.1f}s")


# class SSEHandler(BaseHTTPRequestHandler):
#     def do_GET(self):
#         logger = AppLogger.get_logger()
#         logger.info("TOP OF SSEHandler")
#         if self.path == '/events':
#             self.send_response(200)
#             self.send_header("Content-Type", "text/event-stream")
#             self.send_header("Cache-Control", "no-cache")
#             self.send_header("Connection", "keep-alive")
#             self.end_headers()
#             #self.wfile = self.wfile  # Ensures we're referencing the raw socket
#             last_sent = {}

#             while True:
#                 time.sleep(1)
#                 logger.info("SSEHandler")
#                 #if PollingThread.stop_event.is_set():
#                 if stop_event.is_set():
#                     logger.info("polling has stopped")
#                     stop_msg = "event: stop\ndata: polling stopped\n\n"
#                     self.wfile.write(stop_msg.encode("utf-8"))
#                     self.wfile.flush()
#                     logger.info("Polling stopped—sent stop event, closing SSE connection")
#                     break
              
#                 with Poll.data_lock:
#                     for key, data in Poll.latest_data.items():
#                         msg = f"data: {json.dumps({key: data})}\r\n\r\n"
#                         try:
#                             self.wfile.write(msg.encode("utf-8"))
#                             self.wfile.flush()
#                             last_sent[key] = data
#                         except BrokenPipeError:
#                             return
#         else:
#             self.send_response(404)
#             self.end_headers()