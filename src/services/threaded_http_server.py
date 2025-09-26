from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    # no extra code needed.  
    # this is simply HTTPServer that can handle each request in a separate thread.
    pass
