// api.js - Unified API service connecting Hemalyx frontend to FastAPI backend

const BASE_URL = 'http://localhost:8000';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export const api = {
  // 1. Get all patients
  async getPatients() {
    return await fetchJson(`${BASE_URL}/patients`);
  },

  // 2. Get single patient details with all readings
  async getPatient(id) {
    return await fetchJson(`${BASE_URL}/patients/${id}`);
  },

  // 3. Get twin prediction, trajectory forecast, and XAI explainability
  async getPrediction(id) {
    return await fetchJson(`${BASE_URL}/patients/${id}/prediction`);
  },

  // 4. Record new lab / wearable reading
  async addReading(id, { day, hb, adherence = 0.88, heart_rate = null, steps = null }) {
    return await fetchJson(`${BASE_URL}/patients/${id}/readings`, {
      method: 'POST',
      body: JSON.stringify({
        day: parseInt(day),
        hb: parseFloat(hb),
        adherence: parseFloat(adherence),
        ...(heart_rate !== null ? { heart_rate: parseInt(heart_rate) } : {}),
        ...(steps !== null ? { steps: parseInt(steps) } : {})
      })
    });
  },

  // 5. What-If counterfactual simulation
  async postWhatIf(id, scenario) {
    return await fetchJson(`${BASE_URL}/patients/${id}/whatif`, {
      method: 'POST',
      body: JSON.stringify({ scenario })
    });
  },

  // 6. Ganzoni IV iron calculator and referral note
  async calculateGanzoni(id, weightKg = 55.0, targetHb = 15.0) {
    return await fetchJson(`${BASE_URL}/patients/${id}/ganzoni`, {
      method: 'POST',
      body: JSON.stringify({
        weight_kg: parseFloat(weightKg),
        target_hb: parseFloat(targetHb)
      })
    });
  },

  // 7. National program NFHS-5 states
  async getProgramStates() {
    return await fetchJson(`${BASE_URL}/program/states`);
  },

  // 8. Computer vision nailbed scanning
  async screenNailImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/screen/nail`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Screening failed (${res.status}): ${text}`);
    }
    return res.json();
  }
};
