"""
schemas.py – Pydantic v2 models for all API request and response bodies.

Shapes match frontend_brief.md with clinical extensions for:
- Consumer wearable IoT telemetry (Resting Heart Rate, Daily Steps)
- Clinical Explainability (XAI factor contribution breakdown)
- Ganzoni IV Iron calculation & referral note
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ── sub-models ────────────────────────────────────────────────────────────────

class ReadingPoint(BaseModel):
    """A single Hb measurement combined with consumer wearable IoT stream."""
    day: int = Field(..., description="Days since treatment start")
    hb: float = Field(..., description="Hemoglobin in g/dL")
    heart_rate: int | None = Field(default=None, description="Resting heart rate in bpm (Apple Health / Fitbit telemetry)")
    steps: int | None = Field(default=None, description="Daily step count (wearable activity sensor)")


class ForecastPoint(BaseModel):
    """Predicted Hb at a future week, with uncertainty range."""
    week: int
    hb: float | None
    low: float | None
    high: float | None


class ExplainabilityItem(BaseModel):
    """Clinical XAI Factor Contribution Breakdown for Day-14 warning."""
    factor: str
    contribution_pct: float
    direction: str = Field(..., description="risk | protective")
    explanation: str


# ── patients ──────────────────────────────────────────────────────────────────

class PatientSummary(BaseModel):
    """Compact patient row for the patient-list endpoint."""
    id: str
    name: str
    age: float
    risk: str = Field(..., description="low | medium | high")
    latest_hb: float | None
    day: int | None


class PatientDetail(BaseModel):
    """Full patient record including all readings."""
    id: str
    name: str
    age: float
    simulated: bool
    baseline_hb: float
    ferritin: float
    adherence_pct: float
    readings: list[ReadingPoint]


class NewReadingRequest(BaseModel):
    """Body for POST /patients/{id}/readings."""
    day: int = Field(..., ge=0, le=365, description="Days since treatment start")
    hb: float = Field(..., gt=0, lt=25, description="Hemoglobin in g/dL")
    adherence: float = Field(default=0.88, ge=0.0, le=1.0)
    heart_rate: int | None = Field(default=None, ge=40, le=200)
    steps: int | None = Field(default=None, ge=0, le=50000)


class CreatePatientRequest(BaseModel):
    """Body for POST /patients."""
    name: str
    age: float = Field(..., gt=10, lt=70)
    baseline_hb: float = Field(..., gt=3, lt=18, description="g/dL")
    ferritin: float = Field(..., gt=0, lt=500, description="ng/mL")
    adherence_pct: float = Field(default=88.0, ge=0, le=100)
    inflammation: int = Field(default=0, ge=0, le=1)
    cause: str = Field(default="other")


# ── prediction ────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    """Response for GET /patients/{id}/prediction."""
    day: int
    rise_since_baseline: float
    rule_flag: bool
    rule_text: str
    prob_non_response: float | None
    risk: str
    forecast: list[ForecastPoint]
    status_text: str
    next_step: str
    explainability: list[ExplainabilityItem] | None = None


# ── what-if ───────────────────────────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    """Body for POST /patients/{id}/whatif."""
    scenario: str = Field(
        ...,
        description="better_adherence | iv_iron | iv_iron_cautious | extra_tests",
    )


class CheckItem(BaseModel):
    check: str
    reason: str


class WhatIfResponse(BaseModel):
    """Response for POST /patients/{id}/whatif."""
    scenario: str
    label: str
    forecast: list[ForecastPoint]
    prob_non_response: float | None = None
    note: str | None = None
    checks_to_consider: list[CheckItem] | None = None
    boost_at_week4_g_dl: float | None = None
    ci95: list[float] | None = None
    source: str | None = None


# ── Ganzoni IV Iron & Referral Note ───────────────────────────────────────────

class GanzoniRequest(BaseModel):
    weight_kg: float = Field(default=55.0, ge=30.0, le=140.0)
    target_hb: float = Field(default=14.0, ge=10.0, le=16.0)


class GanzoniResponse(BaseModel):
    patient_id: str
    patient_name: str
    current_hb: float
    target_hb: float
    weight_kg: float
    iron_deficit_mg: float
    recommended_dosing: str
    referral_note: str


# ── program view ──────────────────────────────────────────────────────────────

class ProgramState(BaseModel):
    """One row in the program/states response."""
    state: str
    anemic_women_pct: float
    expected_non_responders_pct: float


# ── computer vision nail screening ────────────────────────────────────────────

class NailScreeningResponse(BaseModel):
    is_anemic: bool
    prediction: str
    probability: float
    threshold: float
    estimated_hb: float
    severity: str
    recommendation: str
    model_name: str
    model_type: str
    dataset_source: str
    patient_auc: float

