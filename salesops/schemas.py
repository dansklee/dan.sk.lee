"""Pydantic schemas for request/response payloads and structured LLM outputs."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Module 1 — pre-call research
# ---------------------------------------------------------------------------

class AccountSignal(BaseModel):
    name: str
    detail: str
    weight: int = Field(ge=1, le=5, description="1=weak, 5=critical")


class AccountInput(BaseModel):
    domain: str
    name: str
    industry: str | None = None
    size_band: str | None = None  # SMB | MM | ENT
    region: str | None = None
    raw_context: str = Field(default="", description="Free-form notes, web copy, news, 10-Ks, etc.")


class ResearchReport(BaseModel):
    fit_score: int = Field(ge=0, le=100)
    fit_rationale: str
    priority_signals: list[AccountSignal]
    active_initiatives: list[str] = Field(
        description="What the company is actively trying to achieve right now (from public signals)."
    )
    suggested_angles: list[str] = Field(
        description="Conversation angles that map our offer to their initiatives."
    )
    risks: list[str] = Field(default_factory=list)
    one_pager_markdown: str = Field(description="Full one-pager rendered in Markdown.")


# ---------------------------------------------------------------------------
# Module 2 — live conversation coach
# ---------------------------------------------------------------------------

class CoachRequest(BaseModel):
    account_id: int
    transcript_so_far: str = ""
    rep_question: str | None = Field(
        default=None,
        description="Optional explicit question from the rep, e.g. 'should I pitch tier-2 here?'",
    )


class CoachCard(BaseModel):
    talking_points: list[str]
    do_mention: list[str]
    do_not_mention: list[str]
    likely_objections: list[str]
    next_best_question: str
    confidence: int = Field(ge=0, le=100)


# ---------------------------------------------------------------------------
# Module 3 — post-call follow-up
# ---------------------------------------------------------------------------

class FollowUpRequest(BaseModel):
    call_id: int
    transcript: str
    rep_notes: str = ""


class FollowUpDoc(BaseModel):
    email_subject: str
    email_body_markdown: str
    internal_summary_markdown: str
    commitments: list[str] = Field(description="Things WE promised to do.")
    asks: list[str] = Field(description="Things THEY promised or we asked for.")
    next_steps: list[str]
    deal_health: Literal["green", "yellow", "red"]
    deal_health_rationale: str


# ---------------------------------------------------------------------------
# Module 4 — stakeholder enrichment
# ---------------------------------------------------------------------------

class Mention(BaseModel):
    full_name: str
    title_hint: str | None = None
    context: str = Field(description="The sentence or two from the transcript that mentioned them.")


class EnrichedContact(BaseModel):
    full_name: str
    title: str | None = None
    email: str | None = None
    linkedin_url: str | None = None
    seniority: str | None = None
    tenure_years: float | None = None
    background: str | None = None
    likely_priorities: list[str] = Field(default_factory=list)
    source: Literal["clearbit", "apollo", "linkedin", "stub", "llm_inferred"] = "stub"


# ---------------------------------------------------------------------------
# Module 5 — buying-process map
# ---------------------------------------------------------------------------

Archetype = Literal["champion", "economic_buyer", "user", "influencer", "blocker"]


class Stakeholder(BaseModel):
    name: str
    role: str
    archetype: Archetype
    motivations: str
    concerns: str
    influence: int = Field(ge=1, le=5)


class BuyingMap(BaseModel):
    stage: Literal["discovery", "evaluation", "selection", "negotiation", "closed"]
    stakeholders: list[Stakeholder]
    coverage_gaps: list[str] = Field(
        description="Roles/personas you haven't engaged yet but should."
    )
    decision_criteria: list[str]
    procurement_path: str = Field(
        description="Best guess at how procurement / legal / security will play out."
    )
    blockers: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Lessons-learning loop
# ---------------------------------------------------------------------------

class Lesson(BaseModel):
    pattern: str = Field(description="Short label, e.g. 'CFO-led ENT eval, mid-market tools'.")
    insight: str
    evidence: str | None = None
    confidence: float = Field(ge=0.0, le=1.0, default=0.6)
    industry: str | None = None
    size_band: str | None = None


class LessonExtraction(BaseModel):
    lessons: list[Lesson]
