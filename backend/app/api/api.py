from fastapi import APIRouter
from app.api.endpoints import places, auth, bucket_list, inspirations, trips

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(places.router, prefix="/places", tags=["places"])
api_router.include_router(bucket_list.router, prefix="/bucket-list", tags=["bucket-list"])
api_router.include_router(inspirations.router, prefix="/inspirations", tags=["inspirations"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
