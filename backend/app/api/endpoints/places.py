from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import List, Optional
from math import radians, sin, cos, sqrt, atan2
from sqlalchemy.orm import Session
from app.schemas.place import Place as PlaceSchema, PlaceCreate
from app.models.place import Place
from app.db.session import get_db
from app.services.geocoding import search_external_places

router = APIRouter()

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

@router.get("/", response_model=List[PlaceSchema])
async def list_places(
    category: Optional[str] = Query(None, description="Filter by category, e.g. Nature"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    q = db.query(Place)
    if category and category.lower() != "all":
        q = q.filter(Place.category.ilike(category))
    return q.order_by(Place.name).limit(limit).all()

@router.post("/", response_model=PlaceSchema, status_code=status.HTTP_201_CREATED)
async def create_place(place_in: PlaceCreate, db: Session = Depends(get_db)):
    db_place = Place(**place_in.model_dump())
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
    # Places we already know about first...
    local = db.query(Place).filter(Place.name.ilike(f"%{query}%")).limit(limit).all()
    if len(local) >= limit:
        return local

    # ...then top up with real-world results from OpenStreetMap so search
    # isn't limited to the handful of seeded destinations. New finds are
    # persisted so they're explorable/saveable like any other place, and so
    # repeat searches don't keep re-geocoding the same query.
    external = await search_external_places(query, limit=limit - len(local))

    existing_names = {name.lower() for (name,) in db.query(Place.name).all()}
    new_places: List[Place] = []
    for data in external:
        name = (data.get("name") or "").strip()
        if not name or name.lower() in existing_names:
            continue
        existing_names.add(name.lower())
        db_place = Place(**data)
        db.add(db_place)
        new_places.append(db_place)

    if new_places:
        db.commit()
        for p in new_places:
            db.refresh(p)

    return local + new_places

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

    # Coarse bounding-box pre-filter (1 degree latitude ~= 111km), then an
    # exact haversine check in Python. Good enough at this dataset's scale;
    # swap for PostGIS ST_DWithin if/when running on Postgres+PostGIS.
    deg = radius_km / 111.0
    candidates = db.query(Place).filter(
        Place.id != place_id,
        Place.latitude.between(place.latitude - deg, place.latitude + deg),
        Place.longitude.between(place.longitude - deg, place.longitude + deg),
    ).all()

    nearby = [
        p for p in candidates
        if _haversine_km(place.latitude, place.longitude, p.latitude, p.longitude) <= radius_km
    ]
    return nearby[:5]
