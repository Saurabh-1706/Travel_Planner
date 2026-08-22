from sqlalchemy import Column, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import uuid

class BucketListItem(Base):
    __tablename__ = "bucket_list_items"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_bucket_list_user_place"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    place_id = Column(String, ForeignKey("places.id"), nullable=False, index=True)

    # Kept as the exact labels the UI displays, so the API needs no translation layer.
    status = Column(String, default="Want to Visit", nullable=False)  # Want to Visit | Planned | Visited
    source = Column(String, default="Manual", nullable=False)  # Instagram | Web | Friend | Manual

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    place = relationship("Place")
