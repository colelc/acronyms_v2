import json
from src.config.config import Config
from src.logging.app_logger import AppLogger

def app(environ, start_response):
        # parser = argparse.ArgumentParser()
        # parser.add_argument("--log", type=str)
        # parser.add_argument("--config", type=str)
        # args = parser.parse_args()

        # if os.path.exists(args.log):
        #     os.remove(args.log)

        #log = AppLogger.set_up_logger(args.log)
        log = AppLogger.get_logger()
        log.info("")
        log.info("This is Acronyms V2")
        log.info("")

        #config = Config.set_up_config(args.config)

        path = environ.get("PATH_INFO", "/")
        log.info("path is " + path)
        
        if path == "/acronyms":
            start_response("200 OK", [("Content-Type", "application/json")])
            body = {"message": "Hello from Gunicorn API backend!"}
            return [json.dumps(body).encode("utf-8")]

        # Default 404 if not handled
        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"Not Found"]
