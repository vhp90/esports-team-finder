from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
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

# Include API routers with proper prefixes
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
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "database": str(e)}
        )

# Static files configuration
static_dir = Path("static")

# First mount the static files for assets
if (static_dir / "static").exists():
    app.mount("/static", StaticFiles(directory=str(static_dir / "static")), name="static")

# Then mount the root static files
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="root")

# Catch-all route for SPA - this must be the last route
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Log the incoming request path
    logger.info(f"Serving SPA for path: {full_path}")
    
    # First check if the path exists as a static file
    requested_file = static_dir / full_path
    if requested_file.is_file():
        return FileResponse(str(requested_file))
    
    # If not a static file, serve index.html for client-side routing
    index_path = static_dir / "index.html"
    if not index_path.exists():
        logger.error(f"index.html not found at {index_path.absolute()}")
        return JSONResponse(
            status_code=404,
            content={"message": "Frontend not built"}
        )
    
    logger.info(f"Serving index.html for SPA routing")
    return FileResponse(str(index_path))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
