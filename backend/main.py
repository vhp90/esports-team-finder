from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes.teams import router as teams_router
from routes.auth import router as auth_router
from dependencies import get_db
import os
import logging
from dotenv import load_dotenv
import shutil
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://localhost:5173",  # Vite development server
]

logger.info(f"Configured CORS origins: {CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins since we're serving frontend from same domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(teams_router, prefix="/api/teams", tags=["teams"])

# Health check endpoint
@app.get("/api/health")
async def health():
    try:
        db = get_db()
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "database": str(e)}

# Serve frontend static files
@app.on_event("startup")
async def prepare_static_files():
    # Create static directory if it doesn't exist
    static_dir = Path("static")
    static_dir.mkdir(exist_ok=True)
    
    # Copy frontend build files to static directory
    frontend_build = Path("../frontend/dist")
    if frontend_build.exists():
        # Clear existing files
        if static_dir.exists():
            shutil.rmtree(static_dir)
        # Copy new files
        shutil.copytree(frontend_build, static_dir)
        logger.info("Frontend static files copied successfully")
    else:
        logger.warning("Frontend build directory not found")

# Mount static files
app.mount("/assets", StaticFiles(directory="static/assets"), name="static")

# Serve index.html for all other routes
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    static_file = Path("static") / full_path
    if static_file.exists() and static_file.is_file():
        return FileResponse(static_file)
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
