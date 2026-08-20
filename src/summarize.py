"""Optional Generative AI metadata enrichment.

Uses an OpenAI-compatible chat completions endpoint (OpenAI, or a local
self-hosted gateway via OPENAI_BASE_URL) to generate a narrative synopsis,
key themes and compliance flags from a transcript.

Degrades gracefully: if no OPENAI_API_KEY is configured (or the call fails)
every function returns None / empty values, so the rest of the pipeline is
never blocked. Uses only the `requests` dependency already in the project.
"""

import json
import logging
import os

import requests

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://api.openai.com/v1"
MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_CHARS = 12_000

_SYSTEM_PROMPT = (
    "You are a screenplay metadata assistant. Given a movie transcript, return JSON only "
    "with these keys: synopsis (2-3 sentence neutral summary of the story), "
    "themes (array of up to 6 key themes/subjects), "
    "compliance_flags (array of observed sensitive-content categories chosen from: "
    "violence, profanity, substance abuse, sexual content, none). "
    "Return strict JSON with no markdown."
)


def enabled() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _call_llm(user_content: str) -> dict | None:
    if not enabled():
        return None
    base_url = os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    try:
        resp = requests.post(
            f"{base_url}/chat/completions",
            headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY'].strip()}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
            },
            timeout=90,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as exc:
        logger.warning("LLM enrichment failed: %s", exc)
        return None


def generate(text: str, title: str = "") -> dict | None:
    """Return {'synopsis', 'themes', 'compliance_flags', 'model'} or None."""
    if not text or not text.strip():
        return None
    truncated = text[:MAX_CHARS]
    data = _call_llm(f"Title: {title or 'Untitled'}\n\nTranscript:\n{truncated}")
    if not data or not isinstance(data, dict):
        return None
    return {
        "synopsis": str(data.get("synopsis", "")).strip(),
        "themes": [str(t) for t in data.get("themes", []) if str(t).strip()][:6],
        "compliance_flags": [str(c) for c in data.get("compliance_flags", [])][:8],
        "model": MODEL,
    }