"""Downloads reels/shorts from pasted URLs via yt-dlp.

Instagram gates most server-side access behind login these days, so failures
are expected for some posts - the error messages steer users toward the
'Upload Video' path, which always works.
"""
import asyncio
import logging
import os
from typing import Any, Dict
from urllib.parse import urlparse

import yt_dlp

logger = logging.getLogger(__name__)

PLATFORM_HOSTS = {
    "instagram": ("instagram.com", "instagr.am"),
    "youtube": ("youtube.com", "youtu.be"),
    "tiktok": ("tiktok.com",),
}


class ReelFetchError(Exception):
    pass


def detect_platform(url: str) -> str:
    host = urlparse(url).netloc.lower()
    for platform, hosts in PLATFORM_HOSTS.items():
        if any(h in host for h in hosts):
            return platform
    return "unknown"


def _download(url: str, dest_dir: str) -> Dict[str, Any]:
    opts = {
        "outtmpl": os.path.join(dest_dir, "%(id)s.%(ext)s"),
        # No ffmpeg guaranteed on host -> must pick a pre-merged single file.
        "format": "best[ext=mp4]/best",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 20,
        "retries": 2,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    if not info:
        raise ReelFetchError("Could not read that link.")

    parts = [info.get("title"), info.get("description")]
    caption = ". ".join(p for p in parts if p)
    return {
        "path": ydl.prepare_filename(info),
        "caption": caption,
        "uploader": info.get("uploader") or info.get("channel") or "",
    }


async def fetch_reel(url: str, dest_dir: str) -> Dict[str, Any]:
    platform = detect_platform(url)
    if platform == "instagram" and not any(
        seg in url.lower() for seg in ("/reel/", "/reels/", "/p/", "/tv/")
    ):
        raise ReelFetchError("That Instagram link doesn't look like a reel or post.")

    os.makedirs(dest_dir, exist_ok=True)
    try:
        return await asyncio.to_thread(_download, url, dest_dir)
    except yt_dlp.utils.DownloadError as e:
        msg = str(e).lower()
        if any(s in msg for s in ("login", "cookies", "private", "rate-limit", "rate limit", "429", "authentication", "checkpoint")):
            raise ReelFetchError(
                "This reel can't be fetched automatically (private or rate-limited). "
                "Save it to your device and use 'Upload Video' instead."
            )
        raise ReelFetchError(
            "Could not download from that link. Try uploading the video instead."
        ) from e
