"""Module 4 — auto-enrich every person mentioned during the call.

Pipeline:
  1. Detect mentions in the transcript (LLM call).
  2. For each mention, hit the enrichment provider (Clearbit/Apollo/LinkedIn).
     Providers are stubbed — replace `_provider_lookup` with real API calls.
  3. Fall back to LLM-inferred profile when the provider returns nothing.
  4. Upsert the contact + return the enriched list so the one-pager can
     personalize.
"""

from __future__ import annotations

import json
import os
from typing import Any

from pydantic import BaseModel

from .. import db, llm
from ..schemas import EnrichedContact, Mention

DETECT_SYSTEM = """You read sales-call transcripts and extract every PERSON
mentioned (besides the rep and their teammates). For each mention, return:
  - full_name (best guess from context — combine first/last if needed)
  - title_hint (any title cue the speaker dropped)
  - context (the short transcript snippet where they were mentioned)

Skip self-references ("our CFO Jane" — only count Jane if she's clearly named).
Skip companies/products. Return an empty list if no people are mentioned."""


class MentionExtraction(BaseModel):
    mentions: list[Mention]


def detect_mentions(transcript: str) -> list[Mention]:
    if not transcript.strip():
        return []
    result = llm.parse(
        system=DETECT_SYSTEM,
        user=f"# Transcript\n{transcript}",
        output_format=MentionExtraction,
        effort="medium",
    )
    return result.mentions


def _provider_lookup(full_name: str, account_domain: str) -> dict[str, Any] | None:
    """Stub for Clearbit/Apollo/LinkedIn enrichment.

    Replace this with real provider calls. Reads provider keys from env;
    returns None if no key is configured (caller falls back to LLM inference).
    """
    if os.environ.get("CLEARBIT_API_KEY"):
        # TODO: hit https://person.clearbit.com/v2/combined/find
        return None
    if os.environ.get("APOLLO_API_KEY"):
        # TODO: hit https://api.apollo.io/v1/people/match
        return None
    return None


INFER_SYSTEM = """You are an OSINT analyst. Given a person's name, the company
they're associated with, and the context they were mentioned in, produce your
best-effort profile. Be honest about uncertainty — when you don't know
something, leave the field null. Do NOT fabricate emails or LinkedIn URLs.

Focus `likely_priorities` on what someone in this role at this company is
likely paid to care about (their KPIs, their political pressures), not generic
job descriptions."""


def enrich_one(mention: Mention, account_domain: str,
                account_industry: str | None) -> EnrichedContact:
    provider_data = _provider_lookup(mention.full_name, account_domain)
    if provider_data:
        return EnrichedContact(**provider_data)

    payload = (
        f"# Person\nName: {mention.full_name}\n"
        f"Title hint: {mention.title_hint or 'unknown'}\n"
        f"Mentioned in context: {mention.context}\n\n"
        f"# Company\nDomain: {account_domain}\n"
        f"Industry: {account_industry or 'unknown'}\n"
    )
    return llm.parse(
        system=INFER_SYSTEM,
        user=payload,
        output_format=EnrichedContact,
        effort="medium",
    )


def enrich_transcript(account_id: int, transcript: str) -> list[EnrichedContact]:
    account = db.get_account(account_id)
    if not account:
        raise ValueError(f"account {account_id} not found")

    mentions = detect_mentions(transcript)
    enriched: list[EnrichedContact] = []
    for m in mentions:
        contact = enrich_one(m, account["domain"], account.get("industry"))
        enriched.append(contact)
        with db.connect() as conn:
            conn.execute(
                """INSERT INTO contacts (account_id, full_name, title, email,
                                         linkedin_url, enrichment_json, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(account_id, full_name) DO UPDATE SET
                       title = COALESCE(excluded.title, contacts.title),
                       email = COALESCE(excluded.email, contacts.email),
                       linkedin_url = COALESCE(excluded.linkedin_url, contacts.linkedin_url),
                       enrichment_json = excluded.enrichment_json""",
                (account_id, contact.full_name, contact.title, contact.email,
                 contact.linkedin_url, json.dumps(contact.model_dump()), db.now()),
            )
    return enriched
