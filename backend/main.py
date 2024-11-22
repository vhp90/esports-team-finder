from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from routes import auth, teams, notifications, chat
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
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Ensure the static directory exists and contains the frontend build
def copy_frontend_build():
    frontend_build = Path("../frontend/build")
    if frontend_build.exists():
        # Copy all files from frontend build to static directory
        for item in frontend_build.glob("*"):
            if item.is_file():
                shutil.copy2(item, static_dir)
            else:
                dest = static_dir / item.name
                if dest.exists():
                    shutil.rmtree(dest)
                shutil.copytree(item, dest)
        logger.info("Frontend build files copied to static directory")
    else:
        logger.warning("Frontend build directory not found")

# Copy frontend build files
copy_frontend_build()

# Mount static files
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

# Catch-all route for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    logger.info(f"Serving SPA for path: {full_path}")
    
    # Check for static file
    static_file = static_dir / full_path
    if static_file.is_file():
        return FileResponse(str(static_file))
    
    # Serve index.html for client-side routing
    index_html = static_dir / "index.html"
    if index_html.exists():
        return FileResponse(str(index_html))
    else:
        logger.error("index.html not found")
        raise HTTPException(status_code=404, detail="Frontend not built")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
