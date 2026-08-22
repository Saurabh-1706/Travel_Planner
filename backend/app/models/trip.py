from sqlalchemy import Column, String, Integer, JSON, DateTime, Date, ForeignKey
from datetime import datetime
from app.db.base import Base
import uuid


class Trip(Base):
    """An AI-generated itinerary over a set of chosen places."""
    __tablename__ = "trips"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    destination = Column(String, nullable=True)  # free text, e.g. "Goa" or region name
    start_date = Column(Date, nullable=True)
    num_days = Column(Integer, default=1, nullable=False)
    pace = Column(String, default="balanced", nullable=False)  # relaxed | balanced | packed
    interests = Column(JSON, default=list, nullable=False)

    # The generated plan: {"summary": ..., "days": [...], "tips": [...]}
    itinerary = Column(JSON, nullable=False)

    status = Column(String, default="planned", nullable=False)  # planned | completed | cancelled
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
