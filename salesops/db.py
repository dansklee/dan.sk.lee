"""SQLite persistence layer.

Schema is intentionally narrow — five tables that map to the five modules:
  - accounts: target companies
  - contacts: people we've enriched (one account → many contacts)
  - calls:    each call attempt (research_snapshot, transcript, follow_up, outcome)
  - lessons:  pattern-level insights mined from past calls (powers the learning loop)
  - stakeholders: buying-committee map per account (one account → many stakeholders)
"""

from __future__ import annotations

import json
import os
import sqlite3
import time
from contextlib import contextmanager
from typing import Any, Iterator

DB_PATH = os.environ.get("SALESOPS_DB_PATH", "./salesops.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    domain          TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    industry        TEXT,
    size_band       TEXT,
    region          TEXT,
    signals_json    TEXT NOT NULL DEFAULT '{}',
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    title           TEXT,
    email           TEXT,
    linkedin_url    TEXT,
    enrichment_json TEXT NOT NULL DEFAULT '{}',
    created_at      INTEGER NOT NULL,
    UNIQUE(account_id, full_name)
);

CREATE TABLE IF NOT EXISTS calls (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    scheduled_at    INTEGER,
    research_json   TEXT,
    transcript      TEXT,
    follow_up_json  TEXT,
    outcome         TEXT,
    rep_notes       TEXT,
    created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id         INTEGER REFERENCES calls(id) ON DELETE SET NULL,
    industry        TEXT,
    size_band       TEXT,
    pattern         TEXT NOT NULL,
    insight         TEXT NOT NULL,
    evidence        TEXT,
    confidence      REAL NOT NULL DEFAULT 0.5,
    created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stakeholders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id      INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL,
    archetype       TEXT NOT NULL,  -- champion | economic_buyer | user | influencer | blocker
    motivations     TEXT,
    concerns        TEXT,
    influence       INTEGER NOT NULL DEFAULT 3,  -- 1..5
    created_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_segment ON lessons(industry, size_band);
CREATE INDEX IF NOT EXISTS idx_calls_account ON calls(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_account ON stakeholders(account_id);
"""


def now() -> int:
    return int(time.time())


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    for k, v in list(d.items()):
        if k.endswith("_json") and isinstance(v, str):
            try:
                d[k] = json.loads(v)
            except json.JSONDecodeError:
                pass
    return d


def upsert_account(domain: str, name: str, **fields: Any) -> int:
    """Insert or update an account by domain. Returns the account id."""
    ts = now()
    signals = json.dumps(fields.pop("signals", {}) or {})
    with connect() as conn:
        cur = conn.execute(
            """INSERT INTO accounts (domain, name, industry, size_band, region,
                                     signals_json, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(domain) DO UPDATE SET
                   name = excluded.name,
                   industry = COALESCE(excluded.industry, accounts.industry),
                   size_band = COALESCE(excluded.size_band, accounts.size_band),
                   region = COALESCE(excluded.region, accounts.region),
                   signals_json = excluded.signals_json,
                   updated_at = excluded.updated_at
               RETURNING id""",
            (domain, name, fields.get("industry"), fields.get("size_band"),
             fields.get("region"), signals, ts, ts),
        )
        return cur.fetchone()[0]


def get_account(account_id: int) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone()
        return row_to_dict(row) if row else None


def relevant_lessons(industry: str | None, size_band: str | None,
                     limit: int = 20) -> list[dict[str, Any]]:
    """Pull lessons that match the account's segment, ranked by confidence."""
    with connect() as conn:
        rows = conn.execute(
            """SELECT * FROM lessons
               WHERE (industry IS NULL OR industry = ?)
                 AND (size_band IS NULL OR size_band = ?)
               ORDER BY confidence DESC, created_at DESC
               LIMIT ?""",
            (industry, size_band, limit),
        ).fetchall()
        return [row_to_dict(r) for r in rows]
