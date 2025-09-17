#from src.config.config import Config
from src.logging.app_logger import AppLogger
from src.services.poll import Poll
from src.services.polling_thread import PollingThread
from src.services.file_service import FileService
from src.services.couchdb_service import CouchDbService
from src.services.trainer import Trainer
from datetime import datetime
import copy
import http.server
import json
import time


class MyRequestHandler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        logger = AppLogger.get_logger()

        if self.path == '/favicon.ico':
            self.send_response(204)  # No Content, browser won't show broken icon
            self.end_headers()
            return
        
        if self.path == '/':
            self.path = 'html/index.html'
            return super().do_GET()
        
        if self.path == "/poll/stop":
            PollingThread.stopPolling()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Polling is stopping"}).encode('utf-8'))
            return
        
        if self.path == "/read/seat/assignments":
            #preferred_ip = self.config.get("rand.preferred.ip")
            xy32 = self.config.get("x.y.32").split(",")
            xy33 = self.config.get("x.y.33").split(",")
            xy34 = self.config.get("x.y.34").split(",")
            # logger.info(str(xy32))
            # logger.info(str(xy33))
            # logger.info(str(xy34))

            seat_map = FileService.read_seat_map(self.config.get("multimedia.seat.map.file"))

            sorted_seat_map = sorted(
                seat_map,
                key=lambda d: (int(d['y'])),
                reverse=True
            )
            # for s in sorted_seat_map:
            #     logger.info(str(s))

            server = CouchDbService.get_connection()

            block_readings = CouchDbService.query_all_readings(self.config.get("dbname.seat.blocks"), server)
            block_data = list(map(lambda x: x["doc"], block_readings))

            # for d in block_data:
            #     logger.info(str(d))

            for seat in sorted_seat_map:
                if seat["seat"] == "76" or seat["seat"] == 77:
                    continue

                target = seat["seat"]
                if target == "0":
                    # see if we need to load device in ceiling coords
                    if seat["x"] == xy32[0] and seat["y"] == xy32[1]:
                        seat["deviceDisplay"] = ".32"
                        #logger.info(str(seat))
                    elif seat["x"] == xy33[0] and seat["y"] == xy33[1]:
                        seat["deviceDisplay"] = ".33"
                        #logger.info(str(seat))
                    elif seat["x"] == xy34[0] and seat["y"] == xy34[1]:
                        seat["deviceDisplay"] = ".34"
                        #logger.info(str(seat))
                    continue

                #logger.info(str(seat))

                matched = (list(filter(lambda x: x["seat"] == target, block_data))) 
                #logger.info("Seat " + str(seat["seat"]) + " "  + str(matched))

                if len(matched) == 1:
                    data = matched[0]
                    #logger.info(str(data))
                    seat["mm_readings"] = data["mm_readings"]
                    seat["row"] = data["row"]
                    seat["lcr"] = data["lcr"]
                    seat["primary"] = data["primary"]
                    seat["secondary"] = data["secondary"]
                    seat["other"] = data["other"]

                    # multimedia data
                    seat["mmPrimaryAz"] = int(data["mmPrimaryAz"])
                    seat["mmPrimaryEl"] = int(data["mmPrimaryEl"])
                    seat["mmSecondaryAz"] = int(data["mmSecondaryAz"])
                    seat["mmSecondaryEl"] = int(data["mmSecondaryEl"])
                    seat["mmOtherAz"] = int(data["mmOtherAz"])
                    seat["mmOtherEl"] = int(data["mmOtherEl"])

                    # training data
                    seat["priAzAverage"] = float(data["priAzAverage"])
                    seat["priElAverage"] = float(data["priElAverage"])

                    seat["secAzAverage"] = float(data["secAzAverage"])
                    seat["secElAverage"] = float(data["secElAverage"])

                    seat["othAzAverage"] = float(data["othAzAverage"])
                    seat["othElAverage"] = float(data["othElAverage"])

                    seat["priAzValues"] = data["priAzValues"]
                    seat["priElValues"] = data["priElValues"]

                    seat["secAzValues"] = data["secAzValues"]
                    seat["secElValues"] = data["secElValues"]

                    seat["othAzValues"] = data["othAzValues"]
                    seat["othElValues"] = data["othElValues"]
                else:
                    logger.error(seat["seat"] + " " + "RUH ROH, length of matched is " + str(len(matched)))
                    continue
                

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # self.wfile.write(json.dumps({"seats": assignments}).encode('utf-8'))
            # self.wfile.write(json.dumps({"seats": seat_map}).encode('utf-8'))
            self.wfile.write(json.dumps({"seats": sorted_seat_map}).encode('utf-8'))
            return
      
        if self.path == '/events':
            self.send_response(200)
            self.send_header('Content-type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()

            #azMargin = self.config.get("az.margin")
            #elMargin = self.config.get("el.margin")

            polling_file = self.config.get("polling.data.file")
            polling_interval = float(self.config.get("polling.interval"))

            logger.info("MyRequestHandler, endpoint /events")
            prev = dict()

            try:
                while True:
                    # Check if polling is stopped
                    if PollingThread.stop_events[0].is_set():
                        # Send an event indicating polling stopped (optional)
                        stop_msg = json.dumps({"message": "Polling stopped"})
                        event = f"data: {stop_msg}\n\n"
                        self.wfile.write(event.encode('utf-8'))
                        self.wfile.flush()

                        logger.info("Polling stopped, ending SSE stream")
                        break    
                                   
                    #time.sleep(1)
                    #time.sleep(0.5)
                    #time.sleep(0.2)
                    time.sleep(polling_interval)

                    with Poll.data_lock:
                        now = datetime.now() #.isoformat()
                        client_receive_time = str(now.isoformat().replace("T", " "))

                        new_data = copy.deepcopy(Poll.latest_data)
                        #logger.info(str(new_data))
                        if "beam_data" not in new_data:
                            continue

                        if new_data == prev:
                            #logger.info("REPEAT")
                            continue

                        #new_data["azMargin"] = float(azMargin)
                        #new_data["elMargin"] = float(elMargin)

                        pollingType = new_data["pollingType"]
                        if pollingType == "general":
                            polling_file = self.config.get("general.polling.data.file")
                        elif pollingType == "quiet":
                            polling_file = self.config.get("quiet.polling.data.file")
                        elif pollingType == "seat":
                            pollSeatNumber = new_data["pollSeatNumber"]
                            polling_file = self.config.get("seat.polling.data.file").replace("@",pollSeatNumber)

                        FileService.write_polling_data(polling_file, new_data)

                        prev = copy.deepcopy(new_data)

                        payload = json.dumps(new_data)

                        #logger.info(str(payload))
                        event = f"data: {payload}\n\n"
                        self.wfile.write(event.encode('utf-8'))
                        self.wfile.flush()

            except ConnectionResetError:
                logger.info("Client disconnected from SSE")
            except Exception as e:
                logger.error(f"SSE streaming error: {e}")

            return
        
        # this takes care of static resources
        return super().do_GET()
    
    def do_POST(self):
        logger = AppLogger.get_logger()

        if self.path == "/poll/start":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            pollingType = data["pollingType"]
            pollSeatNumber = data["pollSeatNumber"]

            PollingThread.threadIt(self.config, pollingType, pollSeatNumber)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Polling is starting"}).encode('utf-8'))
            return
        
        if self.path == "/train/data":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            for k,v in data.items():
                logger.info(k + " -> " + str(v))

            hit = data["hit"]
            seat = hit["seat"]
            seatNumber = seat["seat"]

            primaryBeam = hit["primaryBeam"]
            secondaryBeam = hit["secondaryBeam"]
            otherBeam = hit["otherBeam"]

            result = Trainer(data, self.config).getResult()
            trainingDataUpdated = result["trainingData"]

            #
            # log the hit in ai_classroom_seat_hits
            #
            captureDoc = {
                "_id": seatNumber + "_" + primaryBeam["tcc2_response_time"],
                "seatNumber": seatNumber,
                "seat": seat,
                "row": seat["row"],
                "leftCenterRight": seat["lcr"],
                "azMargin": hit["azMargin"],
                "elMargin": hit["elMargin"],
                #"usedToTrain": False,

                "fitPriAz": hit["fitPriAz"],
                "fitPriEl": hit["fitPriEl"],
                "fitSecAz": hit["fitSecAz"],
                "fitSecEl": hit["fitSecEl"],
                #"fitOthAz": hit["fitOthAz"],
                #"fitOthEl": hit["fitOthEl"],

                "primaryIp": primaryBeam["ip"],
                "secondaryIp": secondaryBeam["ip"],
                "otherIp": otherBeam["ip"],

                "primaryBeam": primaryBeam,
                "secondaryBeam": secondaryBeam,
                "otherBeam": otherBeam
            }

            try:
                server = CouchDbService.get_connection()
                dbSeatHits = self.config.get("dbname.seat.hits")
                CouchDbService.write_document(captureDoc, dbSeatHits, server)
            except Exception as e:
                logger.error(str(e))

            #
            # update the training data in seat blocks table
            #
            dbSeatBlocks = self.config.get("dbname.seat.blocks")
            try:
                dbSeat = CouchDbService.query_by_seat(dbSeatBlocks, server, data["hit"]["seat"]["seat"], "seat")
                trainingData = (list(map(lambda x: x["doc"], dbSeat)))[0]

                trainingData["priAzAverage"] = trainingDataUpdated["priAzAverage"]
                trainingData["priAzValues"] = [item for item in trainingDataUpdated["priAzValues"]]

                trainingData["priElAverage"] = trainingDataUpdated["priElAverage"]
                trainingData["priElValues"] = [item for item in trainingDataUpdated["priElValues"]]

                trainingData["secAzAverage"] = trainingDataUpdated["secAzAverage"]
                trainingData["secAzValues"] = [item for item in trainingDataUpdated["secAzValues"]]

                trainingData["secElAverage"] = trainingDataUpdated["secElAverage"]
                trainingData["secElValues"] = [item for item in trainingDataUpdated["secElValues"]]

                trainingData["othAzAverage"] = trainingDataUpdated["othAzAverage"]
                trainingData["othAzValues"] = [item for item in trainingDataUpdated["othAzValues"]]

                trainingData["othElAverage"] = trainingDataUpdated["othElAverage"]
                trainingData["othElValues"] = [item for item in trainingDataUpdated["othElValues"]]

                #logger.info(str(trainingData))
                CouchDbService.write_document(trainingData, dbSeatBlocks, server)

            except Exception as e:
                logger.info(str(e))

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"data": result}).encode('utf-8'))
            return

        if self.path == "/fetch/seat":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            #logger.info("data: " + str(data))
            # for k,v in data.items():
            #     logger.info(k + " -> " + str(v))
            seatNumber = data["seatNumber"]

            dbSeatBlocks = self.config.get("dbname.seat.blocks")
            try:
                server = CouchDbService.get_connection()
                dbSeat = CouchDbService.query_by_seat(dbSeatBlocks, server, seatNumber, "seat")
                seatData = (list(map(lambda x: x["doc"], dbSeat)))[0]

            except Exception as e:
                logger.info(str(e))

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"data": seatData}).encode('utf-8'))
            return

