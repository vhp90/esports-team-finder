import subprocess
import sys
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_mongodb_running():
    try:
        # Try to run mongosh command
        result = subprocess.run(['mongosh', '--eval', 'db.version()', '--quiet'], 
                             capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def start_mongodb():
    try:
        # Start MongoDB service
        subprocess.run(['net', 'start', 'MongoDB'], check=True)
        logger.info("MongoDB service started successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to start MongoDB service: {e}")
        return False

def main():
    if not is_mongodb_running():
        logger.info("MongoDB is not running. Attempting to start...")
        if start_mongodb():
            # Wait for MongoDB to fully start
            time.sleep(5)
            if is_mongodb_running():
                logger.info("MongoDB is now running")
            else:
                logger.error("MongoDB failed to start properly")
                sys.exit(1)
    else:
        logger.info("MongoDB is already running")

if __name__ == "__main__":
    main()
