#!/bin/bash

echo "$(date) Acronyms V2 is running...."
## Set up proxy host
export HTTP_PROXY=http://ha-proxy.fuqua.duke.edu:3128
export HTTPS_PROXY=$HTTP_PROXY

#APP_HOME=/app/ais_coursepacks
APP_HOME=/home/linda/vsc-workspace-duke/acronyms

#CONFIG_FILE=$APP_HOME/resources/.env

#LOG_FILE_DIR=$APP_HOME/logs
#NOW=$(date "+%Y%m%d_%H%M%S")
#LOG_FILE=$LOG_FILE_DIR/ais_coursepacks_$NOW.log

VIRTUAL_ENV=${APP_HOME}/.venv
PATH="$VIRTUAL_ENV/bin:$PATH"
#$VIRTUAL_ENV/bin/python  $APP_HOME/app.py   --log=$LOG_FILE  --config=$CONFIG_FILE
#$VIRTUAL_ENV/bin/python  $APP_HOME/app.py
#$VIRTUAL_ENV/bin/gunicorn --workers=4   --bind 0.0.0.0:80    --access-logfile log/gunicorn.log    --error-logfile log/coursepack.log  wsgi:app
$VIRTUAL_ENV/bin/gunicorn -c $APP_HOME/gunicorn.conf.py
