from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes import auth, teams, chat
from dependencies import CORS_ORIGINS
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# Ensure static directory exists
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Mount static files
try:
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    logger.info(f"Successfully mounted static files from {static_dir}")
except Exception as e:
    logger.error(f"Failed to mount static files: {e}")
    # Don't raise the error, as the directory might be empty during build

# Serve frontend
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    try:
        # Skip API routes
        if full_path.startswith("api/"):
            logger.debug(f"Skipping API route: {full_path}")
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Path to the static directory
        static_path = Path(__file__).parent / "static"
        logger.debug(f"Looking for file in static directory: {static_path}")
        
        # Try to serve the exact file if it exists
        requested_path = static_path / full_path
        if requested_path.is_file():
            logger.debug(f"Serving requested file: {requested_path}")
            return FileResponse(requested_path)
        
        # Look for index.html
        index_path = static_path / "index.html"
        if index_path.is_file():
            logger.debug(f"Serving index.html for path: {full_path}")
            return FileResponse(index_path)
            
        logger.warning(f"File not found: {full_path}")
        raise HTTPException(
            status_code=404,
            detail="File not found. Make sure the application is built correctly."
        )
    except Exception as e:
        logger.error(f"Error serving frontend: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
