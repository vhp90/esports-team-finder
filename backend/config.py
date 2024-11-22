from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb+srv://admin:vhp327@cluster0.oel73.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    database_name: str = os.getenv("DATABASE_NAME", "esports_team_finder")

settings = Settings()
