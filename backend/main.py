from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes import auth, teams, notifications, chat
from dependencies import get_db
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
logger.info(f"Allowed CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# Health check endpoint
@app.get("/api/health")
async def health():
    try:
        db = get_db()
        await db.command("ping")
        return {"status": "healthy", "message": "API and database are operational"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}

# Static files handling
static_dir = Path(__file__).parent / "static"
logger.info(f"Static directory path: {static_dir}")

if not static_dir.exists():
    logger.warning(f"Creating static directory: {static_dir}")
    static_dir.mkdir(parents=True, exist_ok=True)

# List static directory contents
try:
    logger.info("Static directory contents:")
    for item in static_dir.iterdir():
        logger.info(f"- {item.name}")
except Exception as e:
    logger.error(f"Error listing static directory: {e}")

# Mount static files
try:
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
    logger.info("Successfully mounted static files at root path")
except Exception as e:
    logger.error(f"Failed to mount static files: {e}")
    raise

# Catch-all route for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Skip API routes
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Serve index.html for all other routes
    index_file = static_dir / "index.html"
    if index_file.exists():
        logger.info(f"Serving index.html for path: {full_path}")
        return FileResponse(index_file)
    else:
        logger.error(f"index.html not found in {static_dir}")
        raise HTTPException(
            status_code=404,
            detail="Frontend files not found. Please ensure the application is built correctly."
        )
