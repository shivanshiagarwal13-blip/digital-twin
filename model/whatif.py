"""
whatif.py – Return alternative Hb forecasts for what-if scenarios.

Scenarios:
    better_adherence  – raise adherence to 0.95; regenerate the exponential curve
    iv_iron           – add +0.84 g/dL at week 4 (meta-analysis, CI 0.59–1.09)
                        and +0.40 g/dL as the cautious option (Qayyum 2025)
    extra_tests       – curve unchanged; return a list of checks to consider

Return shape matches the /whatif API contract in frontend_brief.md.

Run:
    python -m model.whatif
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yaml
import joblib

ROOT = Path(__file__).resolve().parents[1]
PARAMS_PATH = ROOT / "params.yaml"
PROCESSED_DIR = ROOT / "data" / "processed"
PATIENTS_PATH = PROCESSED_DIR / "patients.csv"
READINGS_PATH = PROCESSED_DIR / "readings.csv"
MODEL_PATH = ROOT / "model" / "model.pkl"

FORECAST_WEEKS = [4, 8, 12]
FORECAST_DAYS  = [28, 56, 84]


def _load_params() -> dict[str, Any]:
    with open(PARAMS_PATH) as f:
        return yaml.safe_load(f)


def _load_history() -> tuple[pd.DataFrame, pd.DataFrame]:
    return pd.read_csv(PATIENTS_PATH), pd.read_csv(READINGS_PATH)


# ── shared curve helper ───────────────────────────────────────────────────────

def _exponential_curve(
    hb0: float,
    hb_day14: float,
    k: float,
    gain_max: float,
    adherence_factor: float,
    extra_offset_w4: float = 0.0,
    extra_label: str = "",
) -> list[dict[str, float]]:
    """
    Generate forecast at weeks 4, 8, 12 using the calibrated exponential.
    extra_offset_w4 is added at week 4 only (e.g. IV iron boost).
    """
    results = []
    for week, day in zip(FORECAST_WEEKS, FORECAST_DAYS):
        hb = hb0 + gain_max * (1 - np.exp(-k * day)) * adherence_factor
        if week == 4:
            hb += extra_offset_w4
        results.append({"week": week, "hb": round(hb, 2)})
    return results


def _prob_from_model(
    baseline_hb: float,
    ferritin: float,
    age: float,
    hb_day7: float,
    hb_day14: float,
    adherence: float,
    inflammation: int,
    bundle: dict,
) -> float:
    features = {
        "baseline_hb":  baseline_hb,
        "ferritin":     ferritin,
        "age":          age,
        "hb_day7":      hb_day7,
        "hb_day14":     hb_day14,
        "rise_day14":   hb_day14 - baseline_hb,
        "adherence":    adherence,
        "inflammation": inflammation,
    }
    X = pd.DataFrame([features])[bundle["features"]]
    prob = float(bundle["prob_model"].predict_proba(X)[0, 1])
    return round(prob, 3)


# ── forecast from nearest neighbours under new adherence ─────────────────────

def _nn_forecast_under_adherence(
    baseline_hb: float,
    hb_day7: float,
    hb_day14: float,
    new_adherence: float,
    patients: pd.DataFrame,
    readings: pd.DataFrame,
    n_neighbours: int = 200,
) -> list[dict[str, float]]:
    """Find similar patients who had adherence >= new_adherence and use their trajectories."""
    high_adh = patients[patients["adherence"] >= new_adherence - 0.10]

    dist = (
        (high_adh["baseline_hb"] - baseline_hb) ** 2
        + (high_adh.get("hb_day14", high_adh["baseline_hb"]) - hb_day14) ** 2
    )
    nearest_ids = high_adh.loc[dist.nsmallest(n_neighbours).index, "patient_id"]

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
                "low":  round(float(day_r.quantile(0.10)), 2),
                "high": round(float(day_r.quantile(0.90)), 2),
            })
    return result


# ── scenarios ─────────────────────────────────────────────────────────────────

def _scenario_better_adherence(
    baseline_hb: float,
    ferritin: float,
    age: float,
    hb_day7: float,
    hb_day14: float,
    adherence: float,
    inflammation: int,
    patients: pd.DataFrame,
    readings: pd.DataFrame,
    bundle: dict,
) -> dict[str, Any]:
    new_adherence = 0.95
    forecast = _nn_forecast_under_adherence(
        baseline_hb, hb_day7, hb_day14, new_adherence, patients, readings
    )
    # New probability with improved adherence
    prob = _prob_from_model(
        baseline_hb, ferritin, age, hb_day7, hb_day14,
        new_adherence, inflammation, bundle
    )
    return {
        "scenario": "better_adherence",
        "label":    "Improved adherence (≥ 95 %)",
        "forecast": forecast,
        "prob_non_response": prob,
        "note": (
            "Assumes patient takes tablets every day. "
            "Forecast from similar patients with adherence ≥ 0.85."
        ),
    }


def _scenario_iv_iron(
    baseline_hb: float,
    hb_day14: float,
    patients: pd.DataFrame,
    readings: pd.DataFrame,
    params: dict,
    option: str = "standard",
) -> dict[str, Any]:
    """
    Add the IV iron extra rise on top of the oral trajectory.
    standard  → +0.84 g/dL at week 4 (meta-analysis, 11 RCTs)
    cautious  → +0.40 g/dL at week 4 (Qayyum 2025)
    Source: params.yaml iv_iron_effect
    """
    iv_params = params["iv_iron_effect"]
    if option == "cautious":
        boost = iv_params["conservative_extra_hb"]["value"]
        ci95  = None
        source = "Qayyum et al., Cureus 2025 (conservative estimate)"
    else:
        boost = iv_params["extra_hb_at_week4"]["value"]
        ci95  = iv_params["extra_hb_at_week4"]["ci95"]
        source = "IV vs oral meta-analysis (11 RCTs, pregnancy)"

    # Base forecast from nearest neighbours
    from model.predict import _forecast_range  # local import to avoid circular
    base_forecast = _forecast_range(baseline_hb, None, hb_day14, patients, readings)

    iv_forecast = []
    for pt in base_forecast:
        hb_adj = (pt["hb"] + boost) if pt["week"] == 4 else pt["hb"]
        low_adj  = (pt["low"]  + boost * 0.7)  if pt["week"] == 4 else pt["low"]
        high_adj = (pt["high"] + boost * 1.3)  if pt["week"] == 4 else pt["high"]
        # Effect persists (partial) at later weeks
        if pt["week"] in (8, 12):
            hb_adj  = pt["hb"]  + boost * 0.5
            low_adj  = pt["low"]  + boost * 0.3
            high_adj = pt["high"] + boost * 0.7
        iv_forecast.append({
            "week": pt["week"],
            "hb":   round(hb_adj, 2) if hb_adj else None,
            "low":  round(low_adj, 2) if low_adj else None,
            "high": round(high_adj, 2) if high_adj else None,
        })

    # Probability: IV iron substantially improves response odds
    odds_ratio = iv_params["odds_ratio_reach_target_hb"]["value"]
    base_prob  = 0.60  # assumed high-risk patient
    # Apply OR: p_new = OR * p / (1 - p + OR * p)
    p_resp = 1 - base_prob
    p_resp_iv = odds_ratio * p_resp / (1 - p_resp + odds_ratio * p_resp)
    prob_nonresp_iv = round(1 - p_resp_iv, 3)

    return {
        "scenario": "iv_iron",
        "label":    "Switch to IV iron" + (" (cautious estimate)" if option == "cautious" else ""),
        "forecast": iv_forecast,
        "prob_non_response": prob_nonresp_iv,
        "boost_at_week4_g_dl": boost,
        "ci95": ci95,
        "source": source,
        "note": "Decision support only. Switch requires clinical assessment.",
    }


def _scenario_extra_tests(
    baseline_hb: float,
    hb_day14: float,
    patients: pd.DataFrame,
    readings: pd.DataFrame,
) -> dict[str, Any]:
    from model.predict import _forecast_range
    forecast = _forecast_range(baseline_hb, None, hb_day14, patients, readings)
    return {
        "scenario": "extra_tests",
        "label":    "Further investigations",
        "forecast": forecast,
        "prob_non_response": None,   # curve unchanged
        "checks_to_consider": [
            {
                "check":  "Adherence diary / pill count",
                "reason": "Non-adherence is the commonest cause of apparent non-response.",
            },
            {
                "check":  "Ongoing blood loss screen",
                "reason": "Heavy menstrual bleeding or GI loss negates iron repletion.",
            },
            {
                "check":  "Serum CRP / ESR (inflammation)",
                "reason": "Active inflammation blocks iron absorption and erythropoiesis.",
            },
            {
                "check":  "Vitamin B12 and folate levels",
                "reason": (
                    "Athiyarath 2015 found B12 deficiency in a subset of Indian "
                    "poor-responders. Co-supplementation may be needed."
                ),
            },
            {
                "check":  "Serum ferritin post-loading",
                "reason": "Persistent low ferritin despite tablets suggests malabsorption.",
            },
            {
                "check":  "Haemoglobin electrophoresis",
                "reason": "Exclude haemoglobinopathy (e.g. thalassaemia trait) if MCV very low.",
            },
        ],
        "note": "Forecast unchanged — route-of-treatment has not been altered.",
    }


# ── public entry point ────────────────────────────────────────────────────────

def whatif(
    baseline_hb: float,
    ferritin: float,
    age: float,
    hb_day7: float,
    hb_day14: float,
    adherence: float,
    inflammation: int,
    scenario: str,
) -> dict[str, Any]:
    """
    Run a what-if scenario for a patient.

    Parameters
    ----------
    scenario : str
        One of "better_adherence", "iv_iron", "iv_iron_cautious", "extra_tests".

    Returns
    -------
    dict matching the /whatif API contract.
    """
    params   = _load_params()
    patients, readings = _load_history()
    bundle   = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None

    if scenario == "better_adherence":
        if bundle is None:
            raise FileNotFoundError("model.pkl not found. Run train.py first.")
        return _scenario_better_adherence(
            baseline_hb, ferritin, age, hb_day7, hb_day14,
            adherence, inflammation, patients, readings, bundle
        )

    if scenario in ("iv_iron", "iv_iron_cautious"):
        opt = "cautious" if scenario == "iv_iron_cautious" else "standard"
        return _scenario_iv_iron(baseline_hb, hb_day14, patients, readings, params, opt)

    if scenario == "extra_tests":
        return _scenario_extra_tests(baseline_hb, hb_day14, patients, readings)

    raise ValueError(
        f"Unknown scenario '{scenario}'. "
        "Choose: better_adherence | iv_iron | iv_iron_cautious | extra_tests"
    )


if __name__ == "__main__":
    import json

    pat = dict(
        baseline_hb=9.2, ferritin=8.0, age=28,
        hb_day7=9.5, hb_day14=9.7,
        adherence=0.65, inflammation=0,
    )

    for sc in ("iv_iron", "better_adherence", "extra_tests"):
        print(f"\n=== Scenario: {sc} ===")
        result = whatif(**pat, scenario=sc)
        print(json.dumps(result, indent=2))
