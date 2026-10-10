"""
rule.py - Okam day-14 rule classifier.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


class OkamRuleClassifier:
    """
    Wraps the Okam day-14 rule as a sklearn-compatible classifier.
    Predicts non-response if rise_day14 < 1.0 g/dL.
    Source: Okam, Koch & Tran, Haematologica 2016.
    """

    def __init__(self, threshold: float = 1.0) -> None:
        self.threshold = threshold

    def fit(self, X: pd.DataFrame, y: pd.Series) -> "OkamRuleClassifier":
        return self  # rule-based, no fitting

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        rise = X["rise_day14"].values
        prob_nonresp = np.where(rise < self.threshold, 0.78, 0.08)
        return np.column_stack([1 - prob_nonresp, prob_nonresp])

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return (X["rise_day14"].values < self.threshold).astype(int)
