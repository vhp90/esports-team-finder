from fastapi import FastAPI, HTTPException, Request
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

# Mount static files for the React app
try:
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    logger.info("Successfully mounted static files at /static")
except Exception as e:
    logger.error(f"Error mounting static files: {e}")

# Serve index.html for all non-API routes
@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    # Skip API routes
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    # Log the requested path
    logger.info(f"Requested path: {full_path}")
    
    # Try to serve static files first if they match the path
    static_file_path = static_dir / full_path
    if static_file_path.is_file():
        logger.info(f"Serving static file: {static_file_path}")
        return FileResponse(static_file_path)
    
    # Serve index.html for all other routes
    index_path = static_dir / "index.html"
    if index_path.exists():
        logger.info(f"Serving index.html for path: {full_path}")
        return FileResponse(index_path)
    
    # Log error if index.html doesn't exist
    logger.error(f"index.html not found in {static_dir}")
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Frontend files not found",
            "static_dir": str(static_dir),
            "requested_path": full_path,
            "request_headers": dict(request.headers)
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
