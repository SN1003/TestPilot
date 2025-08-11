from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import db
from ..schemas import UserCreate, UserLogin, Token, User
from ..auth import get_password_hash, authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter()

@router.post("/register", response_model=dict)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = db.execute_one(
        "SELECT username FROM users WHERE username = %s OR email = %s",
        (user.username, user.email)
    )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    query = """
        INSERT INTO users (username, email, password_hash) 
        VALUES (%s, %s, %s)
    """
    
    result = db.execute_query(query, (user.username, user.email, hashed_password))
    
    if result:
        return {"message": "User registered successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=dict)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user['id'],
        "username": current_user['username'],
        "email": current_user['email']
    }