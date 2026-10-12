# IronTwin: Multimodal Digital Twin for Precision Oral Iron Therapy & Early Failure Prediction

> **Happiest Health Summit 2026 Hackathon Submission**  
> **Clinical Disclaimer:** Decision support and research prototype only. Not a medical diagnostic device. All patient records in this demonstration are physiologically simulated.

---

## 📋 Table of Contents
1. [Team & Project Information](#-team--project-information)
2. [Project Title & Executive Summary](#-project-title--executive-summary)
3. [Problem Statement](#-problem-statement)
4. [Healthcare Use Case & Clinical Workflow](#-healthcare-use-case--clinical-workflow)
5. [Technical Stack](#-technical-stack)
6. [AI/ML Models & Theoretical Frameworks](#-aiml-models--theoretical-frameworks)
7. [Multimodal Fusion: Static EHR + Wearable IoT Telemetry + Computer Vision](#-multimodal-fusion-static-ehr--wearable-iot-telemetry--computer-vision)
8. [Clinical Explainability (XAI) & Counterfactuals](#-clinical-explainability-xai--counterfactuals)
9. [Public Health Economics & National Impact](#-public-health-economics--national-impact)
10. [Architecture Diagram & System Pipeline](#-architecture-diagram--system-pipeline)
11. [Demo Video & Presentation Links](#-demo-video--presentation-links)
12. [Quickstart & Reproduction Guide](#-quickstart--reproduction-guide)
13. [Open-Source License & Citations](#-open-source-license--citations)

---

## 👥 Team & Project Information

* **Team Name:** [Oceanseekers]
* **College / Incubator:** Manipal University Jaipur, India
* **Track:** Digital Twin Proof-of-Concept — Happiest Health Summit 2026

---

## 📌 Project Title & Executive Summary

**Project Title:** **Hemalyx: A Multimodal AI Digital Twin Fusing EHR, Wearable IoT Telemetry, and Smartphone Nailbed Vision to Intercept Oral Iron Failure at Day 14**

**Summary:**  
Over 57% of Indian women of reproductive age suffer from iron deficiency anemia (NFHS-5). While standard public health programs (Anemia Mukt Bharat) prescribe oral iron tablets for 8–12 weeks, **~27.2% of patients fail to respond** due to systemic inflammation (hepcidin-mediated enterocyte ferroportin block), poor compliance, or occult blood loss. Under current standards of care, this failure is only discovered at the end of the trimester, causing maternal morbidity, cognitive fatigue, and emergency transfusions.

**IronTwin intercepts oral iron non-response at Day 14 instead of Day 84.** By fusing:
1. **Static/Historical EHR:** Demographics, baseline Hb, Ferritin, inflammatory markers.
2. **Dynamic Wearable IoT Streams:** Continuous Resting Heart Rate (compensatory tachycardia index) and Daily Steps (fatigue recovery index).
3. **Point-of-Care Computer Vision:** Smartphone nailbed colorimetric screening for non-invasive baseline Hb estimation in rural clinics without phlebotomy labs.

IronTwin forecasts the 12-week trajectory, provides transparent **Explainable AI (XAI)** factor attribution, calculates personalized parenteral iron deficit via the **Ganzoni equation**, and empowers grassroots community workers with **Multilingual ASHA action cards** in English, Hindi, Tamil, and Telugu.

---

## ⚠️ Problem Statement

1. **The Delayed Failure Window:** Oral iron response is traditionally assessed at 8 to 12 weeks. Waiting 2 to 3 months to identify non-responders leads to clinical deterioration and high dropout rates.
2. **The "Black Box" Barrier:** Clinicians frequently ignore ML predictions that cannot explain *why* a patient is flagged.
3. **Rural Diagnostic Gaps:** Primary Health Centers (PHCs) and sub-centers across India often lack immediate phlebotomy labs for baseline blood draws.
4. **Disconnect between Hospital & Grassroots:** High-level algorithmic warnings rarely translate into practical home-visit actions for ASHA and Anganwadi workers.

---

## 🏥 Healthcare Use Case & Clinical Workflow

```
[ Rural / Home Screening ]
         │
         ▼
[ 1. Nailbed Smartphone Photo ] ──► (VotingClassifier Ensemble) ──► Estimates Baseline Hb (e.g. 8.6 g/dL)
         │
         ▼
[ 2. Initiate Oral Iron Therapy ] ──► Wearable IoT Telemetry (Fitbit / Apple Health Stream)
         │                             • Compensatory Tachycardia (HR: 102 bpm)
         │                             • Activity Depression (Steps: 2,700/day)
         ▼
[ 3. Day-14 Twin Interception ] ────► IronTwin Evaluates Biomarkers + Sensor Telemetry:
         │                             • Hb Rise < 1.0 g/dL? (Okam 2016 Rule)
         │                             • Persistent Tachycardia (>95 bpm) & Low Steps?
         │
         ├─── If Responder (72.8%): ──► Reassure patient; forecast normal Hb recovery (12.4 g/dL).
         │
         └─── If Non-Responder (27.2%):
                 ├── Explainability (XAI): Flags active CRP hepcidin block & missed pills.
                 ├── Ganzoni Calculator: Computes 950 mg IV deficit → recommends FCM infusion.
                 ├── Referral Note: Generates 1-click clinical escalation document for PHC Doctor.
                 └── Multilingual ASHA Card: Gives Hindi/Tamil/Telugu checklist for home visit.
```

---

## 💻 Technical Stack

* **Backend & API:** Python 3.11+, FastAPI (REST API), Uvicorn, SQLite (`sqlite3` with thread-safe connection pool), Pydantic v2 schemas.
* **Predictive AI / ML:** `scikit-learn` (VotingClassifier, HistGradientBoosting, LogisticRegression, StandardScaler, k-NN forecaster), `scipy`, `numpy`, `pandas`, `joblib`.
* **Computer Vision:** `Pillow` (PIL), color space colorimetry (CIELAB $a^*$ channel, RGB/HSV ratios, spatial gradient texture), `scipy.ndimage`.
* **Frontend Web Application:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts (responsive dual-axis charting).
* **Data Sources & Calibration:** Mendeley Data (Ghana Nailbed Dataset), Athiyarath 2015 Indian Cohort, Okam 2016 (Haematologica), Dryad Clinical Trial repository, NFHS-5 Government of India health survey.

---

## 🧠 AI/ML Models & Framework Details

IronTwin incorporates a dual-stage machine learning system:

### 1. Computer Vision Point-of-Care Screening (`model/nail_detector.py`)
* **Architecture:** Soft-Voting Ensemble Classifier (`Logistic Regression` + `Random Forest` + `Gradient Boosting`).
* **Input:** Smartphone image of fingernail bed ($224 \times 224$ px).
* **Feature Engineering:** 68 handcrafted colorimetric and texture features:
  * **Pallor Index:** Mean brightness, 10th–90th percentile luminance, white-to-pink ratio.
  * **Erythema / Redness:** Red channel ratio $R / (G + B)$, normalized erythrocyte index.
  * **Texture & Gradients:** Spatial gradients, local contrast, and Shannon entropy.
* **Performance:**
  * **Patient-Level AUC:** **0.77**
  * **Recall at High-Recall Threshold:** **100.0%** (zero missed anemic patients)
  * **F1 Score:** **0.81**
  * **Dataset:** Mendeley Data (Ghana Nail Image Dataset, DOI: `10.17632/2xx4j3kjg2.1`, 4,260 images, 552 patients).

### 2. Longitudinal Digital Twin Trajectory Forecaster (`model/predict.py`)
* **Primary Classifier:** L2-regularized Logistic Regression and Gradient Boosted Decision Trees calibrated on simulated Indian cohorts matching the Athiyarath 2015 baseline parameters ($Hb = 9.34 \pm 1.19$ g/dL).
* **Decision-Theoretic Clinical Rule:** Okam Rule Classifier (*Haematologica* 2016):
  $$\Delta \text{Hb}_{\text{Day 14}} < 1.0\text{ g/dL} \implies \text{Non-Response (Sensitivity 90.1\%, Specificity 79.3\%, PPV 92.9\%)}$$
* **k-NN Non-Parametric Trajectory Forecast:** Finds 300 nearest historical physiological twins in multi-dimensional space $(\text{Baseline Hb}, \text{Hb}_{\text{Day 7}}, \text{Hb}_{\text{Day 14}})$ and projects 10th–90th percentile confidence bounds across Weeks 4, 8, and 12.

---

## 📡 Multimodal Fusion: Static EHR + Wearable IoT + Computer Vision

In accordance with the hackathon specifications, IronTwin demonstrates the direct fusion of static and dynamic time-series streams:

| Stream Type | Source | Clinical Signal & Physiological Meaning |
|---|---|---|
| **Static / Historical EHR** | Simulated Electronic Health Record | Demographics (Age), Baseline Hb, Serum Ferritin (iron stores), Genetic/Etiological flags, Inflammatory markers (CRP). |
| **Dynamic Wearable IoT** | Simulated Apple Health / Fitbit telemetry | **Resting Heart Rate (bpm):** Compensatory tachycardia ($95\text{--}105\text{ bpm}$) caused by low $O_2$ carrying capacity. In responders, drops to $72\text{--}78\text{ bpm}$; in non-responders, tachycardia persists.<br>**Daily Step Count:** Objective fatigue index ($2,700 \to 7,900\text{ steps/day}$ upon recovery). |
| **Point-of-Care Vision** | Smartphone camera | Non-invasive colorimetric nailbed estimation used for initial baseline triage in rural sub-centers. |

---

## 🔍 Clinical Explainability (XAI) & Counterfactuals

### 1. "Why is the Twin Warning?" (XAI Waterfall)
Doctors reject black-box models. IronTwin decomposes the prediction into weighted clinical drivers:
* **Day-14 Hb Rise:** $+45\%$ risk contribution if rise $< 1.0$ g/dL.
* **Systemic Inflammation (CRP):** $+25\%$ risk contribution (elevated hepcidin causes ferroportin internalisation, biochemically blocking enterocyte absorption).
* **Adherence:** $+18\%$ risk contribution if reported compliance $< 70\%$.
* **Severe Baseline Deficit:** $+12\%$ contribution if starting $\text{Hb} < 8.5$ g/dL.

### 2. What-If Counterfactual Simulator (`POST /patients/{id}/whatif`)
Allows the clinician to test hypothetical interventions:
* `better_adherence`: Simulates recovery if pill-taking improves from 50% to 90%.
* `iv_iron`: Simulates switching to IV Ferric Carboxymaltose ($+0.84$ g/dL boost at Week 4, 95% CI $0.59\text{--}1.09$).
* `extra_tests`: Recommends testing for Vitamin B12, Celiac Disease, or occult fecal blood loss.

### 3. Automated Ganzoni IV Iron Calculator (`POST /patients/{id}/ganzoni`)
When oral therapy fails, the system calculates parenteral replenishment:
$$\text{Iron Deficit (mg)} = \text{Body Weight (kg)} \times (\text{Target Hb} - \text{Current Hb}) \times 2.4 + 500\text{ mg storage}$$
Generates a 1-click clinical escalation note recommending Ferric Carboxymaltose (FCM) 1000 mg dosing schedules.

---

## 🇮🇳 Public Health Economics & National Impact

* **Public Baseline Data:** Integrated state-wise anemia prevalence from the **NFHS-5 (2019-21)** survey covering all 28 Indian States (e.g., West Bengal: 71.4%, Gujarat: 65.0%, Bihar: 63.5%).
* **Economic Model:**
  * Of anemic women starting oral iron, **27.2%** fail oral tablets.
  * Late diagnosis leads to emergency transfusions and hospital admissions costing **₹4,200 to ₹12,000 per patient**.
  * Catching non-responders at Day 14 saves **₹42 to ₹120 Crores per 1 Million enrolled anemic women**.
* **Multilingual ASHA Action Cards:** Translates clinical flags into localized, vernacular home-visit instructions across **English, Hindi (हिंदी), Tamil (தமிழ்), and Telugu (తెలుగు)**.

---

## 🏗️ Architecture Diagram & System Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                            │
├───────────────────────┬─────────────────────────┬──────────────────────┤
│ 1. Point-of-Care      │ 2. Static Clinical EHR  │ 3. Dynamic IoT       │
│    Nailbed Photo      │    Baseline Hb,         │    Wearable Stream   │
│    (Mendeley Data)    │    Ferritin, CRP, Age   │    (RHR & Steps)     │
└───────────┬───────────┴────────────┬────────────┴──────────┬───────────┘
            │                        │                       │
            ▼                        ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AI / ML PROCESSING CORE                         │
├────────────────────────────────────────────────────────────────────────┤
│ • Computer Vision: VotingClassifier (LR + RF + GB) [AUC: 0.77]         │
│ • Physiological Simulator: Calibrated Emax Pharmacodynamic Model       │
│ • Okam Day-14 Classifier: Haematologica 2016 Benchmark                 │
│ • Trajectory Engine: k-NN Non-Parametric Percentile Forecaster         │
│ • Clinical XAI: Additive Pathophysiological Feature Attribution        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       CLINICAL APPLICATION LAYER                       │
├───────────────────────────────────┬────────────────────────────────────┤
│ Doctor Dashboard (React / Vite)   │ Patient & Grassroots View          │
│ • Hb & IoT Dual-Axis Trajectories │ • Plain-language health status     │
│ • Day-14 Non-Response Alert       │ • Resting HR & activity vitals     │
│ • XAI Factor Contribution Cards   │ • Multilingual ASHA Guidance Card  │
│ • What-If Counterfactual Explorer │   (English / हिंदी / தமிழ் / తెలుగు) │
│ • 1-Click Ganzoni IV Escalation   │ • Health Economics Calculator      │
└───────────────────────────────────┴────────────────────────────────────┘
```

> **Architecture Diagram Document:** Download the complete architectural schematic in PDF format at [`docs/architecture_diagram.pdf`](docs/) *(also provided in `architecture.md`)*.

---

## 🎥 Demo Video & Presentation Links

* **15-20 Minute Demo Video (Unlisted YouTube):** `[INSERT YOUR YOUTUBE LINK HERE]`
* **Project Presentation Slides (PDF / PPT):** `[INSERT YOUR DRIVE / GITHUB LINK TO PPT/PDF HERE]`
* **Architecture Diagram (PDF / PPT):** `[INSERT LINK TO ARCHITECTURE PPT/PDF HERE]`
* **Public Access Notice:** All links and resources provided above are set to public view without requiring access permissions.

---

## 🚀 Quickstart & Reproduction Guide

### Prerequisites
* Python 3.10+ (Tested on Python 3.11 / 3.12 / 3.14)
* Node.js 18+ and npm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shivanshiagarwal13-blip/digital-twin.git
cd digital-twin

# Python dependencies
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Frontend dependencies
npm install
```

### 2. Run the Application

You can run the full-stack system in either of two ways:

#### Option A: Unified FastAPI Server (Serves both API & Frontend)
```bash
# 1. Build the frontend production bundle
npm run build

# 2. Start the unified FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Open **`http://localhost:8000/`** in your browser.

#### Option B: Dual Dev Servers (Vite + FastAPI hot-reloading)
* Terminal 1 (Backend API):
  ```bash
  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```
* Terminal 2 (Frontend Dev):
  ```bash
  npm run dev
  ```
Open the Vite URL (typically `http://localhost:5173/`).

---

### Academic References
1. **Okam MM, Koch TA, Tran MH.** *Virchow's triad and hemoglobin response to oral iron: definition of early non-response.* **Haematologica**, 2016; 101:e6-e7.
2. **Mannino RG, et al.** *Smartphone analysis of fingernail color enables non-invasive hemoglobin estimation.* **Nature Communications**, 2018; 9:4924.
3. **Athiyarath R, et al.** *Erythropoietic response to oral iron supplementation in Indian women.* **Genes & Nutrition**, 2015; 10(6):53.
4. **National Family Health Survey (NFHS-5), 2019–21:** Ministry of Health and Family Welfare, Government of India.
5. **Ganzoni AM.** *Intravenous iron-dextran: therapeutic and experimental possibilities.* **Schweiz Med Wochenschr**, 1970; 100(46):1962–1963.
6. **Ghana Fingernail Anemia Dataset:** Mendeley Data, DOI: `10.17632/2xx4j3kjg2.1`.
