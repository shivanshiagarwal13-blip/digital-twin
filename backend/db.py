"""
db.py – SQLite setup and CRUD helpers.

Tables
------
patients(id TEXT PK, name TEXT, age REAL, baseline_hb REAL, ferritin REAL,
         adherence_pct REAL, inflammation INTEGER, cause TEXT, simulated INTEGER)

readings(id INTEGER PK AUTOINCREMENT, patient_id TEXT FK, day INTEGER,
         hb REAL, adherence REAL)

DB path: env var IRONTWIN_DB or default "irontwin.db" in the project root.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_DB = str(ROOT / "irontwin.db")
DB_PATH: str = os.environ.get("IRONTWIN_DB", _DEFAULT_DB)


# ── connection ────────────────────────────────────────────────────────────────

@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
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


# ── schema ────────────────────────────────────────────────────────────────────

DDL = """
CREATE TABLE IF NOT EXISTS patients (
    id             TEXT    PRIMARY KEY,
    name           TEXT    NOT NULL,
    age            REAL    NOT NULL,
    baseline_hb    REAL    NOT NULL,
    ferritin       REAL    NOT NULL,
    adherence_pct  REAL    NOT NULL DEFAULT 88.0,
    inflammation   INTEGER NOT NULL DEFAULT 0,
    cause          TEXT    NOT NULL DEFAULT 'other',
    simulated      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id  TEXT    NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    day         INTEGER NOT NULL,
    hb          REAL    NOT NULL,
    adherence   REAL    NOT NULL DEFAULT 0.88,
    heart_rate  INTEGER DEFAULT NULL,
    steps       INTEGER DEFAULT NULL,
    UNIQUE(patient_id, day)
);
"""


def init_db() -> None:
    """Create tables if they do not exist, and apply column additions."""
    with get_conn() as conn:
        conn.executescript(DDL)
        # Safe migration if table previously existed without columns
        cursor = conn.cursor()
        cols = [c[1] for c in cursor.execute("PRAGMA table_info(readings)").fetchall()]
        if "heart_rate" not in cols:
            cursor.execute("ALTER TABLE readings ADD COLUMN heart_rate INTEGER DEFAULT NULL")
        if "steps" not in cols:
            cursor.execute("ALTER TABLE readings ADD COLUMN steps INTEGER DEFAULT NULL")
    print(f"[db] Initialised database at {DB_PATH}")


# ── patients CRUD ─────────────────────────────────────────────────────────────

def upsert_patient(
    id: str,
    name: str,
    age: float,
    baseline_hb: float,
    ferritin: float,
    adherence_pct: float = 88.0,
    inflammation: int = 0,
    cause: str = "other",
    simulated: int = 1,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO patients
                (id, name, age, baseline_hb, ferritin, adherence_pct, inflammation, cause, simulated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name, age=excluded.age,
                baseline_hb=excluded.baseline_hb, ferritin=excluded.ferritin,
                adherence_pct=excluded.adherence_pct, inflammation=excluded.inflammation,
                cause=excluded.cause, simulated=excluded.simulated
            """,
            (id, name, age, baseline_hb, ferritin, adherence_pct, inflammation, cause, simulated),
        )


def get_patient(id: str) -> sqlite3.Row | None:
    with get_conn() as conn:
        return conn.execute("SELECT * FROM patients WHERE id = ?", (id,)).fetchone()


def list_patients() -> list[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute("SELECT * FROM patients ORDER BY id").fetchall()


# ── readings CRUD ─────────────────────────────────────────────────────────────

def upsert_reading(
    patient_id: str,
    day: int,
    hb: float,
    adherence: float = 0.88,
    heart_rate: int | None = None,
    steps: int | None = None,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO readings (patient_id, day, hb, adherence, heart_rate, steps)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(patient_id, day) DO UPDATE SET
                hb=excluded.hb,
                adherence=excluded.adherence,
                heart_rate=excluded.heart_rate,
                steps=excluded.steps
            """,
            (patient_id, day, hb, adherence, heart_rate, steps),
        )


def get_readings(patient_id: str) -> list[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM readings WHERE patient_id = ? ORDER BY day",
            (patient_id,),
        ).fetchall()


def get_latest_reading(patient_id: str) -> sqlite3.Row | None:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM readings WHERE patient_id = ? ORDER BY day DESC LIMIT 1",
            (patient_id,),
        ).fetchone()
