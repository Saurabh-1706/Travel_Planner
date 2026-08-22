"""Resolves AI-detected place names into real Place rows.

Two-step verification: local DB first (seeded/known places), then Photon
geocoding for anything new. Matched candidates get a persisted Place so they
can flow into bucket lists and trip generation.
"""
import logging
from difflib import SequenceMatcher
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.place import Place
from app.services.geocoding import search_external_places

logger = logging.getLogger(__name__)


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _find_local(db: Session, name: str) -> Optional[Place]:
    return (
        db.query(Place)
        .filter(func.lower(Place.name) == name.lower().strip())
        .first()
    )


def _create_from_geocode(db: Session, resolved: dict) -> Place:
    place = Place(
        name=resolved["name"],
        description=resolved.get("description"),
        latitude=resolved["latitude"],
        longitude=resolved["longitude"],
        address=resolved.get("address"),
        city=resolved.get("city"),
        state=resolved.get("state"),
        country=resolved.get("country"),
        category=resolved.get("category"),
        photos=resolved.get("photos") or [],
        activities=[],
        source_links=[],
        verification_status="verified",
    )
    db.add(place)
    db.flush()
    return place


async def resolve_candidate_to_place(
    db: Session, name: str, region_hint: Optional[str]
) -> Optional[Place]:
    """Returns an existing-or-new Place row, or None if unverifiable."""
    local = _find_local(db, name)
    if local:
        return local

    query = f"{name} {region_hint}" if region_hint else name
    results = await search_external_places(query, limit=5)
    if not results:
        return None

    best = max(results, key=lambda r: _similarity(name, r["name"]))
    if _similarity(name, best["name"]) < 0.3:
        logger.info("Rejected geocode match %r for candidate %r (too dissimilar)", best["name"], name)
        return None

    # Geocoder may return a slightly different spelling than our existing row;
    # check again against the matched name before creating a duplicate.
    existing = _find_local(db, best["name"])
    if existing:
        return existing
    return _create_from_geocode(db, best)
