from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from routes import auth, teams, notifications, chat
from dependencies import get_db
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers with proper prefixes
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
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "database": str(e)}
        )

# Static files configuration
static_dir = Path(__file__).parent / "static"
logger.info(f"Static directory path: {static_dir}")

# Ensure static directory exists
if not static_dir.exists():
    logger.warning(f"Static directory does not exist at {static_dir}")
    static_dir.mkdir(exist_ok=True)
    logger.info("Created static directory")

# List files in static directory for debugging
logger.info("Files in static directory:")
try:
    for item in static_dir.rglob("*"):
        if item.is_file():
            logger.info(f"Found file: {item.relative_to(static_dir)}")
except Exception as e:
    logger.error(f"Error listing static files: {e}")

# Check for index.html
index_path = static_dir / "index.html"
if index_path.exists():
    logger.info("index.html found in static directory")
else:
    logger.error("index.html not found in static directory")

# Mount static files for the React app
try:
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
    logger.info("Successfully mounted static files")
except Exception as e:
    logger.error(f"Error mounting static files: {e}")

# Catch-all route for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    logger.info(f"Serving SPA for path: {full_path}")
    
    # Try to serve the requested file from static directory
    requested_file = static_dir / full_path
    if requested_file.is_file():
        logger.info(f"Serving static file: {requested_file}")
        return FileResponse(str(requested_file))
    
    # For all other routes, serve index.html
    index_file = static_dir / "index.html"
    if index_file.exists():
        logger.info(f"Serving index.html for path: {full_path}")
        return FileResponse(str(index_file))
    
    logger.error(f"index.html not found in {static_dir}")
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Frontend files not found",
            "static_dir": str(static_dir),
            "requested_path": full_path
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
