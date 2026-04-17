"""Module 1 — pre-call research, scoring, and the learning loop.

Pipeline:
  1. Pull account record + relevant past lessons (matched by industry/size_band).
  2. Build a system prompt that's stable across all research requests
     (cached at the Anthropic edge).
  3. Append the per-account payload as the user message.
  4. Get a structured ResearchReport back.
  5. Persist the report to calls.research_json so it can feed Module 2.

The learning loop closes in `followup.py` — every completed call mines lessons
from its transcript and writes them back to the lessons table, which this module
reads on the next run.
"""

from __future__ import annotations

import json
from typing import Any

from .. import db, llm
from ..schemas import AccountInput, ResearchReport

SYSTEM = """You are a senior account researcher for a B2B sales team.

Your job: given a target account and any context the rep already has, produce
a tight, high-signal account brief that the rep can read in 90 seconds before a
call. You also assign a fit score (0-100) for our offering.

Scoring rubric (calibrate strictly):
  90-100: clear, urgent fit; multiple buying signals; warm path in.
  70-89:  strong fit, signals present, no urgency yet.
  50-69:  plausible fit, weak signals, needs discovery.
  30-49:  marginal — niche overlap, no signals.
  0-29:   poor fit; deprioritize.

Rules:
  - Cite specific evidence from the provided context. Never invent facts.
  - If a field is unknown, say so explicitly rather than guessing.
  - "active_initiatives" must be grounded in observable signals (job posts,
    earnings calls, news, hiring patterns) — not generic "they want growth."
  - "suggested_angles" must connect their initiatives to a credible value
    hypothesis we could test on the call. Two to four angles, max.
  - "one_pager_markdown" is the artifact the rep actually reads. Use H2 sections:
    Snapshot, Why now, Active initiatives, Conversation angles, Risks.

Past lessons from prior calls in this segment will be supplied. Treat them as
priors — adjust scoring and angles when a lesson clearly applies, but call out
the lesson by name in your rationale so the rep can challenge it."""


def _format_lessons(lessons: list[dict[str, Any]]) -> str:
    if not lessons:
        return "(no prior lessons for this segment yet)"
    bullets = []
    for ls in lessons:
        bullets.append(
            f"- [{ls['pattern']}] (conf {ls['confidence']:.2f}) {ls['insight']}"
            + (f"\n    evidence: {ls['evidence']}" if ls.get("evidence") else "")
        )
    return "\n".join(bullets)


def run_research(account_in: AccountInput) -> tuple[int, ResearchReport]:
    """Research an account, persist it, return (account_id, report)."""
    account_id = db.upsert_account(
        domain=account_in.domain,
        name=account_in.name,
        industry=account_in.industry,
        size_band=account_in.size_band,
        region=account_in.region,
        signals={"raw_context_len": len(account_in.raw_context)},
    )

    lessons = db.relevant_lessons(account_in.industry, account_in.size_band)
    user_payload = (
        f"# Target account\n"
        f"Name: {account_in.name}\n"
        f"Domain: {account_in.domain}\n"
        f"Industry: {account_in.industry or 'unknown'}\n"
        f"Size band: {account_in.size_band or 'unknown'}\n"
        f"Region: {account_in.region or 'unknown'}\n\n"
        f"# Context the rep gathered\n{account_in.raw_context or '(none)'}\n\n"
        f"# Past lessons from similar accounts\n{_format_lessons(lessons)}\n"
    )

    report = llm.parse(
        system=SYSTEM,
        user=user_payload,
        output_format=ResearchReport,
    )

    # Persist as a draft call so the report is retrievable for Module 2.
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO calls (account_id, research_json, created_at) VALUES (?, ?, ?)",
            (account_id, json.dumps(report.model_dump()), db.now()),
        )

    return account_id, report
