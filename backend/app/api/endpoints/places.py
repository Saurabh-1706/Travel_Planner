from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.place import Place as PlaceSchema, PlaceCreate
from app.models.place import Place
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=PlaceSchema, status_code=status.HTTP_201_CREATED)
async def create_place(place_in: PlaceCreate, db: Session = Depends(get_db)):
    # Create the Point string for PostGIS
    point_str = f"POINT({place_in.longitude} {place_in.latitude})"
    
    db_place = Place(
        name=place_in.name,
        description=place_in.description,
        category=place_in.category,
        latitude=place_in.latitude,
        longitude=place_in.longitude,
        location=point_str
    )
    
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    
    return db_place

@router.get("/search", response_model=List[PlaceSchema])
async def search_places(
    query: str = Query(..., min_length=2, description="Search term for the place"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    # Using SQLAlchemy ILIKE for search
    places = db.query(Place).filter(Place.name.ilike(f"%{query}%")).limit(limit).all()
    return places

@router.get("/{place_id}", response_model=PlaceSchema)
async def get_place_details(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    return place

@router.get("/{place_id}/nearby", response_model=List[PlaceSchema])
async def get_nearby_places(
    place_id: str, 
    radius_km: float = Query(5.0, ge=1.0, le=50.0),
    db: Session = Depends(get_db)
):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    # ST_DWithin uses meters when SRID=4326 and we cast to geography
    # ST_Distance computes the distance.
    radius_meters = radius_km * 1000
    
    # Query using GeoAlchemy2 ST_DWithin
    nearby = db.query(Place).filter(
        Place.id != place_id,
        func.ST_DWithin(
            func.ST_GeographyFromText(Place.location.ST_AsText()), 
            func.ST_GeographyFromText(place.location.ST_AsText()), 
            radius_meters
        )
    ).limit(5).all()
    
    return nearby

@router.get("/geocode/search")
async def geocode_location(address: str = Query(...)):
    # Mock geocoding endpoint since we don't have a Google Maps API key yet
    # Real implementation would call external geocoding service
    return {
        "address": address,
        "latitude": 18.5204,
        "longitude": 73.8567,
        "confidence": 0.9,
        "mock": True
    }

