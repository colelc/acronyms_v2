from app import app
from src.config.config import Config
##
# gunicorn --workers=1 --bind localhost.fuqua.duke.edu:5000 --access-logfile gunicorn.log wsgi:app
if __name__ == "__main__":
    app.run(host=Config.get_property("HOST"), port=Config.get_property("PORT"))
