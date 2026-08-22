from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime


class AnalyzeUrlRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def must_be_supported_reel_url(cls, v: str) -> str:
        v = v.strip()
        lowered = v.lower()
        if not lowered.startswith(("http://", "https://")):
            raise ValueError("Provide a full URL starting with https://")
        if not any(host in lowered for host in ("instagram.com", "instagr.am", "youtube.com/shorts", "youtu.be", "tiktok.com")):
            raise ValueError("Only Instagram Reels, YouTube Shorts and TikTok links are supported")
        return v


class DetectedCandidate(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    evidence: Optional[str] = None
    confidence: float
    category_hint: Optional[str] = None
    region_hint: Optional[str] = None
    match_status: str
    place_id: Optional[str] = None
    # Resolved place snapshot (null when the place couldn't be verified)
    place_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class InspirationAnalysis(BaseModel):
    """Full result of analyzing one inspiration import."""
    id: str
    source_type: str
    source_url: Optional[str] = None
    platform: Optional[str] = None
    caption: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    status: str
    error: Optional[str] = None
    created_at: datetime
    candidates: List[DetectedCandidate] = []

    model_config = ConfigDict(from_attributes=True)
