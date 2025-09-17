from src.config.config import Config
from src.logging.app_logger import AppLogger
from src.services.socket_service import SocketService
from src.services.poll import Poll

import threading

class PollingThread(object):

    stop_events = [threading.Event(), threading.Event(), threading.Event()]

    @staticmethod
    def threadIt(config, pollingType, pollSeatNumber):
        logger = AppLogger.get_logger()
        logger.info("Starting polling")

         # Reset the stop signals before starting new threads
        for stop_event in PollingThread.stop_events:
            stop_event.clear()
        
        port = int(config.get("sscv1.port"))
        polling_request = config.get("polling.request").encode("utf-8")
        #logger.info(str(polling_request))

        ip_addresses = config.get("rand.ip.addresses").split(",")
        #preferred_ip = config.get("rand.preferred.ip")
        room = config.get("rand.room")
        polling_interval = float(config.get("polling.interval"))

        # Start UDP polling threads
        i = 0
        for ip in ip_addresses:
            stop_event = PollingThread.stop_events[i]
            socket = SocketService().socket_setup()
            thread = threading.Thread(target=Poll.poll, 
                                      args=(socket, room, ip.strip(), len(ip_addresses), port, polling_request, polling_interval, pollingType, pollSeatNumber, stop_event), 
                                      daemon=True)
            thread.start()

    @staticmethod
    def stopPolling():
        logger = AppLogger.get_logger()
        logger.info("Stopping polling")

        for stop_event in PollingThread.stop_events:
            stop_event.set()

        logger.info("Polling stopped")




