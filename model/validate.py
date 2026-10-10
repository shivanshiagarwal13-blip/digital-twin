"""
validate.py – Compare simulated Hb trajectories against real data.

Plots saved to docs/:
  - validation_indian.png   : simulated vs Athiyarath 2015 (Indian cohort)
  - validation_dryad.png    : simulated vs Dryad oral arm (late-pregnancy, milder)

Each plot shows mean ± SD error bars.

Run:
    python -m model.validate
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
DOCS_DIR = ROOT / "docs"
PARAMS_PATH = ROOT / "params.yaml"
BASELINES_PATH = PROCESSED_DIR / "baselines.json"
PATIENTS_PATH = PROCESSED_DIR / "patients.csv"
READINGS_PATH = PROCESSED_DIR / "readings.csv"

DOCS_DIR.mkdir(parents=True, exist_ok=True)

ACCENT = "#1a6b8a"
REAL_COLOR = "#c0392b"


def _load() -> tuple[pd.DataFrame, pd.DataFrame, dict, dict]:
    if not PATIENTS_PATH.exists():
        raise FileNotFoundError(
            "patients.csv not found. Run `python -m model.simulator` first."
        )
    patients = pd.read_csv(PATIENTS_PATH)
    readings = pd.read_csv(READINGS_PATH)
    with open(PARAMS_PATH) as f:
        params = yaml.safe_load(f)
    baselines = json.loads(BASELINES_PATH.read_text()) if BASELINES_PATH.exists() else {}
    return patients, readings, params, baselines


def _sim_stats_at_days(readings: pd.DataFrame, days: list[int]) -> dict[int, dict]:
    """Return mean and SD of Hb across all patients at each day."""
    result = {}
    for d in days:
        s = readings[readings["day"] == d]["hb"]
        result[d] = {"mean": s.mean(), "sd": s.std(ddof=1), "n": len(s)}
    return result


def _plot_comparison(
    sim_points: list[tuple[float, float, float]],   # (week_float, mean, sd)
    real_points: list[tuple[float, float, float | None]],  # (week_float, mean, sd or None)
    title: str,
    subtitle: str,
    filename: str,
) -> None:
    """
    sim_points: list of (week, mean, sd) – blue
    real_points: list of (week, mean, sd or None) – red
    """
    fig, ax = plt.subplots(figsize=(7, 4.5))
    fig.patch.set_facecolor("white")

    sw, sm, ss = zip(*sim_points)
    rw, rm, rs = zip(*real_points)

    ax.errorbar(
        sw, sm,
        yerr=[s if s else 0 for s in ss],
        fmt="o-", color=ACCENT, label="Simulated (this model)",
        capsize=4, linewidth=2, markersize=6,
    )
    ax.errorbar(
        rw, rm,
        yerr=[s if s else 0 for s in rs],
        fmt="s--", color=REAL_COLOR, label="Real data",
        capsize=4, linewidth=1.5, markersize=6,
    )

    ax.set_xlabel("Week", fontsize=11)
    ax.set_ylabel("Hemoglobin (g/dL)", fontsize=11)
    ax.set_title(title, fontsize=12, fontweight="bold", pad=8)
    ax.text(0.5, -0.18, subtitle, transform=ax.transAxes,
            fontsize=8, ha="center", color="#555555")
    ax.legend(fontsize=9, framealpha=0.8)
    ax.yaxis.set_minor_locator(mticker.AutoMinorLocator())
    ax.grid(True, which="major", linestyle="--", alpha=0.4)
    ax.grid(True, which="minor", linestyle=":", alpha=0.2)

    plt.tight_layout()
    out = DOCS_DIR / filename
    fig.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"[validate] Saved → {out}")


def validate_indian(readings: pd.DataFrame, params: dict) -> None:
    """Simulated vs Athiyarath 2015 (Indian cohort)."""
    india = params["india_calibration_athiyarath"]
    T = CALIBRATION_TARGETS = {
        0: {"mean": india["baseline_hb"]["mean"], "sd": india["baseline_hb"]["sd"]},
        56: {"mean": india["hb_week8"]["mean"],   "sd": india["hb_week8"]["sd"]},
        140: {"mean": india["hb_week20"]["mean"],  "sd": india["hb_week20"]["sd"]},  # week 20
    }

    sim = _sim_stats_at_days(readings, [0, 56, 84])

    sim_points = [
        (0,  sim[0]["mean"],  sim[0]["sd"]),
        (8,  sim[56]["mean"], sim[56]["sd"]),
        (12, sim[84]["mean"], sim[84]["sd"]),   # week 12 is the furthest we simulate
    ]
    real_points = [
        (0,  T[0]["mean"],   T[0]["sd"]),
        (8,  T[56]["mean"],  T[56]["sd"]),
        # Week-20 target shown as reference even though simulator only goes to week 12
        (20, T[140]["mean"], T[140]["sd"]),
    ]

    print("\n[validate] Indian calibration comparison (Athiyarath 2015):")
    print(f"  Week 0 : simulated {sim[0]['mean']:.2f} ± {sim[0]['sd']:.2f}  |  "
          f"real {T[0]['mean']:.2f} ± {T[0]['sd']:.2f}")
    print(f"  Week 8 : simulated {sim[56]['mean']:.2f} ± {sim[56]['sd']:.2f}  |  "
          f"real {T[56]['mean']:.2f} ± {T[56]['sd']:.2f}")
    print(f"  Week 12: simulated {sim[84]['mean']:.2f} ± {sim[84]['sd']:.2f}  |  "
          f"real week-20 target {T[140]['mean']:.2f} ± {T[140]['sd']:.2f}")

    _plot_comparison(
        sim_points,
        real_points,
        title="Simulated vs Real: Indian cohort (Athiyarath 2015)",
        subtitle=(
            "Real: 181 iron-deficient pregnant women, community health center, India.\n"
            "Simulator calibrated to week-8 and week-20 targets."
        ),
        filename="validation_indian.png",
    )


def validate_dryad(readings: pd.DataFrame, params: dict, baselines: dict) -> None:
    """
    Simulated vs Dryad oral arm.
    Dryad patients are late-pregnancy, Hb ~10.2 g/dL (milder anemia).
    We use the real-data stats from params / baselines.
    Expected mismatch – documented openly.
    """
    dryad_key = "dryad_oral_arm"
    if dryad_key not in baselines:
        dryad_key = "dryad_oral_arm_validation"
        if dryad_key not in params:
            print("[validate] Dryad stats not available – skipping Dryad plot.")
            return

    if dryad_key in baselines:
        d = baselines[dryad_key]
        screen = d.get("screening_hb", params["dryad_oral_arm_validation"]["screening_hb"])
        wk4    = d.get("hb_week4",     params["dryad_oral_arm_validation"]["hb_week4"])
        wk8    = d.get("hb_week8",     params["dryad_oral_arm_validation"]["hb_week8"])
    else:
        d = params["dryad_oral_arm_validation"]
        screen = d["screening_hb"]
        wk4    = d["hb_week4"]
        wk8    = d["hb_week8"]

    sim = _sim_stats_at_days(readings, [0, 28, 56])

    sim_points = [
        (0, sim[0]["mean"],  sim[0]["sd"]),
        (4, sim[28]["mean"], sim[28]["sd"]),
        (8, sim[56]["mean"], sim[56]["sd"]),
    ]
    real_points = [
        (0, screen["mean"], screen.get("sd")),
        (4, wk4["mean"],    wk4.get("sd")),
        (8, wk8["mean"],    wk8.get("sd")),
    ]

    print("\n[validate] Dryad oral arm comparison:")
    print(f"  Week 0 : simulated {sim[0]['mean']:.2f}  |  real {screen['mean']:.2f}")
    print(f"  Week 4 : simulated {sim[28]['mean']:.2f}  |  real {wk4['mean']:.2f}")
    print(f"  Week 8 : simulated {sim[56]['mean']:.2f}  |  real {wk8['mean']:.2f}")
    print("  [NOTE]  Dryad patients have milder anemia (late pregnancy, Hb ~10.2).")
    print("          Simulated patients have more severe baseline anemia (~9.3).")
    print("          This mismatch is expected and documented in the README.")

    _plot_comparison(
        sim_points,
        real_points,
        title="Simulated vs Real: Dryad trial oral arm",
        subtitle=(
            "Real: 40 oral-iron women, late pregnancy (Hb ~10.2 g/dL at baseline).\n"
            "Simulator calibrated to Indian cohort – mismatch at baseline is expected."
        ),
        filename="validation_dryad.png",
    )


def validate_okam_shares(readings: pd.DataFrame, params: dict) -> None:
    """Print share of responders reaching +1 and +2 g/dL vs Okam Fig 1."""
    resp_ids = pd.read_csv(PATIENTS_PATH)
    resp_ids = resp_ids[resp_ids["is_responder"] == 1]["patient_id"]
    resp_r = readings[readings["patient_id"].isin(resp_ids)]

    d0 = resp_r[resp_r["day"] == 0].set_index("patient_id")["hb"]

    okam = params["okam_trajectory_share_reaching_rise"]

    print("\n[validate] Responder shares reaching Hb rise thresholds (vs Okam 2016 Fig 1):")
    print(f"  {'Day':>5}  {'Thr':>4}  {'Simulated':>10}  {'Okam':>8}")
    for day, day_label, okam_key in [
        (28, "day28", "day28"),
        (42, "day42", "day42"),
    ]:
        dx = resp_r[resp_r["day"] == day].set_index("patient_id")["hb"]
        rise = (dx - d0.reindex(dx.index)).dropna()
        for thr, thr_key in [(1.0, "ge_1"), (2.0, "ge_2")]:
            sim_share  = (rise >= thr).mean()
            real_share = okam[okam_key][thr_key]["responders"]
            print(f"  {day:>5}  +{thr:.0f}   {sim_share:.3f}        {real_share:.3f}")


def run() -> None:
    patients, readings, params, baselines = _load()
    validate_indian(readings, params)
    validate_dryad(readings, params, baselines)
    validate_okam_shares(readings, params)
    print("\n[validate] Done.")


if __name__ == "__main__":
    run()
