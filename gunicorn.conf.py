# gunicorn.conf.py
import os
from src.config.config import Config
from src.logging.app_logger import AppLogger

_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
_LOG = os.path.join(_ROOT, 'acronyms')  
_PROJECT_HOME = os.path.join(_ROOT, "acronyms")

# gunicorn logging
loglevel = "info"
errorlog = os.path.join(_LOG, 'gunicorn-acronyms.log')
accesslog = os.path.join(_LOG, 'gunicorn-api-access.log')

# app logging
appLog = os.path.join(_PROJECT_HOME, "app.log")
log = AppLogger.set_up_logger(appLog)

# configuration
configFile = os.path.join(_PROJECT_HOME, "resources/.env")
#config = Config.set_up_config(configFile)
#log.info(str(type(config)))
#log.info(str(config))
Config.set_up_config(configFile)

bind = Config.get_property("HOST") + ":" + Config.get_property("PORT")

# workers = multiprocessing.cpu_count() * 2 + 1
#workers = 4
workers = 1

timeout = 3 * 60 # 3 minutes
keepalive = 24 * 60 * 60 # 1 day

capture_output = True

wsgi_app = "wsgi:app"
