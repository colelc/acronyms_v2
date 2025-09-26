import json
import os
import time
from http.server import SimpleHTTPRequestHandler
from src.config.config import Config
from src.logging.app_logger import AppLogger

class CustomHandler(SimpleHTTPRequestHandler):

    config = None
    log = None
    web_root = None



    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")  # allow browser requests
        self.end_headers()

    def do_GET(self):

        if self.path == "/api/hello":
            self._set_headers()
            response = {"message": "Hello from API!"}
            self.wfile.write(json.dumps(response).encode())

        elif self.path == "/api/slow":
            # Simulate slow endpoint for demo purposes
            time.sleep(5)
            self._set_headers()
            self.wfile.write(json.dumps({"message": "This was slow"}).encode())

        elif self.path == "/acronyms":
            self.path = "/html/index.html"

        else: # for static content (this calls the translate method)
            return super().do_GET()

        # else:
        #     self._set_headers(404)
        #     self.wfile.write(json.dumps({"error": "Not found"}).encode())

    # mapper for static files
    def translate_path(self, path):
        #self.log.info(str(self.web_root))
        #self.log.info(str(self.path))

        # Normalize the path (remove leading "/")
        relpath = path.lstrip("/") or  "html/index.html" 

        # Join it with the configured static folder
        return os.path.join(self.web_root, relpath)