import logging
import os
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.inspiration import Inspiration, InspirationCandidate
from app.models.user import User
from app.schemas.inspiration import AnalyzeUrlRequest, DetectedCandidate, InspirationAnalysis
from app.services.ai import AIServiceError, analyze_caption_only, analyze_reel_video
from app.services.place_resolution import resolve_candidate_to_place
from app.services.reel_fetch import ReelFetchError, detect_platform, fetch_reel

logger = logging.getLogger(__name__)

router = APIRouter()


def _candidate_schema(cand: InspirationCandidate) -> DetectedCandidate:
    place = cand.place
    return DetectedCandidate(
        id=cand.id,
        name=cand.name,
        description=cand.description,
        evidence=cand.evidence,
        confidence=cand.confidence,
        category_hint=cand.category_hint,
        region_hint=cand.region_hint,
        match_status=cand.match_status,
        place_id=cand.place_id,
        place_name=place.name if place else None,
        city=place.city if place else None,
        state=place.state if place else None,
        country=place.country if place else None,
        latitude=place.latitude if place else None,
        longitude=place.longitude if place else None,
    )


def _analysis_schema(insp: Inspiration) -> InspirationAnalysis:
    return InspirationAnalysis(
        id=insp.id,
        source_type=insp.source_type,
        source_url=insp.source_url,
        platform=insp.platform,
        caption=insp.caption,
        transcript=insp.transcript,
        summary=insp.summary,
        status=insp.status,
        error=insp.error,
        created_at=insp.created_at,
        candidates=[_candidate_schema(c) for c in insp.candidates],
    )


def _get_user_inspiration(db: Session, inspiration_id: str, user: User) -> Inspiration:
    insp = (
        db.query(Inspiration)
        .options(joinedload(Inspiration.candidates).joinedload(InspirationCandidate.place))
        .filter(Inspiration.id == inspiration_id, Inspiration.user_id == user.id)
        .first()
    )
    if not insp:
        raise HTTPException(status_code=404, detail="Inspiration not found")
    return insp


async def _run_analysis(
    db: Session,
    user: User,
    *,
    source_type: str,
    platform: Optional[str],
    source_url: Optional[str],
    caption: str,
    video_path: Optional[str],
) -> Inspiration:
    """Shared pipeline: store the import, run AI, verify candidates, persist."""
    insp = Inspiration(
        user_id=user.id,
        source_type=source_type,
        source_url=source_url,
        platform=platform,
        caption=caption or None,
        status="processing",
    )
    db.add(insp)
    db.commit()
    db.refresh(insp)

    try:
        if video_path:
            analysis = await analyze_reel_video(video_path, caption)
        else:
            analysis = await analyze_caption_only(caption)

        insp.summary = analysis.summary or None
        insp.transcript = analysis.transcript_summary or None
        insp.raw_response = analysis.model_dump()

        for idx, cand in enumerate(analysis.places[:6]):
            place = await resolve_candidate_to_place(db, cand.name, cand.region_hint)
            db.add(
                InspirationCandidate(
                    inspiration_id=insp.id,
                    name=cand.name,
                    description=cand.description or None,
                    evidence="; ".join(cand.evidence[:3]) if cand.evidence else None,
                    confidence=max(0.0, min(1.0, cand.confidence)),
                    category_hint=cand.category_hint or None,
                    region_hint=cand.region_hint or None,
                    order_index=idx,
                    place_id=place.id if place else None,
                    match_status="matched" if place else "unresolved",
                )
            )
        insp.status = "completed"
        db.commit()
    except AIServiceError as e:
        detail = str(e) + (f" — {e.hint}" if e.hint else "")
        insp.status = "failed"
        insp.error = detail
        db.commit()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

    db.refresh(insp)
    return insp


@router.post("/analyze-url", response_model=InspirationAnalysis)
async def analyze_url(
    body: AnalyzeUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tmp_dir = tempfile.mkdtemp(prefix="roamly_")
    try:
        try:
            meta = await fetch_reel(body.url, tmp_dir)
        except ReelFetchError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

        title = meta.get("caption") or ""
        return await _run_analysis(
            db,
            current_user,
            source_type="url",
            platform=detect_platform(body.url),
            source_url=body.url,
            caption=title,
            video_path=meta["path"],
        )
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.post("/analyze-upload", response_model=InspirationAnalysis)
async def analyze_upload(
    video: UploadFile = File(...),
    caption: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = (video.content_type or "").lower()
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail="Please upload a video file")

    max_bytes = settings.MAX_VIDEO_UPLOAD_MB * 1024 * 1024
    suffix = Path(video.filename or "reel.mp4").suffix or ".mp4"
    suffix = "".join(ch for ch in suffix if ch.isalnum() and len(ch) < 8)[:7] or ".mp4"

    tmp_dir = tempfile.mkdtemp(prefix="roamly_")
    tmp_path = os.path.join(tmp_dir, f"upload{suffix}")
    size = 0
    try:
        with open(tmp_path, "wb") as out:
            while chunk := await video.read(1024 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Video too large (max {settings.MAX_VIDEO_UPLOAD_MB}MB)",
                    )
                out.write(chunk)

        return await _run_analysis(
            db,
            current_user,
            source_type="upload",
            platform="upload",
            source_url=None,
            caption=caption,
            video_path=tmp_path,
        )
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.get("/", response_model=List[InspirationAnalysis])
async def list_inspirations(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Inspiration)
        .options(joinedload(Inspiration.candidates).joinedload(InspirationCandidate.place))
        .filter(Inspiration.user_id == current_user.id)
        .order_by(Inspiration.created_at.desc())
        .limit(min(limit, 50))
        .all()
    )
    return [_analysis_schema(r) for r in rows]


@router.delete("/{inspiration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inspiration(
    inspiration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    insp = _get_user_inspiration(db, inspiration_id, current_user)
    db.delete(insp)
    db.commit()
    return None
