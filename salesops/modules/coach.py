"""Module 2 — live conversation coach.

Called repeatedly during a live call. Latency-sensitive, so we route to Haiku 4.5
unless the rep explicitly asks for a deep think (then Opus 4.7).

Inputs:
  - The cached research report for the account.
  - The transcript so far.
  - Optional explicit rep question.

Output: a CoachCard the UI renders next to the live call.
"""

from __future__ import annotations

import json

from .. import db, llm
from ..schemas import CoachCard, CoachRequest

SYSTEM = """You are an in-ear coach whispering to a sales rep on a live call.

You will be given:
  1. The pre-call research report (account context, signals, angles).
  2. The transcript of the call so far.
  3. Optionally, an explicit question from the rep.

Produce a CoachCard with:
  - talking_points: 3-5 things the rep should weave in NOW based on what's been
    said. Make them specific to what just happened in the transcript.
  - do_mention: things the prospect is signaling interest in — name them back.
  - do_not_mention: things to avoid (competitor pain, irrelevant features,
    over-promised timelines, sensitive topics flagged in research).
  - likely_objections: what the prospect is about to push back on, based on
    their tone and what they've already said.
  - next_best_question: ONE question to ask next that advances the deal.
  - confidence: how confident you are in this read (0-100).

Be terse. The rep is reading this in 2 seconds while the prospect talks. Use
short bullets, no preamble, no hedging. If the transcript is empty (call just
started), focus on opener strategy."""


def coach(req: CoachRequest) -> CoachCard:
    with db.connect() as conn:
        row = conn.execute(
            """SELECT research_json FROM calls
               WHERE account_id = ? AND research_json IS NOT NULL
               ORDER BY created_at DESC LIMIT 1""",
            (req.account_id,),
        ).fetchone()

    research = json.loads(row["research_json"]) if row else {}
    user_payload = (
        f"# Pre-call research\n{json.dumps(research, indent=2)}\n\n"
        f"# Transcript so far\n{req.transcript_so_far or '(call has not started)'}\n\n"
        f"# Rep question\n{req.rep_question or '(none — surface what matters)'}\n"
    )

    return llm.parse(
        system=SYSTEM,
        user=user_payload,
        output_format=CoachCard,
        model=llm.HAIKU,
        max_tokens=2000,
        effort="medium",
    )
