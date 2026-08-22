from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import List, Optional, Any, Literal
from datetime import date, datetime

Pace = Literal["relaxed", "balanced", "packed"]


class TripGenerateRequest(BaseModel):
    place_ids: List[str] = []
    destination: Optional[str] = None
    num_days: int = Field(default=3, ge=1, le=14)
    start_date: Optional[date] = None
    pace: Pace = "balanced"
    interests: List[str] = []
    title: Optional[str] = None

    @model_validator(mode="after")
    def check_has_input(self):
        if not self.place_ids and not (self.destination and self.destination.strip()):
            raise ValueError("Provide at least one bucket-list place or a destination")
        return self


class Trip(BaseModel):
    id: str
    title: str
    destination: Optional[str] = None
    start_date: Optional[date] = None
    num_days: int
    pace: str
    interests: List[str]
    itinerary: dict[str, Any]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
