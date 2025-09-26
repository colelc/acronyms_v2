##
##  pip install -r requirements.txt
##
##  python app.py --config=resources/.env  --log=app.log
##
##  browser: localhost:8000/     

import argparse
import os
from src.services.threaded_http_server import ThreadedHTTPServer
from src.config.config import Config
from src.logging.app_logger import AppLogger
from src.api.custom_handler import CustomHandler

class App(object):

    @classmethod
    def go(cls):
        parser = argparse.ArgumentParser()
        parser.add_argument("--log", type=str)
        parser.add_argument("--config", type=str)
        args = parser.parse_args()

        if os.path.exists(args.log):
            os.remove(args.log)

        log = AppLogger.set_up_logger(args.log)
        log.info("")
        log.info("Acronyms V2")
        log.info("")

        config = Config.set_up_config(args.config)

        CustomHandler.config = config
        CustomHandler.log = log
        CustomHandler.web_root = os.path.join(os.path.dirname(__file__), "static")
        server_address = (config.get("HOST"), int(config.get("PORT")))
        httpd = ThreadedHTTPServer(server_address, CustomHandler)

        log.info("Serving at " + str(config.get("HOST")) + ":" + str(config.get("PORT")))
        httpd.serve_forever()
      
App.go()

