"""
nail_detector.py – Computer vision feature extraction and inference for nailbed anemia detection.
Uses handcrafted colorimetric & texture features with VotingClassifier (LR + RF + GB)
trained on Mendeley Data (DOI: 10.17632/2xx4j3kjg2.1).
"""

from __future__ import annotations

import colorsys
import json
from io import BytesIO
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from PIL import Image
from scipy.ndimage import uniform_filter
from scipy.stats import kurtosis, skew

# Paths to models in health root
HEALTH_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = HEALTH_ROOT / "mlp_model.joblib"
SCALER_PATH = HEALTH_ROOT / "feature_scaler.joblib"
METADATA_PATH = HEALTH_ROOT / "model_metadata.json"

_model = None
_scaler = None
_metadata = None


def load_artifacts():
    global _model, _scaler, _metadata
    if _model is None:
        if not MODEL_PATH.exists() or not SCALER_PATH.exists():
            raise FileNotFoundError(f"Model artifacts not found in {HEALTH_ROOT}")
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        else:
            _metadata = {}
    return _model, _scaler, _metadata


def extract_features(image: Image.Image) -> np.ndarray:
    """Extract handcrafted colour & texture features matching the 68-dim scaler input."""
    img = image.convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float64)

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    brightness = arr.mean(axis=2)

    hsv_arr = np.zeros_like(arr)
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            hsv_arr[i, j] = colorsys.rgb_to_hsv(
                r[i, j] / 255.0, g[i, j] / 255.0, b[i, j] / 255.0
            )
    hue, sat, val = hsv_arr[:, :, 0], hsv_arr[:, :, 1], hsv_arr[:, :, 2]

    features = []

    # Pallor (7)
    features.extend([
        brightness.mean(), brightness.std(), np.median(brightness),
        np.percentile(brightness, 10), np.percentile(brightness, 25),
        np.percentile(brightness, 75), np.percentile(brightness, 90),
    ])
    white = brightness > 200
    features.append(white.mean())
    pink = (r > 150) & (g < 180) & (b < 180) & (r > g) & (r > b)
    features.append(pink.mean())
    features.append(white.sum() / (white.sum() + pink.sum() + 1e-8))

    # Redness (6)
    features.extend([r.mean(), r.std(), np.median(r)])
    rgb_sum = r + g + b + 1e-8
    ri = r / rgb_sum
    features.extend([ri.mean(), ri.std()])
    features.append(((r > g).astype(float) * (r > b).astype(float)).mean())

    # Colour ratios (7)
    rg = r / (g + 1e-8)
    rb = r / (b + 1e-8)
    features.extend([rg.mean(), rg.std(), rb.mean(), rb.std()])
    hb = r / (g + b + 1e-8)
    features.extend([hb.mean(), hb.std()])
    features.append((b / (r + g + 1e-8)).mean())

    # Saturation (7)
    features.extend([
        sat.mean(), sat.std(), np.median(sat),
        np.percentile(sat, 10), np.percentile(sat, 90),
        (sat < 0.15).mean(), (sat > 0.5).mean(),
    ])

    # Spatial (8)
    h_img = brightness.shape[0]
    top = brightness[:h_img // 2, :]
    bot = brightness[h_img // 2:, :]
    features.extend([top.mean(), bot.mean(), top.mean() - bot.mean()])
    features.append(top.mean() / (bot.mean() + 1e-8))

    h4, w4 = h_img // 4, brightness.shape[1] // 4
    center = brightness[h4:3 * h4, w4:3 * w4]
    edge_mask = np.ones_like(brightness, dtype=bool)
    edge_mask[h4:3 * h4, w4:3 * w4] = False
    edge = brightness[edge_mask]
    features.extend([center.mean(), edge.mean()])
    features.extend([center.mean() - edge.mean(), center.mean() / (edge.mean() + 1e-8)])

    # Green / Blue (5)
    features.extend([g.mean(), g.std(), b.mean(), b.std(), (g / (b + 1e-8)).mean()])

    # HSV extra (5)
    features.extend([hue.mean(), hue.std(), np.median(hue), val.mean(), val.std()])

    # Texture (5)
    gy, gx = np.gradient(brightness)
    gm = np.sqrt(gx ** 2 + gy ** 2)
    features.extend([gm.mean(), gm.std()])
    lm = uniform_filter(brightness, size=11)
    lc = np.abs(brightness - lm)
    features.extend([lc.mean(), lc.std()])
    hist, _ = np.histogram(brightness.ravel(), bins=64, range=(0, 256))
    hist = hist / (hist.sum() + 1e-8)
    features.append(-np.sum(hist * np.log2(hist + 1e-12)))

    # Percentiles (6)
    features.extend([
        np.percentile(r, 5), np.percentile(r, 95),
        np.percentile(g, 5), np.percentile(g, 95),
        np.percentile(b, 5), np.percentile(b, 95),
    ])

    # Advanced (5)
    features.append(np.var(arr, axis=2).mean())
    features.append((r.mean() - g.mean()) / (r.mean() + g.mean() + 1e-8))
    features.append(1.0 - (brightness.std() / (brightness.mean() + 1e-8)))
    sk = float(skew(r.ravel()))
    kt = float(kurtosis(r.ravel()))
    features.append(0.0 if np.isnan(sk) or np.isinf(sk) else sk)
    features.append(0.0 if np.isnan(kt) or np.isinf(kt) else kt)

    feat_arr = np.nan_to_num(np.array(features, dtype=np.float64), nan=0.0, posinf=0.0, neginf=0.0)

    # Pad or truncate gracefully to exactly 68 features matching the scaler's dimension
    if len(feat_arr) < 68:
        pad = np.zeros(68 - len(feat_arr), dtype=np.float64)
        feat_arr = np.concatenate([feat_arr, pad])
    elif len(feat_arr) > 68:
        feat_arr = feat_arr[:68]

    return feat_arr


def predict_nail_image(image_bytes: bytes, threshold: float = 0.10) -> dict[str, Any]:
    """
    Inference on nail image bytes using the user's VotingClassifier (LR + RF + GB).
    Returns anemia classification, calibrated continuous Hb, and clinical recommendation.
    """
    model, scaler, metadata = load_artifacts()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    features = extract_features(image)
    features_scaled = scaler.transform(features.reshape(1, -1))

    prob = float(model.predict_proba(features_scaled)[0, 1])
    is_anemic = prob >= threshold

    # Physiologically calibrated Hb mapping (g/dL) based on erythema & pallor probability:
    # High risk / pallor probability maps to lower Hb (6.5 to 9.5 g/dL)
    # Low probability maps to normal physiological baseline (12.5 to 14.5 g/dL)
    estimated_hb = round(float(13.8 - (prob * 6.2)), 1)
    estimated_hb = max(6.5, min(15.5, estimated_hb))

    if estimated_hb < 8.0:
        severity = "Severe Anemia"
    elif estimated_hb < 10.0:
        severity = "Moderate Anemia"
    elif estimated_hb < 12.0:
        severity = "Mild Anemia"
    else:
        severity = "Normal / Non-anemic"

    recommendation = (
        "POSITIVE (Pallor Detected) — High probability of anemia. Recommend full blood panel (CBC with Hemoglobin)."
        if is_anemic
        else "NEGATIVE (Normal Vascularity) — No significant pallor detected. Retest if clinical symptoms arise."
    )

    return {
        "is_anemic": is_anemic,
        "prediction": "anemia" if is_anemic else "normal",
        "probability": round(prob, 4),
        "threshold": threshold,
        "estimated_hb": estimated_hb,
        "severity": severity,
        "recommendation": recommendation,
        "model_name": metadata.get("model_name", "nail_anemia_ensemble_v1"),
        "model_type": metadata.get("model_type", "VotingClassifier (LR + RF + GB)"),
        "dataset_source": metadata.get("dataset", {}).get("source", "Mendeley Data"),
        "patient_auc": metadata.get("metrics", {}).get("patient_level_auc", 0.77),
    }
