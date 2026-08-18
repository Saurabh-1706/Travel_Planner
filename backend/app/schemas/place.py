from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class PlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    activities: List[str] = []
    estimated_visit_duration: Optional[str] = None
    opening_hours: Optional[str] = None
    entry_fee: Optional[str] = None
    best_time: Optional[str] = None
    best_season: Optional[str] = None
    difficulty: Optional[str] = None
    safety_notes: Optional[str] = None
    source_links: List[str] = []
    verification_status: str = "unverified"
    photos: List[str] = []

class PlaceCreate(PlaceBase):
    pass

class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    activities: Optional[List[str]] = None
    estimated_visit_duration: Optional[str] = None
    opening_hours: Optional[str] = None
    entry_fee: Optional[str] = None
    best_time: Optional[str] = None
    best_season: Optional[str] = None
    difficulty: Optional[str] = None
    safety_notes: Optional[str] = None
    source_links: Optional[List[str]] = None
    verification_status: Optional[str] = None
    photos: Optional[List[str]] = None

class PlaceInDBBase(PlaceBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

class Place(PlaceInDBBase):
    pass

