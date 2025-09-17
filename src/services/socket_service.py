
#from src.config.config import Config
from src.logging.app_logger import AppLogger
import socket

class SocketService(object):

    def __init__(self):
        self.logger = AppLogger.get_logger()
        self.socket = self.socket_setup()

    def socket_setup(self) -> type:
        this_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        this_socket.settimeout(1)
        return this_socket

    def get_socket(self):
        return self.socket
    
    def socket_bind(self):
        self.socket.bind(("0.0.0.0", 45))
    
    def close_socket(self):
        if self.socket is not None:
            self.socket.close()


    ####################
    # Use connect() to set the destination, which allows getsockname() to reveal the local IP/interface used
    #sock.connect((TCC2_IP, TCC2_PORT))
    #local_ip, local_port = sock.getsockname()
    #print(f"Local IP: {local_ip}, Local Port: {local_port}")
    #####################