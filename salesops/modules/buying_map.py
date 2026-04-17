"""Module 5 — buying-process map.

Aggregates everything we know about an account (research, enriched contacts,
all call transcripts) and asks Claude to map the buying committee:
  - Who's involved? In what archetype?
  - What does each one care about?
  - What roles are missing — who else should we be addressing?
  - Where in the process are we?
  - What's the procurement path likely to look like?

Persists the result to the stakeholders table so coverage gaps are visible in
the UI and surface back into Module 1 as a signal for the next research run.
"""

from __future__ import annotations

import json

from .. import db, llm
from ..schemas import BuyingMap

SYSTEM = """You are a deal-strategy lead. Given everything we know about a
target account — research, enriched contacts, every call transcript — map the
buying committee.

For each stakeholder we've identified or inferred:
  - archetype: champion | economic_buyer | user | influencer | blocker
    (use exactly one of these strings — no synonyms)
  - motivations: what gets them promoted, in their words if possible
  - concerns: what makes them say no
  - influence: 1 (low) to 5 (decisive)

Then identify coverage_gaps: archetypes/roles we have NOT engaged but almost
certainly need to (e.g. "no security stakeholder identified — for ENT deals
this stalls in legal review").

decision_criteria: the explicit and implicit criteria the committee will judge
us on. Order by importance.

procurement_path: best-guess narrative of how procurement, legal, security,
and finance will play out — call out specific gates (SOC2 review, MSA
negotiation, security questionnaire, etc.).

Be honest about what's inferred vs. what's evidenced in the transcripts."""


def _gather_context(account_id: int) -> dict:
    with db.connect() as conn:
        account = conn.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone()
        if not account:
            raise ValueError(f"account {account_id} not found")
        contacts = conn.execute(
            "SELECT full_name, title, enrichment_json FROM contacts WHERE account_id = ?",
            (account_id,),
        ).fetchall()
        calls = conn.execute(
            """SELECT transcript, follow_up_json, research_json FROM calls
               WHERE account_id = ? AND transcript IS NOT NULL
               ORDER BY created_at""",
            (account_id,),
        ).fetchall()
    return {
        "account": db.row_to_dict(account),
        "contacts": [db.row_to_dict(r) for r in contacts],
        "calls": [db.row_to_dict(r) for r in calls],
    }


def build_map(account_id: int) -> BuyingMap:
    ctx = _gather_context(account_id)
    user_payload = (
        f"# Account\n{json.dumps(ctx['account'], indent=2)}\n\n"
        f"# Known contacts ({len(ctx['contacts'])})\n"
        f"{json.dumps(ctx['contacts'], indent=2)}\n\n"
        f"# Calls so far ({len(ctx['calls'])})\n"
        f"{json.dumps(ctx['calls'], indent=2)}\n"
    )
    bmap = llm.parse(
        system=SYSTEM,
        user=user_payload,
        output_format=BuyingMap,
    )

    # Persist stakeholders so they're queryable / show up in coverage views.
    with db.connect() as conn:
        conn.execute("DELETE FROM stakeholders WHERE account_id = ?", (account_id,))
        for s in bmap.stakeholders:
            conn.execute(
                """INSERT INTO stakeholders (account_id, name, role, archetype,
                                             motivations, concerns, influence, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (account_id, s.name, s.role, s.archetype, s.motivations,
                 s.concerns, s.influence, db.now()),
            )
    return bmap
