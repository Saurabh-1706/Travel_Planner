from sqlalchemy import Column, String, Float, Text, JSON
from app.db.base import Base
import uuid

class Place(Base):
    __tablename__ = "places"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)

    activities = Column(JSON, default=list, nullable=False)
    estimated_visit_duration = Column(String, nullable=True)
    opening_hours = Column(String, nullable=True)
    entry_fee = Column(String, nullable=True)
    best_time = Column(String, nullable=True)
    best_season = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    safety_notes = Column(Text, nullable=True)
    source_links = Column(JSON, default=list, nullable=False)
    verification_status = Column(String, default="unverified", nullable=False)
    photos = Column(JSON, default=list, nullable=False)
