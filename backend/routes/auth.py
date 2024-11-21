from fastapi import APIRouter, HTTPException, Depends, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from dependencies import get_db, create_access_token, pwd_context, get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    games: str = Form(...),
    skill_level: str = Form(...),
    play_style: str = Form(...),
    db = Depends(get_db)
):
    try:
        logger.info(f"Attempting to register user with email: {email}")
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            logger.warning(f"User with email {email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = pwd_context.hash(password)
        
        # Prepare user document
        user_data = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "games": games.split(","),
            "skill_level": skill_level,
            "play_style": play_style,
            "created_at": datetime.utcnow()
        }
        
        # Insert user into database
        result = await db.users.insert_one(user_data)
        logger.info(f"Successfully created user with id: {result.inserted_id}")
        
        # Generate access token
        access_token = create_access_token(
            data={"sub": email}
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    try:
        logger.info(f"Login attempt for username: {form_data.username}")
        
        # Find user by username
        user = await db.users.find_one({"username": form_data.username})
        if not user:
            logger.warning(f"User {form_data.username} not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not pwd_context.verify(form_data.password, user["password"]):
            logger.warning(f"Invalid password for user {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"]}
        )
        
        logger.info(f"Login successful for user {form_data.username}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    # Remove sensitive information
    user_data = {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "games": current_user["games"],
        "skill_level": current_user["skill_level"],
        "play_style": current_user["play_style"],
    }
    return user_data
