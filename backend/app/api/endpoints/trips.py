from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.place import Place
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip import Trip as TripSchema, TripGenerateRequest
from app.services.ai import AIServiceError, generate_itinerary

router = APIRouter()


def _trip_title(plan_title: str, body: TripGenerateRequest, destination: Optional[str]) -> str:
    if plan_title:
        return plan_title
    if body.title:
        return body.title
    label = {1: "Day trip", 2: "Weekend"}.get(body.num_days, f"{body.num_days}-day trip")
    return f"{label} in {destination or 'unplanned'}"


@router.post("/generate", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
async def generate_trip(
    body: TripGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    places: List[Place] = []
    if body.place_ids:
        places = db.query(Place).filter(Place.id.in_(body.place_ids)).all()
        if not places:
            raise HTTPException(status_code=404, detail="None of the selected places were found")

    places_data = [
        {
            "name": p.name,
            "city": p.city,
            "state": p.state,
            "category": p.category,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "best_time": p.best_time,
        }
        for p in places
    ]
    destination = body.destination or (
        next((p.city or p.state for p in places if p.city or p.state), None)
    )

    try:
        plan = await generate_itinerary(
            places=places_data,
            num_days=body.num_days,
            pace=body.pace,
            interests=body.interests,
            start_date=body.start_date,
            destination=destination,
        )
    except AIServiceError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    trip = Trip(
        user_id=current_user.id,
        title=_trip_title(plan.title, body, destination),
        destination=destination,
        start_date=body.start_date,
        num_days=body.num_days,
        pace=body.pace,
        interests=body.interests,
        itinerary=plan.model_dump(),
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/", response_model=List[TripSchema])
async def list_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
        .all()
    )


@router.get("/{trip_id}", response_model=TripSchema)
async def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return None
