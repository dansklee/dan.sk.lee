"""FastAPI app — wires the five modules to HTTP endpoints.

Run locally:
    uvicorn salesops.main:app --reload

Endpoints:
    POST   /research                 -> Module 1
    POST   /coach                    -> Module 2
    POST   /follow-up                -> Module 3
    POST   /enrich/{call_id}         -> Module 4
    POST   /buying-map/{account_id}  -> Module 5

    GET    /accounts/{account_id}
    GET    /accounts/{account_id}/contacts
    GET    /accounts/{account_id}/calls
    GET    /accounts/{account_id}/stakeholders
    GET    /lessons?industry=...&size_band=...
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException

from . import db
from .modules import buying_map, coach, enrichment, followup, research
from .schemas import (
    AccountInput,
    BuyingMap,
    CoachCard,
    CoachRequest,
    EnrichedContact,
    FollowUpDoc,
    FollowUpRequest,
    ResearchReport,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="SalesOps",
    description="AI sales-call copilot — pre-call research, live coaching, "
                "follow-up, enrichment, and buying-process mapping.",
    version="0.1.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Module endpoints
# ---------------------------------------------------------------------------

@app.post("/research", response_model=dict)
def post_research(payload: AccountInput) -> dict[str, Any]:
    account_id, report = research.run_research(payload)
    return {"account_id": account_id, "report": report.model_dump()}


@app.post("/coach", response_model=CoachCard)
def post_coach(payload: CoachRequest) -> CoachCard:
    return coach.coach(payload)


@app.post("/follow-up", response_model=FollowUpDoc)
def post_follow_up(payload: FollowUpRequest) -> FollowUpDoc:
    return followup.generate_follow_up(payload)


@app.post("/enrich/{call_id}", response_model=list[EnrichedContact])
def post_enrich(call_id: int) -> list[EnrichedContact]:
    with db.connect() as conn:
        row = conn.execute(
            "SELECT account_id, transcript FROM calls WHERE id = ?", (call_id,),
        ).fetchone()
    if not row:
        raise HTTPException(404, f"call {call_id} not found")
    if not row["transcript"]:
        raise HTTPException(400, "call has no transcript yet — submit follow-up first")
    return enrichment.enrich_transcript(row["account_id"], row["transcript"])


@app.post("/buying-map/{account_id}", response_model=BuyingMap)
def post_buying_map(account_id: int) -> BuyingMap:
    return buying_map.build_map(account_id)


# ---------------------------------------------------------------------------
# Read endpoints
# ---------------------------------------------------------------------------

@app.get("/accounts/{account_id}")
def get_account(account_id: int) -> dict[str, Any]:
    account = db.get_account(account_id)
    if not account:
        raise HTTPException(404, f"account {account_id} not found")
    return account


@app.get("/accounts/{account_id}/contacts")
def get_contacts(account_id: int) -> list[dict[str, Any]]:
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT * FROM contacts WHERE account_id = ? ORDER BY created_at",
            (account_id,),
        ).fetchall()
    return [db.row_to_dict(r) for r in rows]


@app.get("/accounts/{account_id}/calls")
def get_calls(account_id: int) -> list[dict[str, Any]]:
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT * FROM calls WHERE account_id = ? ORDER BY created_at DESC",
            (account_id,),
        ).fetchall()
    return [db.row_to_dict(r) for r in rows]


@app.get("/accounts/{account_id}/stakeholders")
def get_stakeholders(account_id: int) -> list[dict[str, Any]]:
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT * FROM stakeholders WHERE account_id = ? ORDER BY influence DESC",
            (account_id,),
        ).fetchall()
    return [db.row_to_dict(r) for r in rows]


@app.get("/lessons")
def get_lessons(industry: str | None = None,
                size_band: str | None = None,
                limit: int = 50) -> list[dict[str, Any]]:
    return db.relevant_lessons(industry, size_band, limit=limit)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
