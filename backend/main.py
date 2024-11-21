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
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "database": str(e)}
        )

# Static files configuration
static_dir = Path("static")

# Mount static files if the directory exists
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
else:
    logger.warning(f"Static directory not found at {static_dir.absolute()}")

# Fallback route for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    index_path = static_dir / "index.html"
    if not index_path.exists():
        logger.error(f"index.html not found at {index_path.absolute()}")
        return JSONResponse(
            status_code=404,
            content={"message": "Frontend not built"}
        )
    return FileResponse(str(index_path))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
