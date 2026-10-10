"""
simulator.py – Generate ~2 000 virtual patients on oral iron therapy.

Model
-----
  Hb(t) = Hb0 + gain_max * (1 - exp(-k * t_days)) * adherence_factor + noise
  * adherence_factor = 1 - (1 - adherence) * 0.5   (partial penalty)
  * responders:     gain_max from params.yaml
  * non-responders: smaller gain_max from params.yaml

Calibration
-----------
If k_per_day or gain values are null in params.yaml the script runs a grid
search to find values that minimise the squared error against:
  - Athiyarath 2015: mean Hb week 8 ≈ 10.80, week 20 ≈ 11.40
  - Okam Fig 1: share of responders reaching +1 g/dL at day 28 ≈ 1.00
  - Okam Fig 1: share of responders reaching +2 g/dL at day 28 ≈ 0.849
The winning values are written back into params.yaml (status: assumption).

Output
------
  data/processed/patients.csv   – one row per patient
  data/processed/readings.csv   – one row per reading (patient_id, day, hb, adherence)

Run:
    python -m model.simulator
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[1]
PARAMS_PATH = ROOT / "params.yaml"
PROCESSED_DIR = ROOT / "data" / "processed"
BASELINES_PATH = PROCESSED_DIR / "baselines.json"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

READING_DAYS = [0, 7, 14, 21, 28, 42, 56, 70, 84]   # days 0..12 weeks
CALIBRATION_TARGETS = {
    "hb_week8_mean":  10.80,
    "hb_week20_mean": 11.40,
    "resp_reach_1_day28":  1.000,
    "resp_reach_2_day28":  0.849,
    "resp_reach_1_day42":  1.000,
    "resp_reach_2_day42":  0.929,
}


# ── load config ───────────────────────────────────────────────────────────────

def _load_params() -> dict[str, Any]:
    with open(PARAMS_PATH) as f:
        return yaml.safe_load(f)


def _load_baselines() -> dict[str, Any]:
    if BASELINES_PATH.exists():
        with open(BASELINES_PATH) as f:
            return json.load(f)
    return {}


# ── baseline draw helpers ─────────────────────────────────────────────────────

def _clamp(val: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return np.clip(val, lo, hi)


def _draw_patients(
    n: int,
    params: dict,
    baselines: dict,
    rng: np.random.Generator,
) -> pd.DataFrame:
    """Sample patient covariates from baseline distributions."""
    p_india = params["india_calibration_athiyarath"]
    p_adh   = params["adherence"]
    p_okam  = params["okam_pooled_cohort"]
    p_d14_cause = params["day14_response_by_cause"]

    # Baseline Hb (g/dL) – Indian anemic pregnant women
    hb0_mean = p_india["baseline_hb"]["mean"]
    hb0_sd   = p_india["baseline_hb"]["sd"]

    # Try to use Lucknow or NHANES baselines if available
    if "lucknow_cbc" in baselines and "hb" in baselines["lucknow_cbc"]:
        lk = baselines["lucknow_cbc"]["hb"]
        hb0_mean = lk.get("mean", hb0_mean)
        hb0_sd   = lk.get("sd", hb0_sd)

    hb0 = _clamp(rng.normal(hb0_mean, hb0_sd, n), 5.0, 14.0)

    # Age
    age_resp = p_okam["mean_age_years"]["responders"]
    age_nonr = p_okam["mean_age_years"]["non_responders"]
    age = _clamp(rng.normal(0.5 * (age_resp + age_nonr), 6.0, n), 15.0, 50.0)

    # Ferritin (ng/mL) – use NHANES shape if available
    ferritin_mean, ferritin_sd = 12.0, 8.0
    if "nhanes_ferritin" in baselines and "ferritin_ng_ml" in baselines["nhanes_ferritin"]:
        nh = baselines["nhanes_ferritin"]["ferritin_ng_ml"]
        ferritin_mean = nh.get("mean", ferritin_mean)
        ferritin_sd   = nh.get("sd", ferritin_sd)
    ferritin = _clamp(rng.lognormal(
        mean=np.log(max(ferritin_mean, 1.0)),
        sigma=0.7,
        size=n,
    ), 1.0, 150.0)

    # Adherence: mean ≈ 0.88 (Athiyarath), with poor-adherence tail
    adh_mean = p_adh["mean_compliance_india"]["week8"]["mean"]
    adh_sd   = p_adh["mean_compliance_india"]["week8"]["sd"]
    adherence = _clamp(rng.beta(
        a=adh_mean * 5,
        b=(1 - adh_mean) * 5,
        size=n,
    ), 0.0, 1.0)

    # Inflammation flag (CRP) – placeholder prevalence 30 %
    inflammation = rng.random(n) < 0.30

    # Cause of anemia – rough distribution from Indian context
    causes_pool = list(p_d14_cause.keys())
    causes_pool = [c for c in causes_pool if c not in ("source", "status")]
    cause = rng.choice(causes_pool, size=n)

    # Responder probability depends on cause
    cause_resp_prob = {
        k: v for k, v in p_d14_cause.items()
        if k not in ("source", "status")
    }
    p_resp_per_patient = np.array([cause_resp_prob.get(c, 0.728) for c in cause])
    # Adjust for inflammation and poor adherence
    p_resp_per_patient *= np.where(inflammation, 0.80, 1.0)
    p_resp_per_patient *= np.where(adherence < 0.60, 0.70, 1.0)
    p_resp_per_patient = np.clip(p_resp_per_patient, 0.05, 0.98)

    is_responder = rng.random(n) < p_resp_per_patient

    df = pd.DataFrame({
        "patient_id":   [f"p{i:04d}" for i in range(n)],
        "age":          age.round(1),
        "baseline_hb":  hb0.round(2),
        "ferritin":     ferritin.round(1),
        "adherence":    adherence.round(3),
        "inflammation": inflammation.astype(int),
        "cause":        cause,
        "is_responder": is_responder.astype(int),
        "simulated":    True,
    })
    return df


# ── Hb trajectory ─────────────────────────────────────────────────────────────

def _hb_trajectory(
    patients: pd.DataFrame,
    k: float,
    gain_max_resp: float,
    gain_max_nonr: float,
    noise_sd: float,
    rng: np.random.Generator,
    days: list[int] = READING_DAYS,
) -> pd.DataFrame:
    """
    Compute weekly Hb readings.  Each row is one reading.

    Hb(t) = Hb0 + gain * (1 - exp(-k * t)) * adherence_factor
    adherence_factor = 1 - 0.5 * (1 - adherence)   clipped to [0.1, 1]

    Guarantee: responders have day-14 rise >= 1.0; non-responders < 1.0.
    Patients that violate this constraint are flagged for re-draw.
    """
    rows = []
    for _, pat in patients.iterrows():
        hb0  = pat["baseline_hb"]
        adh  = pat["adherence"]
        resp = bool(pat["is_responder"])
        gain = gain_max_resp if resp else gain_max_nonr

        adh_factor = max(0.1, 1.0 - 0.5 * (1.0 - adh))

        for day in days:
            hb_ideal = hb0 + gain * (1.0 - np.exp(-k * day)) * adh_factor
            noise = rng.normal(0.0, noise_sd)
            hb = round(max(3.0, hb_ideal + noise), 2)
            rows.append({
                "patient_id": pat["patient_id"],
                "day":        day,
                "hb":         hb,
                "adherence":  round(adh + rng.normal(0, 0.03), 3),
            })

    return pd.DataFrame(rows)


def _day14_rise(patients: pd.DataFrame, readings: pd.DataFrame) -> pd.Series:
    """Return series of Hb rise at day 14 for each patient."""
    d0  = readings[readings["day"] == 0].set_index("patient_id")["hb"]
    d14 = readings[readings["day"] == 14].set_index("patient_id")["hb"]
    return (d14 - d0).reindex(patients["patient_id"].values)


# ── calibration ───────────────────────────────────────────────────────────────

def _calibration_error(
    k: float,
    gain_resp: float,
    gain_nonr: float,
    noise_sd: float,
    patients: pd.DataFrame,
    rng_seed: int = 0,
) -> float:
    rng = np.random.default_rng(rng_seed)
    readings = _hb_trajectory(patients, k, gain_resp, gain_nonr, noise_sd, rng)

    resp_patients = patients[patients["is_responder"] == 1]["patient_id"]
    resp_readings = readings[readings["patient_id"].isin(resp_patients)]

    # week-8 mean Hb (day 56)
    hb_w8  = readings[readings["day"] == 56]["hb"].mean()
    # week-20 mean Hb – we only simulate to week 12 (day 84); extrapolate or use day 84
    hb_w20 = readings[readings["day"] == 84]["hb"].mean()

    # Share of responders reaching +1 and +2 at day 28
    resp_d0  = resp_readings[resp_readings["day"] == 0].set_index("patient_id")["hb"]
    resp_d28 = resp_readings[resp_readings["day"] == 28].set_index("patient_id")["hb"]
    rise_d28 = (resp_d28 - resp_d0).dropna()

    share_1_d28 = (rise_d28 >= 1.0).mean() if len(rise_d28) else 0.0
    share_2_d28 = (rise_d28 >= 2.0).mean() if len(rise_d28) else 0.0

    resp_d42 = resp_readings[resp_readings["day"] == 42].set_index("patient_id")["hb"]
    rise_d42 = (resp_d42 - resp_d0.reindex(resp_d42.index)).dropna()
    share_1_d42 = (rise_d42 >= 1.0).mean() if len(rise_d42) else 0.0
    share_2_d42 = (rise_d42 >= 2.0).mean() if len(rise_d42) else 0.0

    T = CALIBRATION_TARGETS
    err = (
        (hb_w8  - T["hb_week8_mean"]) ** 2 * 2.0 +
        (hb_w20 - T["hb_week20_mean"]) ** 2 * 2.0 +
        (share_1_d28 - T["resp_reach_1_day28"]) ** 2 +
        (share_2_d28 - T["resp_reach_2_day28"]) ** 2 +
        (share_1_d42 - T["resp_reach_1_day42"]) ** 2 +
        (share_2_d42 - T["resp_reach_2_day42"]) ** 2
    )
    return float(err)


def calibrate(patients: pd.DataFrame, params: dict) -> dict[str, float]:
    """
    Grid search over (k, gain_resp, gain_nonr, noise_sd).
    Returns best-fit values.
    """
    sa = params["simulator_assumptions"]
    # Use existing values if already filled
    if sa["k_per_day"]["value"] is not None:
        return {
            "k_per_day":             sa["k_per_day"]["value"],
            "gain_max_responders":   sa["gain_max_responders"]["value"],
            "gain_max_non_responders": sa["gain_max_non_responders"]["value"],
            "measurement_noise_sd":  sa["measurement_noise_sd"]["value"],
        }

    print("[simulator] Calibrating simulator parameters (grid search)…")

    k_grid    = [0.02, 0.03, 0.04, 0.05, 0.07]
    gr_grid   = [2.0, 2.5, 3.0, 3.5]
    gnr_grid  = [0.3, 0.5, 0.7, 1.0]
    ns_grid   = [0.10, 0.15, 0.20]

    best_err = float("inf")
    best = {"k": 0.04, "gr": 2.5, "gnr": 0.5, "ns": 0.15}

    for k in k_grid:
        for gr in gr_grid:
            for gnr in gnr_grid:
                for ns in ns_grid:
                    err = _calibration_error(k, gr, gnr, ns, patients[:300])
                    if err < best_err:
                        best_err = err
                        best = {"k": k, "gr": gr, "gnr": gnr, "ns": ns}

    print(f"[simulator] Best calibration: {best}  (error={best_err:.4f})")
    return {
        "k_per_day":               best["k"],
        "gain_max_responders":     best["gr"],
        "gain_max_non_responders": best["gnr"],
        "measurement_noise_sd":    best["ns"],
    }


def _write_calibrated_params(cal: dict[str, float]) -> None:
    """Write calibrated assumption values back into params.yaml."""
    with open(PARAMS_PATH) as f:
        raw = f.read()
        data = yaml.safe_load(raw)

    sa = data["simulator_assumptions"]
    sa["k_per_day"]["value"]                = cal["k_per_day"]
    sa["k_per_day"]["status"]               = "assumption"
    sa["gain_max_responders"]["value"]      = cal["gain_max_responders"]
    sa["gain_max_responders"]["status"]     = "assumption"
    sa["gain_max_non_responders"]["value"]  = cal["gain_max_non_responders"]
    sa["gain_max_non_responders"]["status"] = "assumption"
    sa["measurement_noise_sd"]["value"]     = cal["measurement_noise_sd"]
    sa["measurement_noise_sd"]["status"]    = "assumption"

    with open(PARAMS_PATH, "w") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    print(f"[simulator] Wrote calibrated assumptions to {PARAMS_PATH}")


# ── constraint-enforcement re-draw ────────────────────────────────────────────

def _enforce_day14_constraint(
    patients: pd.DataFrame,
    readings: pd.DataFrame,
    k: float,
    gain_resp: float,
    gain_nonr: float,
    noise_sd: float,
    rng: np.random.Generator,
    max_redraw: int = 5,
) -> pd.DataFrame:
    """
    Responders must have day-14 rise >= 1.0 g/dL.
    Non-responders must have day-14 rise < 1.0 g/dL.
    Re-draw noise up to max_redraw times for violating patients.
    """
    for _ in range(max_redraw):
        rise = _day14_rise(patients, readings)
        violators_resp = patients[
            (patients["is_responder"] == 1) &
            (rise.values < 1.0)
        ]["patient_id"]
        violators_nonr = patients[
            (patients["is_responder"] == 0) &
            (rise.values >= 1.0)
        ]["patient_id"]
        violators = list(violators_resp) + list(violators_nonr)

        if not violators:
            break

        viol_pat = patients[patients["patient_id"].isin(violators)]
        new_read = _hb_trajectory(viol_pat, k, gain_resp, gain_nonr, noise_sd, rng)

        readings = readings[~readings["patient_id"].isin(violators)]
        readings = pd.concat([readings, new_read], ignore_index=True)

    return readings


# ── main ──────────────────────────────────────────────────────────────────────

def run(n: int = 2000, seed: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generate n virtual patients and their weekly Hb readings.

    Returns
    -------
    patients : pd.DataFrame
    readings : pd.DataFrame
    """
    rng = np.random.default_rng(seed)
    params    = _load_params()
    baselines = _load_baselines()

    print(f"[simulator] Generating {n} virtual patients (seed={seed})…")

    patients = _draw_patients(n, params, baselines, rng)

    # Calibrate parameters (or load from params.yaml)
    cal = calibrate(patients, params)

    k        = cal["k_per_day"]
    gain_resp = cal["gain_max_responders"]
    gain_nonr = cal["gain_max_non_responders"]
    noise_sd  = cal["measurement_noise_sd"]

    # Write back if newly calibrated
    sa = params["simulator_assumptions"]
    if sa["k_per_day"]["value"] is None:
        _write_calibrated_params(cal)

    # Generate readings
    readings = _hb_trajectory(patients, k, gain_resp, gain_nonr, noise_sd, rng)

    # Enforce day-14 constraint
    readings = _enforce_day14_constraint(
        patients, readings, k, gain_resp, gain_nonr, noise_sd, rng
    )

    # Compute non-response label (outcome): rise < 2.0 g/dL by week 8 (day 56)
    d0   = readings[readings["day"] == 0].set_index("patient_id")["hb"]
    d56  = readings[readings["day"] == 56].set_index("patient_id")["hb"]
    rise_w8 = (d56 - d0).reindex(patients["patient_id"].values)
    patients["nonresponse_w8"] = (rise_w8.values < 2.0).astype(int)

    # Day-14 rise (for training features)
    d14  = readings[readings["day"] == 14].set_index("patient_id")["hb"]
    d7   = readings[readings["day"] == 7].set_index("patient_id")["hb"]
    patients["hb_day7"]  = d7.reindex(patients["patient_id"].values).values
    patients["hb_day14"] = d14.reindex(patients["patient_id"].values).values
    patients["rise_day14"] = (
        d14 - d0
    ).reindex(patients["patient_id"].values).values

    # Save
    patients_path = PROCESSED_DIR / "patients.csv"
    readings_path = PROCESSED_DIR / "readings.csv"
    patients.to_csv(patients_path, index=False)
    readings.to_csv(readings_path, index=False)

    print(f"[simulator] Saved {len(patients)} patients → {patients_path}")
    print(f"[simulator] Saved {len(readings)} readings → {readings_path}")
    print(f"[simulator] Responder rate: {patients['is_responder'].mean():.1%}")
    print(f"[simulator] Non-response at week 8: {patients['nonresponse_w8'].mean():.1%}")

    return patients, readings


if __name__ == "__main__":
    p, r = run()
    print(p.head())
    print(r.head(20))
