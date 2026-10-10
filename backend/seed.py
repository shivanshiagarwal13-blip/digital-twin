"""
seed.py – Load simulated CSVs into the SQLite database.

Also creates 4 hand-crafted demo patients that cover the key clinical stories:
  p001 – clear responder (day-14 rise +1.4 g/dL, risk: low)
  p002 – clear non-responder (day-14 rise +0.3 g/dL, risk: high)
  p003 – borderline (day-14 rise +0.9 g/dL, risk: medium)
  p004 – poor adherence (rise suppressed by non-compliance, risk: high)

Run standalone:
    cd irontwin
    python -m backend.seed

Or called automatically at FastAPI startup if DB is empty.
"""

from __future__ import annotations

from pathlib import Path

from backend.db import init_db, upsert_patient, upsert_reading

ROOT = Path(__file__).resolve().parents[1]
PATIENTS_CSV = ROOT / "data" / "processed" / "patients.csv"
READINGS_CSV = ROOT / "data" / "processed" / "readings.csv"

# ── 4 demo patients ───────────────────────────────────────────────────────────

DEMO_PATIENTS = [
    {
        "id":           "p001",
        "name":         "Priya S. (Responder)",
        "age":          27.0,
        "baseline_hb":  8.6,
        "ferritin":     7.0,
        "adherence_pct": 92.0,
        "inflammation": 0,
        "cause":        "post_partum",
        "simulated":    1,
    },
    {
        "id":           "p002",
        "name":         "Meena R. (Non-responder)",
        "age":          34.0,
        "baseline_hb":  9.8,
        "ferritin":     5.0,
        "adherence_pct": 85.0,
        "inflammation": 1,
        "cause":        "gastrointestinal",
        "simulated":    1,
    },
    {
        "id":           "p003",
        "name":         "Lakshmi T. (Borderline)",
        "age":          29.0,
        "baseline_hb":  9.1,
        "ferritin":     9.0,
        "adherence_pct": 78.0,
        "inflammation": 0,
        "cause":        "heavy_uterine_bleeding",
        "simulated":    1,
    },
    {
        "id":           "p004",
        "name":         "Anita K. (Poor adherence)",
        "age":          31.0,
        "baseline_hb":  9.5,
        "ferritin":     6.0,
        "adherence_pct": 50.0,
        "inflammation": 0,
        "cause":        "other",
        "simulated":    1,
    },
]

# Readings: (day, hb, adherence, heart_rate_bpm, daily_steps)
DEMO_READINGS: dict[str, list[tuple[int, float, float, int, int]]] = {
    "p001": [  # clear responder: tachycardia resolves (102 -> 72 bpm), activity rebounds (2700 -> 7900 steps)
        (0,  8.60, 0.92, 102, 2700),
        (7,  9.25, 0.91,  96, 3500),
        (14, 10.00, 0.93,  90, 4800),
        (28, 10.90, 0.92,  84, 5900),
        (42, 11.40, 0.91,  79, 6800),
        (56, 11.80, 0.90,  75, 7400),
        (84, 12.10, 0.91,  72, 7900),
    ],
    "p002": [  # clear non-responder: compensatory resting tachycardia persists (>95 bpm), activity remains depressed (<3200 steps)
        (0,  9.80, 0.85,  99, 2800),
        (7,  9.95, 0.84,  98, 2900),
        (14, 10.10, 0.85,  97, 3000),  # rise only +0.30
        (28, 10.30, 0.83,  96, 2900),
        (42, 10.50, 0.82,  96, 3100),
        (56, 10.60, 0.81,  95, 3050),
        (84, 10.70, 0.80,  94, 3150),
    ],
    "p003": [  # borderline — rise +0.9 at day 14, gradual cardiovascular compensation
        (0,  9.10, 0.78, 101, 2600),
        (7,  9.50, 0.77,  96, 3400),
        (14, 10.00, 0.79,  92, 4200),  # rise exactly +0.90
        (28, 10.50, 0.78,  87, 5000),
        (42, 10.90, 0.77,  84, 5600),
        (56, 11.10, 0.78,  81, 6100),
        (84, 11.30, 0.77,  78, 6600),
    ],
    "p004": [  # poor adherence — rise suppressed, heart rate elevated, fatigue limits activity
        (0,  9.50, 0.50, 100, 2900),
        (7,  9.60, 0.48,  99, 3000),
        (14, 9.80, 0.52,  98, 3100),   # rise only +0.30
        (28, 9.95, 0.50,  97, 3200),
        (42, 10.05, 0.53,  96, 3250),
        (56, 10.10, 0.49,  96, 3100),
        (84, 10.20, 0.51,  95, 3300),
    ],
}


def seed_demo() -> None:
    """Insert the 4 demo patients and their readings (idempotent via upsert)."""
    init_db()
    for pat in DEMO_PATIENTS:
        upsert_patient(**pat)
        for day, hb, adh, hr, st in DEMO_READINGS[pat["id"]]:
            upsert_reading(pat["id"], day, hb, adh, hr, st)
    print(f"[seed] Seeded {len(DEMO_PATIENTS)} demo patients with wearable telemetry.")


def seed_from_csvs() -> None:
    """Load the full simulated CSVs into the DB (optional — large)."""
    try:
        import pandas as pd
    except ImportError:
        print("[seed] pandas not installed – skipping CSV load.")
        return

    if not PATIENTS_CSV.exists():
        print(f"[seed] {PATIENTS_CSV} not found – skipping CSV load.")
        return

    patients = pd.read_csv(PATIENTS_CSV)
    readings = pd.read_csv(READINGS_CSV)

    init_db()
    loaded = 0
    for _, row in patients.iterrows():
        upsert_patient(
            id           = row["patient_id"],
            name         = f"Patient {row['patient_id']}",
            age          = float(row["age"]),
            baseline_hb  = float(row["baseline_hb"]),
            ferritin     = float(row["ferritin"]),
            adherence_pct= float(row["adherence"]) * 100,
            inflammation = int(row.get("inflammation", 0)),
            cause        = str(row.get("cause", "other")),
            simulated    = 1,
        )
        loaded += 1

    for _, row in readings.iterrows():
        upsert_reading(
            patient_id = row["patient_id"],
            day        = int(row["day"]),
            hb         = float(row["hb"]),
            adherence  = float(row.get("adherence", 0.88)),
        )

    print(f"[seed] Loaded {loaded} patients and {len(readings)} readings from CSVs.")


if __name__ == "__main__":
    seed_demo()
    # Uncomment to also load full simulation CSVs:
    # seed_from_csvs()
