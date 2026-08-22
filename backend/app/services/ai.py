"""Gemini-powered AI service: reel place-detection + trip itinerary generation.

One model (gemini-2.0-flash) handles everything — it natively ingests video
(frames + audio) which is exactly what "find the unnamed places in this reel"
needs: no separate Whisper/ffmpeg pipeline required.
"""
import asyncio
import logging
from datetime import date
from typing import List, Optional

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Raised when AI analysis/generation fails. `hint` carries setup advice."""

    def __init__(self, message: str, hint: Optional[str] = None):
        super().__init__(message)
        self.hint = hint


# ---------------------------------------------------------------- schemas ---
# These double as Gemini's structured-output (response) schema, so the model
# is forced to answer in exactly this shape.

class DetectedPlace(BaseModel):
    name: str = Field(description="Specific place or landmark name")
    description: str = Field(default="", description="What it is and why worth visiting")
    confidence: float = Field(default=0.0, description="0.0-1.0 certainty this exact place appears")
    evidence: List[str] = Field(default_factory=list, description="Concrete visual/audio/caption clues behind this guess")
    category_hint: Optional[str] = Field(default=None, description="Beach | Nature | Heritage | Adventure | Urban | Spiritual | Food")
    region_hint: Optional[str] = Field(default=None, description="Likely region/state/country, e.g. 'North Goa, India'")


class ReelAnalysis(BaseModel):
    summary: str = Field(default="", description="Short paragraph describing the content")
    transcript_summary: str = Field(default="", description="Anything spoken/sung relevant to the location; empty if none")
    places: List[DetectedPlace] = Field(default_factory=list, max_length=6)


class ItineraryActivity(BaseModel):
    time: str = Field(description="Suggested start time like '09:00'")
    title: str
    description: str = ""
    place_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tips: Optional[str] = Field(default=None, description="Entry fee / timing / transport advice")


class ItineraryDay(BaseModel):
    day_number: int
    title: str
    summary: str = ""
    activities: List[ItineraryActivity]


class ItineraryPlan(BaseModel):
    title: str
    summary: str = ""
    days: List[ItineraryDay]
    tips: List[str] = Field(default_factory=list)


# ------------------------------------------------------------------ client ---

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if not settings.GEMINI_API_KEY:
        raise AIServiceError(
            "AI features are not configured on this server.",
            hint="Set GEMINI_API_KEY in backend/.env (free key: https://aistudio.google.com/apikey)",
        )
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def _upload_and_wait(file_path: str) -> types.File:
    client = _get_client()
    f = await client.aio.files.upload(file=file_path)
    # Files API processes videos asynchronously before they can be referenced.
    while f.state == types.FileState.PROCESSING:
        await asyncio.sleep(2)
        f = await client.aio.files.get(name=f.name)
    if f.state == types.FileState.FAILED:
        raise AIServiceError("Google's API could not process that video file.")
    return f


# ------------------------------------------------------- reel place search ---

_REEL_SYSTEM = (
    "You are a geo-detection specialist for a travel app. You watch short travel "
    "videos and identify where they were filmed. Creators often deliberately do "
    "NOT name the location - you must find it from visual and audio evidence."
)

_REEL_PROMPT = """Analyze this travel content and identify WHERE it was filmed.

Use every available signal:
- Landmarks, monuments, distinctive architecture, viewpoints
- Text on signage, shops, license plates, boats (any language)
- Terrain: beaches, cliffs, mountains, backwaters, desert, snow
- Vegetation, wildlife, weather, time of day
- Food, clothing, vehicles, flags, currency
- Spoken words, accents, background music lyrics

Creator's caption (may be empty):
\"\"\"
{caption}
\"\"\"

Rules:
- Only report places with concrete evidence. Never invent names.
- Prefer SPECIFIC spots (named beach, fort, cafe, trail) over whole cities.
- If only a broader area can be pinned down, say so in the name (e.g. "Vagator area, North Goa").
- confidence: >0.8 near-certain, 0.4-0.7 strong guess, <0.3 vague hunch.
- Maximum 6 candidates, most likely first. Empty list if nothing identifiable."""


async def analyze_reel_video(video_path: str, caption: str = "") -> ReelAnalysis:
    """Full analysis: upload video to Gemini, get structured place candidates."""
    client = _get_client()
    try:
        f = await _upload_and_wait(video_path)
        part = types.Part.from_uri(file_uri=f.uri, mime_type=f.mime_type or "video/mp4")
        resp = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[part, _REEL_PROMPT.format(caption=caption)],
            config=types.GenerateContentConfig(
                system_instruction=_REEL_SYSTEM,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=ReelAnalysis,
            ),
        )
        return resp.parsed or ReelAnalysis()
    except AIServiceError:
        raise
    except Exception as e:
        logger.exception("Gemini video analysis failed")
        raise AIServiceError(f"AI analysis failed: {type(e).__name__}") from e


async def analyze_caption_only(caption: str) -> ReelAnalysis:
    """Fallback when we have no video: work from caption/hashtags alone."""
    client = _get_client()
    prompt = (
        "The following is a travel influencer's caption (often just emojis and "
        "hashtags). Guess which specific places it refers to.\n\n"
        f"Caption:\n\"\"\"\n{caption}\n\"\"\"\n\n" + _REEL_PROMPT.split("Use every available signal")[0]
        + "Rules:\n- Hashtag clues (#goa, #vagator) are strong signals; emoji and phrases like 'sunset cliffs' add context.\n"
        "- Never invent names. Maximum 6 candidates, most likely first. Empty list if nothing identifiable."
    )
    try:
        resp = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction=_REEL_SYSTEM,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=ReelAnalysis,
            ),
        )
        return resp.parsed or ReelAnalysis()
    except AIServiceError:
        raise
    except Exception as e:
        logger.exception("Gemini caption analysis failed")
        raise AIServiceError(f"AI analysis failed: {type(e).__name__}") from e


# ------------------------------------------------------ itinerary planning ---

_ITINERARY_PROMPT = """You are an expert local trip planner. Design a {num_days}-day trip.

Pace: {pace} ({pacing_hint})
Interests: {interests}
{destination_line}{start_line}
Places that MUST be included (cluster them sensibly by geography):
{places_block}

Rules:
- Never put far-apart regions on the same day unless unavoidable.
- Fill gaps ONLY with real nearby gems consistent with the interests.
- Include meal stops at locally-known food spots matching the interests.
- Every activity gets one short practical tip (entry/timing/transport).
- Titles are evocative, not generic ("Golden hour at Chapora", not "Visit fort")."""


async def generate_itinerary(
    places: List[dict],
    num_days: int,
    pace: str,
    interests: List[str],
    start_date: Optional[date] = None,
    destination: Optional[str] = None,
) -> ItineraryPlan:
    client = _get_client()
    lines = []
    for p in places:
        line = f"- {p['name']} ({p.get('city') or p.get('state') or 'unknown area'})"
        line += f" coords={p['latitude']:.4f},{p['longitude']:.4f}"
        if p.get("category"):
            line += f" type={p['category']}"
        if p.get("best_time"):
            line += f" best_time={p['best_time']}"
        lines.append(line)
    pacing = {"relaxed": "about 2-3 activities per day", "balanced": "3-4 activities per day",
              "packed": "5+ activities per day"}.get(pace, "3-4 activities per day")

    prompt = _ITINERARY_PROMPT.format(
        num_days=num_days,
        pace=pace,
        pacing_hint=pacing,
        interests=", ".join(interests) if interests else "general sightseeing",
        destination_line=f"Base area: {destination}\n" if destination else "",
        start_line=f"Start date: {start_date.isoformat()}\n" if start_date else "",
        places_block="\n".join(lines) if lines else "(no pinned places - plan around the base area)",
    )
    try:
        resp = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are Roamly's trip planner. You output real-world accurate, "
                    "logistically sane itineraries as strict JSON."
                ),
                temperature=0.6,
                response_mime_type="application/json",
                response_schema=ItineraryPlan,
            ),
        )
        plan = resp.parsed
        if plan is None:
            raise AIServiceError("AI returned an unreadable itinerary.")
        return plan
    except AIServiceError:
        raise
    except Exception as e:
        logger.exception("Gemini itinerary generation failed")
        raise AIServiceError(f"AI itinerary generation failed: {type(e).__name__}") from e
