from sqlalchemy import Column, String, Float, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import uuid


class Inspiration(Base):
    """One imported reel/post that the AI analyzed for places."""
    __tablename__ = "inspirations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # url = fetched from a pasted link, upload = video file shared by the user
    source_type = Column(String, nullable=False)  # url | upload
    source_url = Column(String, nullable=True)
    platform = Column(String, nullable=True)  # instagram | youtube | tiktok | upload

    # What we could read out of the content
    caption = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)  # speech found in the audio
    summary = Column(Text, nullable=True)     # AI's one-paragraph take on the content

    status = Column(String, default="processing", nullable=False)  # processing | completed | failed
    error = Column(Text, nullable=True)
    raw_response = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    candidates = relationship(
        "InspirationCandidate",
        back_populates="inspiration",
        cascade="all, delete-orphan",
        order_by="InspirationCandidate.order_index",
    )


class InspirationCandidate(Base):
    """A place the AI thinks appears in the inspiration, plus its verification result."""
    __tablename__ = "inspiration_candidates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    inspiration_id = Column(String, ForeignKey("inspirations.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)  # why the AI believes this (visual/audio clues)
    confidence = Column(Float, default=0.0, nullable=False)  # 0..1
    category_hint = Column(String, nullable=True)
    region_hint = Column(String, nullable=True)

    # Result of geocoding/verification: matched -> place_id points at a real Place row
    match_status = Column(String, default="pending", nullable=False)  # pending | matched | unresolved
    place_id = Column(String, ForeignKey("places.id"), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)

    inspiration = relationship("Inspiration", back_populates="candidates")
    place = relationship("Place")
