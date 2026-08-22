from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional
from datetime import datetime
from app.schemas.place import Place as PlaceSchema

BucketStatus = Literal["Want to Visit", "Planned", "Visited"]
BucketSource = Literal["Instagram", "Web", "Friend", "Manual"]

class BucketListItemCreate(BaseModel):
    place_id: str
    status: BucketStatus = "Want to Visit"
    source: BucketSource = "Manual"

class BucketListItemUpdate(BaseModel):
    status: BucketStatus

class BucketListItem(BaseModel):
    id: str
    status: str
    source: str
    created_at: datetime
    place: PlaceSchema

    model_config = ConfigDict(from_attributes=True)
