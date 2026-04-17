# SalesOps

AI sales-call copilot built on the Anthropic SDK (Claude Opus 4.7 + Haiku 4.5).
Five modules covering the full lifecycle of an outbound call:

| # | Module | Endpoint | What it does |
|---|---|---|---|
| 1 | **Research** | `POST /research` | Researches the account, scores fit (0-100), generates a one-pager, and gets sharper with every call by mining lessons from past transcripts. |
| 2 | **Live coach** | `POST /coach` | Whispers talking points, things to mention/avoid, likely objections, and the next-best-question — based on the live transcript. |
| 3 | **Follow-up** | `POST /follow-up` | Generates the follow-up email + internal summary + commitments + asks + deal-health, then mines the call for transferable lessons. |
| 4 | **Enrichment** | `POST /enrich/{call_id}` | Detects every person mentioned in the transcript, looks them up in your provider of choice (Clearbit/Apollo/LinkedIn — stubbed), falls back to LLM-inferred profiles. |
| 5 | **Buying map** | `POST /buying-map/{account_id}` | Maps the buying committee — archetypes, motivations, concerns, influence, coverage gaps, decision criteria, procurement path. |

Storage is SQLite (single file). The framework is FastAPI. No frontend ships
in this repo — wire up your own.

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
export $(grep -v '^#' .env | xargs)
uvicorn salesops.main:app --reload
```

OpenAPI docs: <http://localhost:8000/docs>.

## Architecture notes

- **Model selection.** Opus 4.7 for research, follow-up, enrichment-inference,
  and buying-map (intelligence-sensitive). Haiku 4.5 for live coaching
  (latency-sensitive). Both use adaptive thinking.
- **Prompt caching.** Every module sends a stable system prompt (cached at the
  Anthropic edge) followed by the per-request payload. This keeps cost down on
  hot paths like `/coach` (called repeatedly during a single call).
- **Structured outputs.** Each module returns a Pydantic model via
  `client.messages.parse()` — no string-parsing on the response.
- **Learning loop.** When `/follow-up` runs, a second Claude call mines the
  transcript for transferable lessons (industry + size_band tagged) and writes
  them to the `lessons` table. The next `/research` call for a similar account
  reads them as priors. The system literally gets better with every call.

## Module flow

```
   research ──► call happens ──► coach (live)
       ▲                              │
       │                              ▼
   lessons ◄── follow-up ◄── enrichment ──► buying_map
```

## Replacing the enrichment stub

`salesops/modules/enrichment.py::_provider_lookup` is the only shim. Drop
real Clearbit/Apollo/LinkedIn calls in there — return `None` to fall back to
LLM inference, or a dict matching the `EnrichedContact` schema to skip it.

## What's intentionally NOT here

- Auth / multi-tenancy. Single-user assumption; add a JWT middleware before
  shipping.
- A frontend. Wire up Next.js or Slack — the API is yours.
- Transcription. Pipe Deepgram / AssemblyAI / Whisper into `/coach`'s
  `transcript_so_far` and `/follow-up`'s `transcript`.
- A queue. Lessons extraction runs inline in `/follow-up`. Move it to Celery /
  RQ if response time matters.
