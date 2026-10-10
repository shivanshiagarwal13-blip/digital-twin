"""
predict.py – Generate predictions for a single patient.

Inputs (all must be available by day 14):
    baseline_hb   (g/dL)
    ferritin      (ng/mL)
    age           (years)
    hb_day7       (g/dL)
    hb_day14      (g/dL, or None if not yet taken)
    adherence     (0-1)
    inflammation  (0 or 1)

Returns a dict with:
    day                  – last reading day
    rise_since_baseline  – Hb rise from day 0 to latest day (g/dL)
    rule_flag            – True if rise < 1.0 g/dL at day 14
    rule_text            – human-readable rule explanation
    prob_non_response    – model probability of non-response at week 8
    risk                 – "low" / "medium" / "high"
    forecast             – list of {week, hb, low, high}
    status_text          – plain-language summary for patient/health-worker
    next_step            – plain-language action

Before day 14 the rule and probability are not computed (returns "waiting").
The forecast range is the 10th-90th percentile of similar historical patients.

Run:
    python -m model.predict
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
MODEL_PATH = ROOT / "model" / "model.pkl"
PATIENTS_PATH = PROCESSED_DIR / "patients.csv"
READINGS_PATH = PROCESSED_DIR / "readings.csv"
PARAMS_PATH = ROOT / "params.yaml"

FORECAST_WEEKS = [4, 8, 12]
FORECAST_DAYS  = [28, 56, 84]


# ── risk thresholds (assumption – documented in README) ───────────────────────
RISK_HIGH_RULE_FLAG   = True     # if rule flags → high
RISK_HIGH_PROB        = 0.60     # prob_non_response >= 0.60 → high
RISK_MEDIUM_PROB      = 0.30     # prob_non_response >= 0.30 → medium


def _load_bundle() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "model.pkl not found. Run `python -m model.train` first."
        )
    return joblib.load(MODEL_PATH)


def _load_history() -> tuple[pd.DataFrame, pd.DataFrame]:
    if not PATIENTS_PATH.exists():
        raise FileNotFoundError("patients.csv not found.")
    return pd.read_csv(PATIENTS_PATH), pd.read_csv(READINGS_PATH)


# ── nearest-neighbour forecast range ─────────────────────────────────────────

def _forecast_range(
    baseline_hb: float,
    hb_day7: float | None,
    hb_day14: float | None,
    patients: pd.DataFrame,
    readings: pd.DataFrame,
    n_neighbours: int = 300,
    q_low: float = 0.10,
    q_high: float = 0.90,
) -> list[dict[str, float]]:
    """
    Find n_neighbours most similar patients (by baseline Hb, day-7, day-14 Hb)
    and return 10th–90th percentile of their Hb at weeks 4, 8, 12.
    """
    day0_hb = patients.set_index("patient_id")["baseline_hb"]
    day7_hb = patients.set_index("patient_id").get("hb_day7")
    day14_hb = patients.set_index("patient_id").get("hb_day14")

    # Distance
    dist = (patients["baseline_hb"] - baseline_hb) ** 2
    if hb_day7 is not None and "hb_day7" in patients.columns:
        dist += (patients["hb_day7"] - hb_day7) ** 2
    if hb_day14 is not None and "hb_day14" in patients.columns:
        dist += (patients["hb_day14"] - hb_day14) ** 2

    nearest_ids = patients.loc[dist.nsmallest(n_neighbours).index, "patient_id"]

    result = []
    for week, day in zip(FORECAST_WEEKS, FORECAST_DAYS):
        day_r = readings[
            readings["patient_id"].isin(nearest_ids) & (readings["day"] == day)
        ]["hb"]
        if len(day_r) < 5:
            result.append({"week": week, "hb": None, "low": None, "high": None})
        else:
            result.append({
                "week": week,
                "hb":   round(float(day_r.median()), 2),
                "low":  round(float(day_r.quantile(q_low)), 2),
                "high": round(float(day_r.quantile(q_high)), 2),
            })
    return result


# ── risk label ────────────────────────────────────────────────────────────────

def _risk_label(rule_flag: bool, prob: float) -> str:
    if rule_flag or prob >= RISK_HIGH_PROB:
        return "high"
    if prob >= RISK_MEDIUM_PROB:
        return "medium"
    return "low"


# ── text generation ───────────────────────────────────────────────────────────

def _status_text(rule_flag: bool, prob: float, rise: float) -> str:
    if rule_flag:
        return (
            f"Hemoglobin has risen by only {rise:.1f} g/dL in 14 days — "
            "below the 1.0 g/dL threshold. This is an early sign of slow response to oral iron."
        )
    if prob >= RISK_MEDIUM_PROB:
        return (
            f"Hemoglobin has risen by {rise:.1f} g/dL in 14 days. "
            "Response is uncertain — monitoring closely is advised."
        )
    return (
        f"Hemoglobin has risen by {rise:.1f} g/dL in 14 days — "
        "a good early sign of response to oral iron."
    )


def _next_step(rule_flag: bool, prob: float) -> str:
    if rule_flag or prob >= RISK_HIGH_PROB:
        return (
            "Check that tablets are being taken daily. "
            "Discuss with the doctor: investigate for ongoing blood loss, "
            "inflammation, or vitamin B12 deficiency. Consider IV iron if poor response continues."
        )
    if prob >= RISK_MEDIUM_PROB:
        return (
            "Continue current tablets. Take next reading at week 4. "
            "If rise is still below 2 g/dL, ask the doctor for further evaluation."
        )
    return "Continue current tablets. Take next reading at week 4."


def _calculate_explainability(
    rise_d14: float,
    inflammation: int,
    adherence: float,
    baseline_hb: float,
    ferritin: float,
) -> list[dict[str, Any]]:
    items = []
    if rise_d14 < 1.0:
        items.append({
            "factor": "Day-14 Hb Rise < 1.0 g/dL",
            "contribution_pct": 45.0,
            "direction": "risk",
            "explanation": f"Rise of {rise_d14:+.2f} g/dL is below the 1.0 g/dL threshold (Okam 2016). Primary driver of predicted therapy non-response.",
        })
    else:
        items.append({
            "factor": f"Robust Day-14 Hb Rise ({rise_d14:+.2f} g/dL)",
            "contribution_pct": -40.0,
            "direction": "protective",
            "explanation": "Surge >= 1.0 g/dL indicates active bone marrow erythropoiesis and successful gut absorption.",
        })

    if inflammation:
        items.append({
            "factor": "Active Inflammation (Elevated CRP)",
            "contribution_pct": 25.0,
            "direction": "risk",
            "explanation": "Hepatic hepcidin upregulation degrades enterocyte ferroportin, biochemically blocking enteral iron uptake.",
        })
    else:
        items.append({
            "factor": "Normal Inflammatory Marker (Low CRP)",
            "contribution_pct": -10.0,
            "direction": "protective",
            "explanation": "Normal baseline enables physiological ferroportin-mediated duodenal iron absorption.",
        })

    if adherence < 0.70:
        items.append({
            "factor": f"Sub-optimal Adherence ({int(adherence*100)}%)",
            "contribution_pct": 18.0,
            "direction": "risk",
            "explanation": f"Reported compliance of {int(adherence*100)}% (<70%) depresses cumulative bioavailable elemental iron.",
        })
    else:
        items.append({
            "factor": f"High Pill Compliance ({int(adherence*100)}%)",
            "contribution_pct": -10.0,
            "direction": "protective",
            "explanation": "Steady daily tablet intake ensures saturating elemental iron availability.",
        })

    if baseline_hb < 8.5:
        items.append({
            "factor": f"Severe Baseline Anemia ({baseline_hb:.1f} g/dL)",
            "contribution_pct": 12.0,
            "direction": "risk",
            "explanation": "Deeper systemic iron deficit requires a prolonged trajectory to normalize.",
        })
    else:
        items.append({
            "factor": f"Baseline Anemia Margin ({baseline_hb:.1f} g/dL)",
            "contribution_pct": -5.0,
            "direction": "protective",
            "explanation": "Moderate starting hemoglobin presents a narrower replenishment gap.",
        })

    return items


# ── main API ──────────────────────────────────────────────────────────────────

def predict(
    baseline_hb: float,
    ferritin: float,
    age: float,
    hb_day7: float | None = None,
    hb_day14: float | None = None,
    adherence: float = 0.88,
    inflammation: int = 0,
) -> dict[str, Any]:
    """
    Predict non-response risk for a patient.

    Returns dict matching the /prediction API contract.
    All values are decision support only, not a diagnosis.
    """
    bundle   = _load_bundle()
    patients, readings = _load_history()

    # Determine latest available reading day
    if hb_day14 is not None:
        last_day = 14
        latest_hb = hb_day14
    elif hb_day7 is not None:
        last_day = 7
        latest_hb = hb_day7
    else:
        last_day = 0
        latest_hb = baseline_hb

    rise = round(latest_hb - baseline_hb, 2)

    # Before day 14: no rule or probability
    if hb_day14 is None:
        forecast = _forecast_range(
            baseline_hb, hb_day7, None, patients, readings
        )
        return {
            "day":               last_day,
            "rise_since_baseline": rise,
            "rule_flag":         False,
            "rule_text":         "Waiting for day-14 reading.",
            "prob_non_response": None,
            "risk":              "medium",
            "forecast":          forecast,
            "status_text":       "Day-14 reading not yet available. Continue tablets and return for the next check.",
            "next_step":         "Take day-14 Hb reading.",
        }

    # Day 14 available
    rise_d14 = round(hb_day14 - baseline_hb, 2)
    rule_flag = bool(rise_d14 < 1.0)

    # Build feature vector
    features = {
        "baseline_hb":  baseline_hb,
        "ferritin":     ferritin,
        "age":          age,
        "hb_day7":      hb_day7 if hb_day7 is not None else baseline_hb,
        "hb_day14":     hb_day14,
        "rise_day14":   rise_d14,
        "adherence":    adherence,
        "inflammation": inflammation,
    }
    X = pd.DataFrame([features])[bundle["features"]]

    # Use best probability model
    prob_model = bundle["prob_model"]
    prob = round(float(prob_model.predict_proba(X)[0, 1]), 3)

    risk = _risk_label(rule_flag, prob)
    forecast = _forecast_range(baseline_hb, hb_day7, hb_day14, patients, readings)

    rule_text = (
        f"Hb rise of {rise_d14:+.1f} g/dL by day 14 "
        f"({'below' if rule_flag else 'above'} the 1.0 g/dL threshold -- Okam 2016)."
    )

    explainability = _calculate_explainability(
        rise_d14, inflammation, adherence, baseline_hb, ferritin
    )

    return {
        "day":                 14,
        "rise_since_baseline": rise_d14,
        "rule_flag":           rule_flag,
        "rule_text":           rule_text,
        "prob_non_response":   prob,
        "risk":                risk,
        "forecast":            forecast,
        "status_text":         _status_text(rule_flag, prob, rise_d14),
        "next_step":           _next_step(rule_flag, prob),
        "explainability":      explainability,
    }


if __name__ == "__main__":
    import json

    # Demo: a slow responder (rise only +0.5)
    print("=== Slow responder (day-14 rise +0.5) ===")
    result = predict(
        baseline_hb=9.2, ferritin=8.0, age=28,
        hb_day7=9.5, hb_day14=9.7, adherence=0.85,
    )
    print(json.dumps(result, indent=2))

    print("\n=== Good responder (day-14 rise +1.3) ===")
    result2 = predict(
        baseline_hb=8.8, ferritin=7.0, age=30,
        hb_day7=9.2, hb_day14=10.1, adherence=0.92,
    )
    print(json.dumps(result2, indent=2))

    print("\n=== Before day-14 reading ===")
    result3 = predict(
        baseline_hb=9.0, ferritin=9.0, age=25,
        hb_day7=9.3,
    )
    print(json.dumps(result3, indent=2))
