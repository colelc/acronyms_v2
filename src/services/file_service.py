import csv
import json
import jsonlines
import re
from src.logging.app_logger import AppLogger

class FileService(object):

    @staticmethod
    def write_polling_data(filename:str, obj):
        logger = AppLogger.get_logger()
        #logger.info(str(filename) + " ")
        #logger.info(str(obj))
        with jsonlines.open(filename, "a") as writer:
            writer.write(obj)

    @staticmethod
    def append(filename:str, obj):
        logger = AppLogger.get_logger()
        #logger.info(str(filename) + " ")
        #logger.info(str(obj))
        with open(filename, "a") as f:
            f.write(json.dumps(obj) + "\n")

    @staticmethod
    def read_csv(filename:str) -> list:
        logger = AppLogger.get_logger()
        with open(filename, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            
            # Get all fieldnames except the first one
            fieldnames_omit_first = reader.fieldnames[1:]
            
            data = []
            for row in reader:
                # Build a new dict without the first column
                filtered_row = {k: v for k, v in row.items() if k in fieldnames_omit_first}
                data.append(filtered_row)
        
        for row in data:
            logger.info(str(row))
        
        return data

    @staticmethod
    def read_seat_map(filename:str) -> list:
        logger = AppLogger.get_logger()

        with open(filename, mode='r', newline='', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)

            #fieldnames = reader.fieldnames
            #first_key = fieldnames[0] if fieldnames else None
            
            data = []
            for row in reader:
                #logger.info(str(row))
                #if first_key in row:
                #    del row[first_key]
                #logger.info(str(row["x"]) + " " + str(row["y"]))
                data.append(row)
        
        return data