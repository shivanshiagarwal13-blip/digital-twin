"""
train.py – Train non-response prediction models on simulated patients.

Features (day-0 to day-14 only — NO leakage):
    baseline_hb, ferritin, age, hb_day7, hb_day14, rise_day14,
    adherence, inflammation

Target:
    nonresponse_w8  (1 = Hb rise < 2.0 g/dL by week 8, 0 = good responder)
    This is a LATER outcome – predicting a later milestone, not the rule itself.

Models compared:
    (a) Okam day-14 rule  – flag if rise_day14 < 1.0 g/dL
    (b) Logistic regression
    (c) Gradient boosting (HistGradientBoostingClassifier)

Output:
    model/model.pkl        – best model (or rule wrapper if ML doesn't beat it)
    model/train_report.txt – AUC, sensitivity, specificity table

Run:
    python -m model.train
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import yaml
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
MODEL_DIR = ROOT / "model"
PATIENTS_PATH = PROCESSED_DIR / "patients.csv"
MODEL_OUT = MODEL_DIR / "model.pkl"
REPORT_OUT = MODEL_DIR / "train_report.txt"

FEATURES = [
    "baseline_hb",
    "ferritin",
    "age",
    "hb_day7",
    "hb_day14",
    "rise_day14",
    "adherence",
    "inflammation",
]
TARGET = "nonresponse_w8"
SEED = 42


from model.rule import OkamRuleClassifier


# ── metrics ───────────────────────────────────────────────────────────────────

def _metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    auc = roc_auc_score(y_true, y_prob)
    return {
        "sensitivity": round(sensitivity, 3),
        "specificity": round(specificity, 3),
        "auc":         round(auc, 3),
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
    }


# ── main ──────────────────────────────────────────────────────────────────────

def train() -> dict[str, Any]:
    if not PATIENTS_PATH.exists():
        raise FileNotFoundError(
            "patients.csv not found. Run `python -m model.simulator` first."
        )

    patients = pd.read_csv(PATIENTS_PATH)

    # Drop rows with missing day-7 / day-14 readings (should not happen, but guard)
    patients = patients.dropna(subset=FEATURES + [TARGET])
    print(f"[train] Loaded {len(patients)} patients.")

    X = patients[FEATURES]
    y = patients[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=SEED, stratify=y
    )

    # ── (a) Okam rule ─────────────────────────────────────────────────────────
    rule = OkamRuleClassifier()
    rule.fit(X_train, y_train)
    rule_pred = rule.predict(X_test)
    rule_prob = rule.predict_proba(X_test)[:, 1]
    rule_m = _metrics(y_test.values, rule_pred, rule_prob)
    print(f"[train] Okam rule     AUC={rule_m['auc']:.3f}  "
          f"Sen={rule_m['sensitivity']:.3f}  Spe={rule_m['specificity']:.3f}")

    # ── (b) Logistic regression ───────────────────────────────────────────────
    lr_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    LogisticRegression(
            max_iter=500, random_state=SEED, class_weight="balanced"
        )),
    ])
    lr_pipe.fit(X_train, y_train)
    lr_pred = lr_pipe.predict(X_test)
    lr_prob = lr_pipe.predict_proba(X_test)[:, 1]
    lr_m = _metrics(y_test.values, lr_pred, lr_prob)
    print(f"[train] LogReg        AUC={lr_m['auc']:.3f}  "
          f"Sen={lr_m['sensitivity']:.3f}  Spe={lr_m['specificity']:.3f}")

    # ── (c) Gradient boosting ─────────────────────────────────────────────────
    gb = HistGradientBoostingClassifier(
        max_iter=200, random_state=SEED, class_weight="balanced",
        early_stopping=True, validation_fraction=0.1,
    )
    gb.fit(X_train, y_train)
    gb_pred = gb.predict(X_test)
    gb_prob = gb.predict_proba(X_test)[:, 1]
    gb_m = _metrics(y_test.values, gb_pred, gb_prob)
    print(f"[train] GradBoost     AUC={gb_m['auc']:.3f}  "
          f"Sen={gb_m['sensitivity']:.3f}  Spe={gb_m['specificity']:.3f}")

    # ── choose winner ─────────────────────────────────────────────────────────
    results = {
        "okam_rule": {"model": rule,    "metrics": rule_m},
        "logreg":    {"model": lr_pipe, "metrics": lr_m},
        "gradboost": {"model": gb,      "metrics": gb_m},
    }

    # If no ML model beats the rule on AUC, keep rule as primary decision-maker
    rule_auc = rule_m["auc"]
    best_ml_name = max(
        ("logreg", "gradboost"),
        key=lambda k: results[k]["metrics"]["auc"],
    )
    best_ml_auc = results[best_ml_name]["metrics"]["auc"]

    if best_ml_auc > rule_auc + 0.01:
        winner_name = best_ml_name
        print(f"[train] Winner: {winner_name} (AUC {best_ml_auc:.3f} > rule AUC {rule_auc:.3f})")
    else:
        winner_name = "okam_rule"
        print(
            f"[train] ML did not beat the rule (best ML AUC {best_ml_auc:.3f} "
            f"vs rule {rule_auc:.3f}). Rule is primary; ML used only for probability."
        )

    winner = results[winner_name]["model"]

    # Package: always save rule + best ML for probability, plus metadata
    bundle = {
        "primary_model":   winner,
        "primary_name":    winner_name,
        "logreg":          lr_pipe,
        "gradboost":       gb,
        "okam_rule":       rule,
        "prob_model":      results[best_ml_name]["model"],
        "prob_model_name": best_ml_name,
        "features":        FEATURES,
        "target":          TARGET,
        "metrics": {
            "okam_rule": rule_m,
            "logreg":    lr_m,
            "gradboost": gb_m,
        },
        "patients_used": len(patients),
    }

    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(bundle, MODEL_OUT)
    print(f"[train] Saved → {MODEL_OUT}")

    # Write human-readable report
    report_lines = [
        "IronTwin – Model Training Report",
        "=" * 50,
        f"Training patients : {len(X_train)}",
        f"Test patients     : {len(X_test)}",
        f"Features          : {', '.join(FEATURES)}",
        f"Target            : {TARGET}  (Hb rise < 2.0 g/dL by week 8)",
        "",
        "Results on held-out test set:",
        f"  {'Model':<18}  {'AUC':>5}  {'Sen':>5}  {'Spe':>5}",
        "-" * 45,
    ]
    for name, res in [
        ("Okam rule",  rule_m),
        ("LogReg",     lr_m),
        ("GradBoost",  gb_m),
    ]:
        report_lines.append(
            f"  {name:<18}  {res['auc']:>5.3f}  {res['sensitivity']:>5.3f}  {res['specificity']:>5.3f}"
        )
    report_lines += [
        "",
        f"Primary decision model : {winner_name}",
        f"Probability model      : {best_ml_name}",
        "",
        "NOTE: Models are trained on SIMULATED patients only.",
        "Credibility comes from simulator validation against real Dryad trial data.",
    ]
    report_text = "\n".join(report_lines)
    REPORT_OUT.write_text(report_text)
    print(f"[train] Report → {REPORT_OUT}")
    print("\n" + report_text)

    return bundle


if __name__ == "__main__":
    train()
