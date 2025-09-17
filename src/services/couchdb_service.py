import pycouchdb
import urllib.parse
from pycouchdb import exceptions
from src.logging.app_logger import AppLogger
from src.config.config import Config

class CouchDbService(object):
    
    @staticmethod
    def get_connection() -> type:
        logger = AppLogger.get_logger()
        config = Config.get_config()
        #logger.info(str(config))

        url = config.get("couch.url")
        username = urllib.parse.quote(config.get("couch.user.name"))
        password = urllib.parse.quote(config.get("couch.user.password"))
        connection_string = "http://" + username + ":" + password + "@" + url
        server = pycouchdb.Server(connection_string)
        #logger.info(str(server))
        return server

    @staticmethod
    def get_db_connection(local=True) -> type:
        logger = AppLogger.get_logger()
        config = Config.get_config()
        #logger.info(str(config))

        if local:
            url = config.get("local.couch.url")
            username = urllib.parse.quote(config.get("local.couch.user.name"))
            password = urllib.parse.quote(config.get("local.couch.user.password"))
            connection_string = "http://" + username + ":" + password + "@" + url
            server = pycouchdb.Server(connection_string)
            logger.info(connection_string)
            return server
        else: # greenshade 
            url = config.get("remote.couch.url")
            username = urllib.parse.quote(config.get("remote.couch.user.name"))
            password = urllib.parse.quote(config.get("remote.couch.user.password"))
            connection_string = "http://" + username + ":" + password + "@" + url
            server = pycouchdb.Server(connection_string)
            logger.info(connection_string)
            return server
    
    # @staticmethod
    # def existence_check(server, db_name:str, do_index_by_seat=True):
    #     exists = CouchDbService.does_database_exist(db_name, server)

    #     if exists:
    #         CouchDbService.delete_database(db_name, server)

    #     CouchDbService.create_database(db_name, server)
    #     if do_index_by_seat:
    #         CouchDbService.index_by_seat(db_name, server)
    @staticmethod
    def existence_check(server, db_name:str, do_index_by_seat=True):
        exists = CouchDbService.does_database_exist(db_name, server)

        if not exists:
            CouchDbService.create_database(db_name, server)
            if do_index_by_seat:
                CouchDbService.index_by_seat(db_name, server)
    
    @staticmethod
    def does_database_exist(db_name:str, server) -> bool:
        logger = AppLogger.get_logger()
        #server = CouchDbService.get_connection()
        if db_name in server:
            #logger.info(db_name + " exists")
            return True
    
        #logger.info(db_name + " does not exist")
        return False

    @staticmethod
    def create_database(db_name:str, server):
        logger = AppLogger.get_logger()
        server.create(db_name)
        logger.info("Created database: " + db_name)

    @staticmethod
    def delete_database(db_name:str, server):
        logger = AppLogger.get_logger()
        logger.info("Deleting database: " + db_name)
        server.delete(db_name)
        logger.info("Deleted database: " + db_name)

    @staticmethod
    def write_document(document:dict, db_name:str, server):
        logger = AppLogger.get_logger()
        db = server.database(db_name)
        doc = db.save(document)
    
    @staticmethod
    def write_out_documents(data_dict:dict, db_name:str, do_index_by_seat=True):
        logger = AppLogger.get_logger()
        server = CouchDbService.get_connection()

        #    def existence_check(server, db_name:str):
        CouchDbService.existence_check(server, db_name, do_index_by_seat)

        for k,data in data_dict.items():
            #logger.info(str(k) + " -> " + str(data))
            CouchDbService.write_document(data, db_name, server)

        # CouchDbService.query_all_readings(db_name, server)
        #CouchDbService.query_by_id(db_name, server, "15_Standing")
        #CouchDbService.index_by_seat(db_name, server)
        #CouchDbService.query_by_seat(db_name, server, "20")

    @staticmethod
    def query_all_readings(db_name:str, server):
        logger = AppLogger.get_logger()
        db = server.database(db_name)
        #print(str(dir(db)))

        results = db.all()

        readings = list()
        for row in results:
            doc = row["doc"]
            #logger.info(str(doc))

            # Skip design documents
            if doc.get("_id", "").startswith("_design/"):
                continue
            readings.append(row)
        
        return readings

    @staticmethod
    def query_by_id(db_name:str, server, id:str):
        logger = AppLogger.get_logger()
        db = server.database(db_name)
        #print(str(dir(db)))

        doc = db.get(id)
        if doc:
            #logger.info(str(doc))
            return doc
        else:
            logger.info(str(id) + ": document not found ")
            return {}

    @staticmethod
    def query_by_seat(db_name:str, server, seatNumber:str, seatKey:str):
        logger = AppLogger.get_logger()
        db = server.database(db_name)

        results = db.all()

        readings = list()
        for row in results:
            doc = row["doc"]
            #logger.info(str(doc))

            # Skip design documents
            if doc.get("_id", "").startswith("_design/"):
                continue

            # keep only the seat data with the seat number of interest
            #if doc.get("seatNumber") != seatNumber:
            if doc.get(seatKey) != seatNumber:
                continue

            readings.append(row)
        
        return readings

    @staticmethod
    def index_by_seat(db_name:str, server):
        logger = AppLogger.get_logger()
        db = server.database(db_name)

        design_doc = {
            "_id": "_design/seat_index",
            "views": {
                "by_seat": {
                    "map": "function(doc) { if (doc.seat) { emit(doc.seat, null); } }"
                }
            }
        }

        try:
            existing = db.get("_design/seat_index")
            design_doc["_rev"] = existing["_rev"]
            db.save(design_doc)
        except pycouchdb.exceptions.NotFound:
            db.save(design_doc)
