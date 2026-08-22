from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.security import pwd_context, create_access_token
from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    email: str
    name: str | None = None

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=req.email,
        name=req.name,
        hashed_password=pwd_context.hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": create_access_token(subject=user.id),
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
        "access_token": create_access_token(subject=user.id),
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name
    }
