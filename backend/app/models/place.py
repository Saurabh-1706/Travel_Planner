from sqlalchemy import Column, String, Float, Text
from geoalchemy2 import Geometry
from app.db.base import Base
import uuid

class Place(Base):
    __tablename__ = "places"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=True)
    
    # Store lat/lon for easy access
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # PostGIS geometry column for spatial queries (SRID 4326 is standard GPS coord system)
    location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
