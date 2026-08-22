import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger(__name__)

# Photon (https://photon.komoot.io) rather than Nominatim's plain /search:
# Nominatim only matches complete, well-formed queries ("Alibaug" works,
# "Alib" returns unrelated places from anywhere on earth). Photon is built
# for exactly this — ranked, typo-tolerant, prefix-aware results as the
# user types, which is what a search-as-you-go box needs.
PHOTON_URL = "https://photon.komoot.io/api/"

# Roughly India's bounding box (minLon, minLat, maxLon, maxLat). This app's
# destinations are all India-focused, and without some bias a short query
# like "Muk" mostly surfaces places in Central Europe/Africa that happen to
# share the prefix. Restricting to India keeps results actually relevant.
# Drop this (and the `bbox` param below) if the app ever goes international.
INDIA_BBOX = "68.1,6.5,97.4,35.5"

# Identifies this app to the Photon/OSM service, as required by its usage
# policy. Swap for a paid geocoding provider (or self-hosted Photon) before
# any real production traffic — the public instance is meant for light,
# non-commercial use and has no formal SLA.
HEADERS = {"User-Agent": "RoamlyTravelPlanner/1.0 (dev@roamly.local)"}

# Rough OSM key/value -> our Explore category buckets.
_CATEGORY_MAP = {
    "natural": "Nature", "waterway": "Nature", "wood": "Nature", "peak": "Nature",
    "leisure": "Adventure", "sport": "Adventure",
    "historic": "Heritage", "castle": "Heritage", "monument": "Heritage", "ruins": "Heritage", "tomb": "Heritage",
    "beach": "Coastal", "bay": "Coastal", "coastline": "Coastal",
    "city": "Urban", "town": "Urban", "administrative": "Urban",
}

def _guess_category(osm_key: Optional[str], osm_value: Optional[str]) -> Optional[str]:
    return _CATEGORY_MAP.get(osm_value or "") or _CATEGORY_MAP.get(osm_key or "")

async def search_external_places(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Look up real-world places by name via the Photon (OpenStreetMap) API.

    Returns a list of dicts shaped like our Place model's constructor kwargs
    (name, latitude, longitude, address, city, state, country, category).
    Never raises — geocoding is a nice-to-have, so any failure just yields
    no extra results and local search results still come back.
    """
    params = {"q": query, "limit": limit, "bbox": INDIA_BBOX}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(PHOTON_URL, params=params, headers=HEADERS)
            res.raise_for_status()
            data = res.json()
    except (httpx.HTTPError, ValueError) as e:
        logger.warning("Geocoding search for %r failed: %s: %s", query, type(e).__name__, e)
        return []

    places = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        name = props.get("name")
        coords = feature.get("geometry", {}).get("coordinates")
        if not name or not coords or len(coords) < 2:
            continue

        address_parts = [
            props.get("street"), props.get("district"), props.get("city"),
            props.get("state"), props.get("country"),
        ]
        places.append({
            "name": name,
            "description": None,
            "latitude": coords[1],
            "longitude": coords[0],
            "address": ", ".join(p for p in address_parts if p),
            "city": props.get("city") or props.get("county"),
            "state": props.get("state"),
            "country": props.get("country"),
            "category": _guess_category(props.get("osm_key"), props.get("osm_value")),
            "photos": [],
        })
    return places
