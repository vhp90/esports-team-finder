from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
import logging
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL environment variable is not set")

try:
    client = AsyncIOMotorClient(MONGODB_URL)
    # Parse database name from MongoDB URL
    parsed_url = urlparse(MONGODB_URL)
    db_name = parsed_url.path.strip('/') or 'esports_team_finder'
    db = client[db_name]
    logger.info(f"Connected to MongoDB database: {db_name}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://esports-team-finder.onrender.com")
CORS_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",  # Local development
    "http://localhost:5173",  # Vite development
]

# Authentication configuration
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET environment variable is not set")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours default
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))  # 7 days default

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})  # Add token type
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Created access token for user: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Created refresh token for user: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating refresh token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create refresh token"
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info("Decoding JWT token")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check token type
        token_type = payload.get("type")
        if token_type != "access":
            logger.warning("Invalid token type")
            raise credentials_exception
            
        email: str = payload.get("sub")
        if email is None:
            logger.warning("No email found in token")
            raise credentials_exception
            
        logger.info(f"Looking up user with email: {email}")
        user = await db.users.find_one({"email": email})
        
        if user is None:
            logger.warning(f"No user found with email: {email}")
            raise credentials_exception
            
        logger.info(f"Successfully authenticated user: {email}")
        return user
        
    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception

async def get_db():
    return db
