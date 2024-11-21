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
        existing_user = await db.users.find_one({"$or": [{"email": email}, {"username": username}]})
        if existing_user:
            if existing_user["email"] == email:
                logger.warning(f"User with email {email} already exists")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                logger.warning(f"Username {username} already exists")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
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
        
        return {"access_token": access_token, "token_type": "bearer", "username": username}
        
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
        username_or_email = form_data.username
        logger.info(f"Login attempt for: {username_or_email}")
        
        # Find user by username or email
        user = await db.users.find_one({
            "$or": [
                {"username": username_or_email},
                {"email": username_or_email}
            ]
        })
        
        if not user:
            logger.warning(f"User {username_or_email} not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not pwd_context.verify(form_data.password, user["password"]):
            logger.warning(f"Invalid password for user {username_or_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"]}
        )
        
        logger.info(f"Login successful for user {username_or_email}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": user["username"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/profile")
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
