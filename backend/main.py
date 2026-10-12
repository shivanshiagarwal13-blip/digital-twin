"""
main.py – FastAPI application for IronTwin.

Routes
------
GET  /patients                       list all patients (with risk + latest Hb)
POST /patients                       create a new patient
GET  /patients/{id}                  patient detail + all readings
POST /patients/{id}/readings         add a new Hb reading
GET  /patients/{id}/prediction       day-14 rule + ML probability + forecast
POST /patients/{id}/whatif           scenario analysis
GET  /program/states                 state-level anemia data (NFHS-5 public report)

Start:
    cd irontwin
    uvicorn backend.main:app --reload
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend import db, schemas

ROOT = Path(__file__).resolve().parents[1]
STATES_JSON = ROOT / "data" / "processed" / "states.json"

app = FastAPI(
    title="IronTwin API",
    description=(
        "Decision support for oral iron therapy in anemia. "
        "Decision support only. Not a diagnosis. Simulated patients."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup() -> None:
    db.init_db()
    # Seed demo patients if the DB is empty
    if not db.list_patients():
        try:
            from backend.seed import seed_demo
            seed_demo()
        except Exception as exc:
            print(f"[main] Demo seed failed (non-fatal): {exc}")


# ── helpers ───────────────────────────────────────────────────────────────────

def _patient_risk(patient_id: str) -> tuple[str, float | None, int | None]:
    """Compute risk label and latest Hb for a patient."""
    try:
        from model.predict import predict as _predict
        readings = db.get_readings(patient_id)
        if not readings:
            return "medium", None, None

        pat = db.get_patient(patient_id)
        if pat is None:
            return "medium", None, None

        reading_list = list(readings)
        latest = reading_list[-1]

        d7_row  = next((r for r in reading_list if r["day"] == 7), None)
        d14_row = next((r for r in reading_list if r["day"] == 14), None)

        result = _predict(
            baseline_hb   = pat["baseline_hb"],
            ferritin      = pat["ferritin"],
            age           = pat["age"],
            hb_day7       = d7_row["hb"]  if d7_row  else None,
            hb_day14      = d14_row["hb"] if d14_row else None,
            adherence     = pat["adherence_pct"] / 100.0,
            inflammation  = pat["inflammation"],
        )
        return result["risk"], float(latest["hb"]), int(latest["day"])
    except Exception:
        latest = db.get_latest_reading(patient_id)
        return (
            "medium",
            float(latest["hb"]) if latest else None,
            int(latest["day"]) if latest else None,
        )


# ── patients ──────────────────────────────────────────────────────────────────

@app.get("/patients", response_model=list[schemas.PatientSummary])
def list_patients() -> list[schemas.PatientSummary]:
    """List all patients with their current risk level and latest Hb."""
    rows = db.list_patients()
    result = []
    for row in rows:
        risk, latest_hb, latest_day = _patient_risk(row["id"])
        result.append(schemas.PatientSummary(
            id=row["id"],
            name=row["name"],
            age=row["age"],
            risk=risk,
            latest_hb=latest_hb,
            day=latest_day,
        ))
    return result


@app.post("/patients", response_model=schemas.PatientDetail, status_code=201)
def create_patient(body: schemas.CreatePatientRequest) -> schemas.PatientDetail:
    """Create a new (simulated) patient."""
    patient_id = f"p{uuid.uuid4().hex[:6]}"
    db.upsert_patient(
        id=patient_id,
        name=body.name,
        age=body.age,
        baseline_hb=body.baseline_hb,
        ferritin=body.ferritin,
        adherence_pct=body.adherence_pct,
        inflammation=body.inflammation,
        cause=body.cause,
        simulated=1,
    )
    # Store day-0 reading automatically
    db.upsert_reading(patient_id, day=0, hb=body.baseline_hb)

    return _build_patient_detail(patient_id)


@app.get("/patients/{patient_id}", response_model=schemas.PatientDetail)
def get_patient(patient_id: str) -> schemas.PatientDetail:
    """Get full patient record including all readings."""
    pat = db.get_patient(patient_id)
    if pat is None:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")
    return _build_patient_detail(patient_id)


def _build_patient_detail(patient_id: str) -> schemas.PatientDetail:
    pat = db.get_patient(patient_id)
    readings = db.get_readings(patient_id)
    return schemas.PatientDetail(
        id=pat["id"],
        name=pat["name"],
        age=pat["age"],
        simulated=bool(pat["simulated"]),
        baseline_hb=pat["baseline_hb"],
        ferritin=pat["ferritin"],
        adherence_pct=pat["adherence_pct"],
        readings=[
            schemas.ReadingPoint(
                day=r["day"],
                hb=r["hb"],
                heart_rate=r["heart_rate"] if "heart_rate" in r.keys() else None,
                steps=r["steps"] if "steps" in r.keys() else None,
            )
            for r in readings
        ],
    )


@app.post("/patients/{patient_id}/readings", response_model=schemas.PatientDetail)
def add_reading(patient_id: str, body: schemas.NewReadingRequest) -> schemas.PatientDetail:
    """Add a new Hb reading for a patient with wearable telemetry."""
    if db.get_patient(patient_id) is None:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")
    db.upsert_reading(patient_id, body.day, body.hb, body.adherence, body.heart_rate, body.steps)
    return _build_patient_detail(patient_id)


# ── prediction ────────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/prediction", response_model=schemas.PredictionResponse)
def get_prediction(patient_id: str) -> schemas.PredictionResponse:
    """
    Return the day-14 rule flag, ML probability, Hb forecast range, and XAI factor explainability.
    Returns 'waiting' state if day-14 reading is not yet recorded.
    Decision support only. Not a diagnosis.
    """
    pat = db.get_patient(patient_id)
    if pat is None:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    try:
        from model.predict import predict as _predict
    except ImportError as exc:
        raise HTTPException(status_code=503, detail=f"Model not available: {exc}")

    readings = db.get_readings(patient_id)
    reading_list = list(readings)

    d7_row  = next((r for r in reading_list if r["day"] == 7),  None)
    d14_row = next((r for r in reading_list if r["day"] == 14), None)

    try:
        result = _predict(
            baseline_hb  = pat["baseline_hb"],
            ferritin     = pat["ferritin"],
            age          = pat["age"],
            hb_day7      = d7_row["hb"]  if d7_row  else None,
            hb_day14     = d14_row["hb"] if d14_row else None,
            adherence    = pat["adherence_pct"] / 100.0,
            inflammation = pat["inflammation"],
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc) + " Run `python -m model.train` first.",
        )

    explain_items = None
    if "explainability" in result and result["explainability"]:
        explain_items = [schemas.ExplainabilityItem(**item) for item in result["explainability"]]

    return schemas.PredictionResponse(
        day                  = result["day"],
        rise_since_baseline  = result["rise_since_baseline"],
        rule_flag            = result["rule_flag"],
        rule_text            = result["rule_text"],
        prob_non_response    = result["prob_non_response"],
        risk                 = result["risk"],
        forecast             = [schemas.ForecastPoint(**p) for p in result["forecast"]],
        status_text          = result["status_text"],
        next_step            = result["next_step"],
        explainability       = explain_items,
    )


# ── what-if ───────────────────────────────────────────────────────────────────

@app.post("/patients/{patient_id}/whatif", response_model=schemas.WhatIfResponse)
def whatif(patient_id: str, body: schemas.WhatIfRequest) -> schemas.WhatIfResponse:
    """
    Return an alternative Hb forecast for a given scenario.
    Scenarios: better_adherence | iv_iron | iv_iron_cautious | extra_tests
    """
    pat = db.get_patient(patient_id)
    if pat is None:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    try:
        from model.whatif import whatif as _whatif
    except ImportError as exc:
        raise HTTPException(status_code=503, detail=f"Model not available: {exc}")

    readings = db.get_readings(patient_id)
    reading_list = list(readings)
    d7_row  = next((r for r in reading_list if r["day"] == 7),  None)
    d14_row = next((r for r in reading_list if r["day"] == 14), None)

    if d14_row is None:
        raise HTTPException(
            status_code=422,
            detail="Day-14 reading required for what-if scenarios.",
        )

    try:
        result = _whatif(
            baseline_hb  = pat["baseline_hb"],
            ferritin     = pat["ferritin"],
            age          = pat["age"],
            hb_day7      = d7_row["hb"] if d7_row else pat["baseline_hb"],
            hb_day14     = d14_row["hb"],
            adherence    = pat["adherence_pct"] / 100.0,
            inflammation = pat["inflammation"],
            scenario     = body.scenario,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    checks = None
    if "checks_to_consider" in result and result["checks_to_consider"]:
        checks = [schemas.CheckItem(**c) for c in result["checks_to_consider"]]

    return schemas.WhatIfResponse(
        scenario             = result["scenario"],
        label                = result["label"],
        forecast             = [schemas.ForecastPoint(**p) for p in result["forecast"]],
        prob_non_response    = result.get("prob_non_response"),
        note                 = result.get("note"),
        checks_to_consider   = checks,
        boost_at_week4_g_dl  = result.get("boost_at_week4_g_dl"),
        ci95                 = result.get("ci95"),
        source               = result.get("source"),
    )


# ── program view ──────────────────────────────────────────────────────────────

@app.get("/program/states", response_model=list[schemas.ProgramState])
def program_states() -> list[schemas.ProgramState]:
    """
    State-level anemia and expected non-responder data.
    Source: NFHS-5 public state factsheets (2019-21).
    Non-responder % derived using Okam 2016 non-responder fraction (27.2 %).
    """
    if STATES_JSON.exists():
        data = json.loads(STATES_JSON.read_text())
        return [schemas.ProgramState(**row) for row in data]

    # Inline fallback so the endpoint always works
    FALLBACK = [
        {"state": "Rajasthan",        "anemic_women_pct": 54.4, "expected_non_responders_pct": 30},
        {"state": "Uttar Pradesh",    "anemic_women_pct": 50.4, "expected_non_responders_pct": 28},
        {"state": "Jharkhand",        "anemic_women_pct": 65.4, "expected_non_responders_pct": 36},
        {"state": "Bihar",            "anemic_women_pct": 63.5, "expected_non_responders_pct": 35},
        {"state": "Madhya Pradesh",   "anemic_women_pct": 54.7, "expected_non_responders_pct": 30},
        {"state": "Chhattisgarh",     "anemic_women_pct": 56.7, "expected_non_responders_pct": 31},
        {"state": "Gujarat",          "anemic_women_pct": 65.0, "expected_non_responders_pct": 36},
        {"state": "Maharashtra",      "anemic_women_pct": 45.7, "expected_non_responders_pct": 25},
        {"state": "Andhra Pradesh",   "anemic_women_pct": 59.8, "expected_non_responders_pct": 33},
        {"state": "Telangana",        "anemic_women_pct": 56.5, "expected_non_responders_pct": 31},
        {"state": "Karnataka",        "anemic_women_pct": 45.7, "expected_non_responders_pct": 25},
        {"state": "Tamil Nadu",       "anemic_women_pct": 44.7, "expected_non_responders_pct": 24},
        {"state": "West Bengal",      "anemic_women_pct": 62.5, "expected_non_responders_pct": 34},
        {"state": "Odisha",           "anemic_women_pct": 63.0, "expected_non_responders_pct": 35},
        {"state": "Assam",            "anemic_women_pct": 54.3, "expected_non_responders_pct": 30},
        {"state": "Punjab",           "anemic_women_pct": 52.9, "expected_non_responders_pct": 29},
        {"state": "Haryana",          "anemic_women_pct": 61.8, "expected_non_responders_pct": 34},
        {"state": "Delhi",            "anemic_women_pct": 51.1, "expected_non_responders_pct": 28},
        {"state": "Kerala",           "anemic_women_pct": 36.3, "expected_non_responders_pct": 20},
        {"state": "Himachal Pradesh", "anemic_women_pct": 54.5, "expected_non_responders_pct": 30},
    ]
    return [schemas.ProgramState(**row) for row in FALLBACK]


# ── Ganzoni IV Iron & Clinical Escalation ─────────────────────────────────────

@app.post("/patients/{patient_id}/ganzoni", response_model=schemas.GanzoniResponse)
def calculate_ganzoni(patient_id: str, body: schemas.GanzoniRequest) -> schemas.GanzoniResponse:
    """
    Calculate Ganzoni IV Iron deficit and generate a formal clinical referral note.
    Ganzoni Equation: Weight * (Target Hb - Current Hb) * 2.4 + 500 mg storage iron
    """
    pat = db.get_patient(patient_id)
    if pat is None:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    latest = db.get_latest_reading(patient_id)
    current_hb = float(latest["hb"]) if latest else float(pat["baseline_hb"])

    deficit = round(max(100.0, body.weight_kg * (body.target_hb - current_hb) * 2.4 + 500.0), 0)

    if deficit > 1000:
        dosing = f"Ferric Carboxymaltose (FCM): 1000 mg IV infusion in 250 mL 0.9% NaCl over 15 min; second dose of {deficit - 1000:.0f} mg at Day 7 (Total required: {deficit:.0f} mg)."
    else:
        dosing = f"Ferric Carboxymaltose (FCM): Single 1000 mg IV infusion in 250 mL 0.9% NaCl over 15 min (Total deficit: {deficit:.0f} mg)."

    referral_note = (
        f"CLINICAL REFERRAL & PARENTERAL ESCALATION NOTE\n"
        f"--------------------------------------------------\n"
        f"Patient: {pat['name']} | ID: {pat['id']} | Age: {pat['age']} years\n"
        f"Clinical Indication: Day-14 failure of oral iron therapy (rise < 1.0 g/dL).\n"
        f"Current Hemoglobin: {current_hb:.1f} g/dL | Target: {body.target_hb:.1f} g/dL | Weight: {body.weight_kg:.1f} kg\n"
        f"Total Iron Deficit (Ganzoni Equation): {deficit:.0f} mg elemental iron.\n"
        f"Recommended Action: Switch from oral iron to {dosing}\n"
        f"Etiological Workup: Check Serum Ferritin, CRP, Vitamin B12, and GI blood loss screen."
    )

    return schemas.GanzoniResponse(
        patient_id=pat["id"],
        patient_name=pat["name"],
        current_hb=current_hb,
        target_hb=body.target_hb,
        weight_kg=body.weight_kg,
        iron_deficit_mg=deficit,
        recommended_dosing=dosing,
        referral_note=referral_note,
    )


# ── computer vision nail screening ────────────────────────────────────────────

@app.post("/screen/nail", response_model=schemas.NailScreeningResponse)
async def screen_nail(image: UploadFile = File(...)) -> schemas.NailScreeningResponse:
    """
    Multimodal AI Point-of-Care Screening:
    Infers anemia probability, continuous estimated Hb (g/dL), and clinical recommendation
    from an uploaded smartphone photograph of fingernails using the VotingClassifier ensemble.
    """
    try:
        from model.nail_detector import predict_nail_image
    except ImportError as exc:
        raise HTTPException(status_code=503, detail=f"Nail detection module unavailable: {exc}")

    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image uploaded.")

    try:
        res = predict_nail_image(contents)
        return schemas.NailScreeningResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {exc}")


# ── frontend static mount (for instant UI preview at http://localhost:8000/) ──
STATIC_CANDIDATES = [
    ROOT / "dist",
    ROOT.parent / "dist",
    ROOT.parent / "digital-twin-main" / "dist",
    ROOT / "frontend" / "dist",
]

for static_dir in STATIC_CANDIDATES:
    if static_dir.exists() and (static_dir / "index.html").exists():
        app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="frontend")
        print(f"[main] Serving frontend bundle from {static_dir}")
        break


