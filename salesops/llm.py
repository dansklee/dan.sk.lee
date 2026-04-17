"""Thin Claude wrapper used by every module.

Centralizes:
  - Model selection (Opus 4.7 by default; Haiku 4.5 for live-coach low-latency hops)
  - Adaptive thinking + effort defaults
  - Prompt-caching pattern: stable system prompt cached, volatile user payload appended
  - JSON-schema structured output via .messages.parse() helper
"""

from __future__ import annotations

import os
from typing import Any, TypeVar

import anthropic
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

OPUS = "claude-opus-4-7"
HAIKU = "claude-haiku-4-5"

_client: anthropic.Anthropic | None = None


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def parse(
    *,
    system: str,
    user: str,
    output_format: type[T],
    model: str = OPUS,
    max_tokens: int = 16000,
    cache_system: bool = True,
    effort: str = "high",
) -> T:
    """Send a request and parse the response into a Pydantic model.

    The system prompt is the stable prefix, so we mark it cacheable. The user
    payload is the volatile per-request content (account snapshot, transcript,
    etc.) and goes after.
    """
    system_blocks: list[dict[str, Any]] = [{"type": "text", "text": system}]
    if cache_system:
        system_blocks[0]["cache_control"] = {"type": "ephemeral"}

    response = client().messages.parse(
        model=model,
        max_tokens=max_tokens,
        thinking={"type": "adaptive"},
        output_config={"effort": effort},
        system=system_blocks,
        messages=[{"role": "user", "content": user}],
        output_format=output_format,
    )
    return response.parsed_output


def text(
    *,
    system: str,
    user: str,
    model: str = OPUS,
    max_tokens: int = 16000,
    cache_system: bool = True,
    effort: str = "high",
) -> str:
    """Plain text response. Used when output is markdown (follow-up doc, etc.)."""
    system_blocks: list[dict[str, Any]] = [{"type": "text", "text": system}]
    if cache_system:
        system_blocks[0]["cache_control"] = {"type": "ephemeral"}

    response = client().messages.create(
        model=model,
        max_tokens=max_tokens,
        thinking={"type": "adaptive"},
        output_config={"effort": effort},
        system=system_blocks,
        messages=[{"role": "user", "content": user}],
    )
    for block in response.content:
        if block.type == "text":
            return block.text
    return ""
