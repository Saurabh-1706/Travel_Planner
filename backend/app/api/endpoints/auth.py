from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.session import get_db
from app.models.user import User
from passlib.context import CryptContext
from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    email: str
    name: str | None = None

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In a full implementation, you would generate a JWT token here.
    # For NextAuth integration with credentials, we return user details 
    # and a mock access token that NextAuth will store in its JWT.
    return {
        "access_token": "mock-jwt-token-replace-me",
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name
    }

@router.post("/google")
async def google_login(
    req: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(
            email=req.email,
            name=req.name,
            hashed_password=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {
        "access_token": "mock-jwt-token-replace-me",
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name
    }
