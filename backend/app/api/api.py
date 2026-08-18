from fastapi import APIRouter
from app.api.endpoints import places, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(places.router, prefix="/places", tags=["places"])

