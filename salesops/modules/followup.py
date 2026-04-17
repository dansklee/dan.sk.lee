"""Module 3 — post-call follow-up doc + lesson extraction.

Two things happen here:
  1. Generate the follow-up artifact (email + internal summary + commitments).
  2. Mine the transcript for transferable lessons and write them to the lessons
     table — that's the input the next research run reads.
"""

from __future__ import annotations

import json

from .. import db, llm
from ..schemas import FollowUpDoc, FollowUpRequest, LessonExtraction

FOLLOWUP_SYSTEM = """You are an SDR/AE chief-of-staff. After every call, you
produce a follow-up packet that includes:

  - email_subject: one line, specific, references something the prospect said.
  - email_body_markdown: 4-8 sentences. Recap their priorities in their words,
    state the next step clearly, attach any commitments we made. No fluff.
  - internal_summary_markdown: H2-section breakdown for the CRM/Slack channel.
  - commitments: explicit things WE promised to send/do/follow up on.
  - asks: explicit things THEY committed to OR specific asks we made of them.
  - next_steps: ordered list with owner + suggested due-date language.
  - deal_health: green | yellow | red.
  - deal_health_rationale: 1-2 sentences citing transcript evidence.

Anchor everything in the transcript. Quote short phrases (5-10 words) when they
prove the point. Never invent commitments the rep didn't make."""


LESSONS_SYSTEM = """You are a sales-process anthropologist. Read this single
call transcript and extract 1-5 transferable LESSONS — patterns that would
inform how a rep approaches a similar account in the future.

Good lessons:
  - "Mid-market fintech buyers ask about SOC2 in the first 5 minutes — lead
    with the trust page link."
  - "When the prospect frames their goal as cost-reduction (not growth), our
    ROI calculator lands harder than the case study."

Bad lessons (do NOT produce):
  - Restating what happened on this specific call.
  - Vague advice ('build rapport', 'listen actively').
  - Anything you can't ground in a specific moment of the transcript.

Each lesson needs: pattern (short label), insight (the lesson itself), evidence
(the transcript moment), confidence (0-1, how generalizable), and the segment
it likely applies to (industry + size_band) if you can infer it."""


def generate_follow_up(req: FollowUpRequest) -> FollowUpDoc:
    with db.connect() as conn:
        row = conn.execute(
            "SELECT account_id, research_json FROM calls WHERE id = ?", (req.call_id,)
        ).fetchone()
        if not row:
            raise ValueError(f"call {req.call_id} not found")
        account_id = row["account_id"]
        research = json.loads(row["research_json"]) if row["research_json"] else {}

    user_payload = (
        f"# Pre-call research (for context)\n{json.dumps(research, indent=2)}\n\n"
        f"# Transcript\n{req.transcript}\n\n"
        f"# Rep notes (raw)\n{req.rep_notes or '(none)'}\n"
    )

    doc = llm.parse(
        system=FOLLOWUP_SYSTEM,
        user=user_payload,
        output_format=FollowUpDoc,
    )

    # Persist the follow-up + transcript onto the call row.
    with db.connect() as conn:
        conn.execute(
            """UPDATE calls SET transcript = ?, follow_up_json = ?, rep_notes = ?
               WHERE id = ?""",
            (req.transcript, json.dumps(doc.model_dump()), req.rep_notes, req.call_id),
        )

    # Close the learning loop — extract lessons asynchronously-ish.
    _extract_and_store_lessons(call_id=req.call_id, account_id=account_id,
                               transcript=req.transcript, research=research)
    return doc


def _extract_and_store_lessons(*, call_id: int, account_id: int,
                                transcript: str, research: dict) -> None:
    account = db.get_account(account_id) or {}
    user_payload = (
        f"# Account segment\n"
        f"Industry: {account.get('industry') or 'unknown'}\n"
        f"Size band: {account.get('size_band') or 'unknown'}\n\n"
        f"# Transcript\n{transcript}\n\n"
        f"# Pre-call research used\n{json.dumps(research, indent=2)[:4000]}\n"
    )
    extracted = llm.parse(
        system=LESSONS_SYSTEM,
        user=user_payload,
        output_format=LessonExtraction,
        effort="medium",
    )
    if not extracted.lessons:
        return
    with db.connect() as conn:
        for ls in extracted.lessons:
            conn.execute(
                """INSERT INTO lessons (call_id, industry, size_band, pattern,
                                        insight, evidence, confidence, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (call_id,
                 ls.industry or account.get("industry"),
                 ls.size_band or account.get("size_band"),
                 ls.pattern, ls.insight, ls.evidence, ls.confidence, db.now()),
            )
