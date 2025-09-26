import json
import os
import time
from http.server import SimpleHTTPRequestHandler
from src.middleware.authentication import Authentication

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
        if self.path == "/acronyms":
            claims = Authentication(self.config).validate_request(self.headers)
            if not claims:
                return self._unauthorized()
                
            self.claims = claims
            self.log.info(str(claims))
            self.path = "/html/index.html"
            return super().do_GET()

        else: # for static content (this calls the translate method)
            return super().do_GET()
            

    # mapper for static files
    def translate_path(self, path):
        #self.log.info(str(self.web_root))
        #self.log.info(str(self.path))

        # Normalize the path (remove leading "/")
        relpath = path.lstrip("/") or  "html/index.html" 

        # Join it with the configured static folder
        return os.path.join(self.web_root, relpath)
    
    def _unauthorized(self):
        self.send_response(401)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"error":"Unauthorized"}')