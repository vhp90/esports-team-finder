from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.teams import router as teams_router
from routes.auth import router as auth_router
from dependencies import get_db
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # React development server
    "https://esports-team-finder.onrender.com",  # Production frontend
    "https://esports-team-finder-frontend.onrender.com",  # Alternative production frontend
    "https://esports-team-finder-static.onrender.com"  # Another possible frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(teams_router, prefix="/api/teams", tags=["teams"])

@app.get("/")
async def root():
    try:
        db = get_db()
        await db.command("ping")
        return {"message": "Welcome to the Esports Team Finder API! MongoDB connection successful."}
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {str(e)}")
        return {
            "message": "Welcome to the Esports Team Finder API!",
            "warning": "MongoDB connection failed",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
