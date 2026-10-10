"""
baselines.py – Read downloaded data sources and write data/processed/baselines.json.

Sources used:
  - Dryad trial CSV (oral iron arm only): Hb at screening, week 4, week 8
  - Lucknow CBC CSV: Hb and MCV distributions in anemic women
  - NHANES ferritin CSV (American population – used only to shape ferritin distribution)
  - NFHS-5 India IR file (if it arrives): Hb (stored ×10), age, state

If a raw file is missing the script falls back to the sourced numbers already
in params.yaml (from Athiyarath 2015 and Okam 2016) so nothing breaks.

Run:
    python -m model.baselines
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yaml

# ── paths ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[1]
PARAMS_PATH = ROOT / "params.yaml"
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
OUT_PATH = PROCESSED_DIR / "baselines.json"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# ── helpers ──────────────────────────────────────────────────────────────────

def load_params() -> dict[str, Any]:
    with open(PARAMS_PATH) as f:
        return yaml.safe_load(f)


def _stats(series: pd.Series) -> dict[str, float]:
    """Return mean, SD, median, p10, p90 for a numeric series."""
    s = series.dropna()
    return {
        "mean": round(float(s.mean()), 3),
        "sd":   round(float(s.std(ddof=1)), 3),
        "median": round(float(s.median()), 3),
        "p10": round(float(s.quantile(0.10)), 3),
        "p90": round(float(s.quantile(0.90)), 3),
        "n":   int(len(s)),
    }


# ── 1. Dryad trial (oral iron arm) ───────────────────────────────────────────

def _find_dryad_csv() -> Path | None:
    """Search raw/ for a file that looks like the Dryad trial CSV."""
    candidates = list(RAW_DIR.glob("*.csv")) + list(RAW_DIR.glob("*.CSV"))
    for p in candidates:
        name = p.name.lower()
        if any(k in name for k in ("dryad", "trial", "iron_trial", "oral")):
            return p
    # If only one CSV exists, try it
    if len(candidates) == 1:
        return candidates[0]
    return None


def _dryad_stats(params: dict) -> dict:
    """
    Parse the Dryad CSV.  Column names are printed so we never guess.
    Keeps only the oral iron arm.  Falls back to params.yaml if file absent.
    """
    csv_path = _find_dryad_csv()

    fallback = {
        "source": "params.yaml / Athiyarath 2015 (fallback – Dryad CSV not found)",
        "note": "Dryad CSV not present in data/raw/. Add it to get real-data stats.",
        "screening_hb": params["dryad_oral_arm_validation"]["screening_hb"],
        "hb_week4":     params["dryad_oral_arm_validation"]["hb_week4"],
        "hb_week8":     params["dryad_oral_arm_validation"]["hb_week8"],
    }

    if csv_path is None:
        print("[baselines] Dryad CSV not found – using params.yaml fallback.")
        return fallback

    df = pd.read_csv(csv_path, low_memory=False)
    print(f"\n[baselines] Dryad CSV columns ({csv_path.name}):\n  {list(df.columns)}\n")

    # ── identify oral-arm column ──────────────────────────────────────────────
    arm_col = None
    for col in df.columns:
        if "arm" in col.lower() or "treat" in col.lower() or "group" in col.lower():
            arm_col = col
            break

    if arm_col:
        unique_arms = df[arm_col].dropna().unique()
        print(f"[baselines] Arm column: '{arm_col}', values: {unique_arms}")
        oral_keywords = ("oral", "tablet", "ferrous", "0", "1")
        oral_mask = df[arm_col].astype(str).str.lower().str.contains(
            "|".join(oral_keywords)
        )
        df = df[oral_mask].copy()
        print(f"[baselines] Oral arm rows: {len(df)}")
    else:
        print("[baselines] No arm column detected – treating all rows as oral arm.")

    # ── find Hb columns ───────────────────────────────────────────────────────
    hb_cols = {
        col: col.lower()
        for col in df.columns
        if "hb" in col.lower() or "haemo" in col.lower() or "hemog" in col.lower()
    }
    print(f"[baselines] Hb-like columns: {list(hb_cols.keys())}")

    def _pick_hb(keywords: list[str]) -> dict | None:
        for col, lower in hb_cols.items():
            if any(k in lower for k in keywords):
                s = pd.to_numeric(df[col], errors="coerce").dropna()
                if len(s) >= 5:
                    return _stats(s)
        return None

    screen = _pick_hb(["screen", "base", "wk0", "week0", "day0", "0"])
    wk4    = _pick_hb(["wk4", "week4", "4wk", "4week", "w4"])
    wk8    = _pick_hb(["wk8", "week8", "8wk", "8week", "w8"])

    if screen is None:
        print("[baselines] Dryad: could not identify screening Hb – using fallback.")
        return fallback

    return {
        "source": f"Dryad trial CSV ({csv_path.name}), oral arm only",
        "screening_hb": screen or params["dryad_oral_arm_validation"]["screening_hb"],
        "hb_week4":     wk4    or params["dryad_oral_arm_validation"]["hb_week4"],
        "hb_week8":     wk8    or params["dryad_oral_arm_validation"]["hb_week8"],
    }


# ── 2. Lucknow CBC ───────────────────────────────────────────────────────────

def _find_lucknow_csv() -> Path | None:
    for p in RAW_DIR.glob("*.csv"):
        if any(k in p.name.lower() for k in ("lucknow", "cbc", "mendeley", "blood")):
            return p
    return None


def _lucknow_stats() -> dict:
    csv_path = _find_lucknow_csv()

    fallback = {
        "source": "params.yaml / Athiyarath 2015 (fallback – Lucknow CSV not found)",
        "note": "Lucknow CBC CSV not present in data/raw/.",
        "hb": {"mean": 9.34, "sd": 1.19, "n": 181},
        "mcv_fl": {"mean": 70.7, "sd": None, "n": 181},
    }

    if csv_path is None:
        print("[baselines] Lucknow CBC CSV not found – using params.yaml fallback.")
        return fallback

    df = pd.read_csv(csv_path, low_memory=False)
    print(f"\n[baselines] Lucknow CSV columns ({csv_path.name}):\n  {list(df.columns)}\n")

    # Find Hb column
    hb_col = None
    for col in df.columns:
        if "hb" in col.lower() or "haemo" in col.lower() or "hemog" in col.lower():
            hb_col = col
            break
    if hb_col is None:
        print("[baselines] Lucknow: no Hb column found – fallback.")
        return fallback

    print(f"[baselines] Lucknow Hb column: '{hb_col}'")

    # Find MCV column
    mcv_col = None
    for col in df.columns:
        if "mcv" in col.lower() or "mean corp" in col.lower():
            mcv_col = col
            break

    hb_series = pd.to_numeric(df[hb_col], errors="coerce")

    # Keep anemic women: Hb < 12 g/dL (WHO threshold).
    # If Hb values look like they are stored ×10, convert first.
    if hb_series.median() > 50:
        hb_series = hb_series / 10.0
        print("[baselines] Lucknow: Hb appears ×10-encoded – dividing by 10.")

    # Find sex column
    sex_col = None
    for col in df.columns:
        if "sex" in col.lower() or "gender" in col.lower():
            sex_col = col
            break

    mask = hb_series < 12.0
    if sex_col:
        sex_vals = df[sex_col].astype(str).str.lower()
        female_mask = sex_vals.str.contains("f|female|2") 
        mask = mask & female_mask
        print(f"[baselines] Lucknow: {mask.sum()} anemic female rows.")

    anemic = df[mask].copy()
    anemic_hb = hb_series[mask]

    result: dict = {
        "source": f"Lucknow CBC CSV ({csv_path.name}), anemic rows (Hb < 12 g/dL)",
        "hb": _stats(anemic_hb),
    }
    if mcv_col:
        mcv = pd.to_numeric(anemic[mcv_col], errors="coerce")
        result["mcv_fl"] = _stats(mcv)

    return result


# ── 3. NHANES ferritin ───────────────────────────────────────────────────────

def _find_nhanes_files() -> dict[str, Path | None]:
    """Return dict with keys ferritin, cbc, demo pointing to NHANES XPT/CSV files."""
    result: dict[str, Path | None] = {"ferritin": None, "cbc": None, "demo": None}
    for p in RAW_DIR.iterdir():
        n = p.name.upper()
        if "FERTIN" in n or "FERRITIN" in n:
            result["ferritin"] = p
        elif "CBC" in n or "BLOOD" in n:
            result["cbc"] = p
        elif "DEMO" in n:
            result["demo"] = p
    return result


def _nhanes_stats() -> dict:
    files = _find_nhanes_files()

    if files["ferritin"] is None:
        print("[baselines] NHANES ferritin file not found – using generic fallback.")
        return {
            "source": "fallback – NHANES not found",
            "note": "Ferritin distribution not computed. Add NHANES files to data/raw/.",
            "ferritin_ng_ml": {"mean": 12.0, "sd": 8.0, "p10": 4.0, "p90": 22.0, "n": 0},
        }

    def _read(p: Path) -> pd.DataFrame:
        if p.suffix.upper() == ".XPT":
            try:
                import pyreadstat
                df, _ = pyreadstat.read_xport(str(p))
                return df
            except ImportError:
                pass
            # Fallback: pandas read_sas
            return pd.read_sas(str(p), format="xport", encoding="utf-8")
        return pd.read_csv(str(p), low_memory=False)

    ferritin_df = _read(files["ferritin"])
    print(f"\n[baselines] NHANES ferritin columns:\n  {list(ferritin_df.columns)}\n")

    # Merge with demo and CBC if available
    merged = ferritin_df.copy()
    if files["demo"] is not None:
        demo = _read(files["demo"])
        print(f"[baselines] NHANES demo columns:\n  {list(demo.columns)}\n")
        merged = merged.merge(demo, on="SEQN", how="inner", suffixes=("", "_demo"))
    if files["cbc"] is not None:
        cbc = _read(files["cbc"])
        print(f"[baselines] NHANES CBC columns:\n  {list(cbc.columns)}\n")
        merged = merged.merge(cbc, on="SEQN", how="left", suffixes=("", "_cbc"))

    # Filter: women (RIAGENDR == 2), age 15-49 (RIDAGEYR), low Hb
    if "RIAGENDR" in merged.columns:
        merged = merged[merged["RIAGENDR"] == 2]
    if "RIDAGEYR" in merged.columns:
        merged = merged[merged["RIDAGEYR"].between(15, 49)]

    # Low Hb filter: LBXHGB < 12 g/dL
    hb_col = next((c for c in merged.columns if "HGB" in c.upper()), None)
    if hb_col:
        hb_vals = pd.to_numeric(merged[hb_col], errors="coerce")
        merged = merged[hb_vals < 12.0]
        print(f"[baselines] NHANES: {len(merged)} low-Hb women aged 15-49.")

    # Ferritin column
    ferritin_col = next(
        (c for c in merged.columns if "LBXFER" in c.upper() or "FERR" in c.upper()),
        None,
    )
    if ferritin_col is None:
        print("[baselines] NHANES: no ferritin column found.")
        return {"source": "NHANES (column not identified)", "ferritin_ng_ml": {}}

    ferritin_vals = pd.to_numeric(merged[ferritin_col], errors="coerce")
    return {
        "source": "NHANES FERTIN_L + CBC_L + DEMO_L, merged on SEQN, women 15-49 with Hb < 12 g/dL",
        "population_note": (
            "NHANES is an American sample. Used only to calibrate the shape "
            "of the ferritin distribution, not absolute Indian levels."
        ),
        "ferritin_ng_ml": _stats(ferritin_vals),
    }


# ── 4. NFHS-5 (optional) ─────────────────────────────────────────────────────

def _find_nfhs5() -> Path | None:
    for p in RAW_DIR.iterdir():
        if any(k in p.name.upper() for k in ("NFHS", "IAIR", "IASR")):
            return p
    return None


def _nfhs5_stats() -> dict | None:
    p = _find_nfhs5()
    if p is None:
        print("[baselines] NFHS-5 file not found – skipping (non-fatal).")
        return None

    df = pd.read_csv(p, low_memory=False) if p.suffix in (".csv", ".CSV") else None
    if df is None:
        print(f"[baselines] NFHS-5: unrecognised format {p.suffix} – skipping.")
        return None

    print(f"\n[baselines] NFHS-5 columns:\n  {list(df.columns)}\n")

    # Hb stored ×10 in DHS files (e.g. HV251 or HA55)
    hb_col = next(
        (c for c in df.columns if c.upper() in ("HV251", "HA55", "HB", "HB_ADJ")),
        None,
    )
    age_col = next(
        (c for c in df.columns if c.upper() in ("HV105", "V012", "AGE")), None
    )
    state_col = next(
        (c for c in df.columns if c.upper() in ("HV024", "V024", "SSTATE", "STATE")),
        None,
    )

    if hb_col is None:
        print("[baselines] NFHS-5: Hb column not identified.")
        return None

    hb = pd.to_numeric(df[hb_col], errors="coerce") / 10.0  # convert ×10 to g/dL
    # Keep women 15-49, non-pregnant, non-flagged (flag col HV103)
    flag_col = next((c for c in df.columns if "FLAG" in c.upper()), None)
    mask = hb.between(3.0, 20.0)
    if age_col:
        age = pd.to_numeric(df[age_col], errors="coerce")
        mask &= age.between(15, 49)
    if flag_col:
        mask &= df[flag_col].astype(str).str.strip() == "0"

    result: dict = {
        "source": f"NFHS-5 India IR file ({p.name})",
        "hb_g_dl": _stats(hb[mask]),
    }
    if age_col:
        result["age_years"] = _stats(pd.to_numeric(df[age_col], errors="coerce")[mask])
    if state_col:
        state_hb = (
            df[mask]
            .assign(hb=hb[mask])
            .groupby(state_col)["hb"]
            .agg(["mean", "count"])
            .rename(columns={"mean": "mean_hb", "count": "n"})
            .round(3)
            .to_dict(orient="index")
        )
        result["by_state"] = state_hb

    return result


# ── main ──────────────────────────────────────────────────────────────────────

def build_baselines() -> dict:
    params = load_params()

    print("=" * 60)
    print("IronTwin – baselines.py")
    print("=" * 60)

    out: dict = {}

    # 1. Dryad
    out["dryad_oral_arm"] = _dryad_stats(params)

    # 2. Lucknow
    out["lucknow_cbc"] = _lucknow_stats()

    # 3. NHANES ferritin
    out["nhanes_ferritin"] = _nhanes_stats()

    # 4. NFHS-5 (optional)
    nfhs5 = _nfhs5_stats()
    if nfhs5:
        out["nfhs5"] = nfhs5

    # 5. Athiyarath fallback (always included as the primary Indian calibration target)
    out["india_calibration_athiyarath"] = {
        "source": "Athiyarath et al., Genes Nutr 2015;10:25",
        "note": "Primary Indian calibration target (181 iron-deficient pregnant women).",
        "baseline_hb": params["india_calibration_athiyarath"]["baseline_hb"],
        "hb_week8":    params["india_calibration_athiyarath"]["hb_week8"],
        "hb_week20":   params["india_calibration_athiyarath"]["hb_week20"],
    }

    OUT_PATH.write_text(json.dumps(out, indent=2))
    print(f"\n[baselines] Written -> {OUT_PATH}")
    return out


if __name__ == "__main__":
    result = build_baselines()
    print("\nSummary:")
    for k, v in result.items():
        print(f"  {k}: {list(v.keys())}")
