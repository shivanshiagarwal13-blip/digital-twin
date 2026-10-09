export const PATIENTS = [
  {
    id: "AMB-2048",
    name: "Priya Sharma",
    avatar: "PS",
    age: 27,
    enrolledDays: 14,
    riskLevel: "Low risk", // Low risk, Medium, High
    riskTagClass: "bg-[#e5dcd1] text-[#3e2e25] border border-[#d2c3b2]",
    nonResponseRisk: "6.3%",
    riskDelta: "↓ 18% this week",
    signalStatus: "on_track",
    signalTitle: "Therapy response is on track",
    signalMessage: "Hb has risen by 1.4 g/dL, above the 1.0 g/dL clinical response threshold.",
    vitals: {
      hemoglobin: { value: "10", unit: "g/dL", tag: "Improving", delta: "+1.4 g/dL since baseline", baseline: "8.6" },
      heartRate: { value: "78", unit: "bpm", tag: "Resting", baseline: "92" },
      activity: { value: "6,420", unit: "steps", tag: "Daily avg.", baseline: "3,100" },
      adherence: { value: "92%", tag: "14-day", sub: "13 of 14 doses recorded", progress: 92 }
    },
    trajectory: [
      { day: "Day 0", observed: 8.6, forecast: 8.6, bandLow: 8.6, bandHigh: 8.6 },
      { day: "Day 3", observed: 8.4, forecast: null },
      { day: "Day 7", observed: 9.1, forecast: 9.1, bandLow: 8.8, bandHigh: 9.4 },
      { day: "Day 14", observed: 10.0, forecast: 10.0, bandLow: 9.7, bandHigh: 10.3 },
      { day: "Week 4", observed: null, forecast: 10.8, bandLow: 10.3, bandHigh: 11.3 },
      { day: "Week 8", observed: null, forecast: 11.8, bandLow: 11.1, bandHigh: 12.4 },
      { day: "Week 12", observed: null, forecast: 12.7, bandLow: 11.9, bandHigh: 13.4 },
    ],
    wearableHistory: [
      { day: "D0", hr: 92, steps: 3200 },
      { day: "D3", hr: 89, steps: 3600 },
      { day: "D6", hr: 85, steps: 4300 },
      { day: "D9", hr: 82, steps: 5100 },
      { day: "D12", hr: 79, steps: 5900 },
      { day: "D14", hr: 78, steps: 6420 },
    ],
    xaiFactors: [
      { name: "Robust Day-14 Hb rise", value: "-40%", impact: "positive", width: "85%", rationale: "Hb increase of +1.4 g/dL exceeds the Okam et al. 2016 threshold (+1.0 g/dL at Day 14), indicating functional gastrointestinal enterocyte iron absorption via DMT-1 transporter." },
      { name: "Low inflammatory marker", value: "-10%", impact: "positive", width: "42%", rationale: "Serum CRP is 1.2 mg/L (< 5 mg/L normal limit). Low inflammation implies uninhibited ferroportin export with physiological circulating hepcidin levels." },
      { name: "Tablet adherence (92%)", value: "-10%", impact: "positive", width: "40%", rationale: "Patient logged 13 of 14 prescribed daily ferrous ascorbate tablets (100mg elemental iron) taken with water or vitamin C." },
      { name: "Baseline anemia severity", value: "-5%", impact: "positive", width: "24%", rationale: "Baseline Hb of 8.6 g/dL represents moderate anemia without severe hemodynamic decompensation." }
    ],
    ganzoni: {
      defaultWeight: 55,
      targetHb: 15.0,
      currentHb: 10.0,
      ironStores: 500
    },
    whatIf: {
      currentTherapyWeek8: "11.8 g/dL",
      currentTherapyWeek12: "12.7 g/dL",
      ivIronWeek8: "12.9 g/dL",
      ivIronWeek12: "13.8 g/dL",
    }
  },
  {
    id: "AMB-1842",
    name: "Meena Rao",
    avatar: "MR",
    age: 31,
    enrolledDays: 14,
    riskLevel: "High",
    riskTagClass: "bg-[#3e2520] text-[#f7ece2]",
    nonResponseRisk: "78.4%",
    riskDelta: "↑ 24% this week",
    signalStatus: "alert",
    signalTitle: "Early non-response alert triggered",
    signalMessage: "Hb has only risen by 0.2 g/dL (target ≥ 1.0 g/dL). Persistent tachycardia (96 bpm) indicates failure of oxygen delivery adaptation.",
    vitals: {
      hemoglobin: { value: "9.1", unit: "g/dL", tag: "Stalled", delta: "+0.2 g/dL since baseline", baseline: "8.9" },
      heartRate: { value: "96", unit: "bpm", tag: "Tachycardia", baseline: "98" },
      activity: { value: "3,150", unit: "steps", tag: "Fatigued", baseline: "2,900" },
      adherence: { value: "88%", tag: "14-day", sub: "12 of 14 doses recorded", progress: 88 }
    },
    trajectory: [
      { day: "Day 0", observed: 8.9, forecast: 8.9, bandLow: 8.9, bandHigh: 8.9 },
      { day: "Day 3", observed: 8.8, forecast: null },
      { day: "Day 7", observed: 9.0, forecast: 9.0, bandLow: 8.7, bandHigh: 9.2 },
      { day: "Day 14", observed: 9.1, forecast: 9.1, bandLow: 8.8, bandHigh: 9.4 },
      { day: "Week 4", observed: null, forecast: 9.2, bandLow: 8.7, bandHigh: 9.6 },
      { day: "Week 8", observed: null, forecast: 9.3, bandLow: 8.6, bandHigh: 9.8 },
      { day: "Week 12", observed: null, forecast: 9.5, bandLow: 8.5, bandHigh: 10.1 },
    ],
    wearableHistory: [
      { day: "D0", hr: 98, steps: 2900 },
      { day: "D3", hr: 97, steps: 3050 },
      { day: "D6", hr: 96, steps: 2980 },
      { day: "D9", hr: 98, steps: 3100 },
      { day: "D12", hr: 95, steps: 3200 },
      { day: "D14", hr: 96, steps: 3150 },
    ],
    xaiFactors: [
      { name: "Blunted Day-14 Hb rise (+0.2)", value: "+45%", impact: "negative", width: "90%", rationale: "Severe response blunting. Failure to clear the Okam Day-14 +1.0 g/dL threshold yields 90.1% sensitivity for Week-8 therapy failure." },
      { name: "High systemic CRP (18.4 mg/L)", value: "+30%", impact: "negative", width: "70%", rationale: "Subclinical or chronic inflammation triggers interleukin-6 driven hepatic hepcidin overproduction, degrading ferroportin and trapping oral iron inside macrophages." },
      { name: "Persistent Resting Tachycardia", value: "+15%", impact: "negative", width: "45%", rationale: "Wearable resting heart rate remains flatlined at 96 bpm without physiological autonomic recovery." },
      { name: "Tablet adherence (88%)", value: "-6%", impact: "positive", width: "20%", rationale: "Patient is compliant with taking tablets, confirming refractory mucosal block rather than behavioral non-compliance." }
    ],
    ganzoni: {
      defaultWeight: 52,
      targetHb: 15.0,
      currentHb: 9.1,
      ironStores: 500
    },
    whatIf: {
      currentTherapyWeek8: "9.3 g/dL",
      currentTherapyWeek12: "9.5 g/dL",
      ivIronWeek8: "12.2 g/dL",
      ivIronWeek12: "13.4 g/dL",
    }
  },
  {
    id: "AMB-2177",
    name: "Lakshmi T.",
    avatar: "LT",
    age: 24,
    enrolledDays: 14,
    riskLevel: "Medium",
    riskTagClass: "bg-[#e2cbb2] text-[#42291e] border border-[#cfb395]",
    nonResponseRisk: "34.2%",
    riskDelta: "↓ 4% this week",
    signalStatus: "moderate",
    signalTitle: "Sub-optimal compliance detected",
    signalMessage: "Day-14 rise is +0.7 g/dL. Dietary interview and mobile log indicate iron tablets are ingested with tannin-rich milk tea.",
    vitals: {
      hemoglobin: { value: "9.8", unit: "g/dL", tag: "Slow gain", delta: "+0.7 g/dL since baseline", baseline: "9.1" },
      heartRate: { value: "84", unit: "bpm", tag: "Borderline", baseline: "91" },
      activity: { value: "5,100", unit: "steps", tag: "Moderate", baseline: "3,800" },
      adherence: { value: "64%", tag: "14-day", sub: "9 of 14 doses recorded", progress: 64 }
    },
    trajectory: [
      { day: "Day 0", observed: 9.1, forecast: 9.1, bandLow: 9.1, bandHigh: 9.1 },
      { day: "Day 3", observed: 9.2, forecast: null },
      { day: "Day 7", observed: 9.5, forecast: 9.5, bandLow: 9.2, bandHigh: 9.7 },
      { day: "Day 14", observed: 9.8, forecast: 9.8, bandLow: 9.4, bandHigh: 10.1 },
      { day: "Week 4", observed: null, forecast: 10.4, bandLow: 9.9, bandHigh: 10.9 },
      { day: "Week 8", observed: null, forecast: 11.1, bandLow: 10.4, bandHigh: 11.7 },
      { day: "Week 12", observed: null, forecast: 11.9, bandLow: 11.1, bandHigh: 12.6 },
    ],
    wearableHistory: [
      { day: "D0", hr: 91, steps: 3800 },
      { day: "D3", hr: 89, steps: 4200 },
      { day: "D6", hr: 87, steps: 4400 },
      { day: "D9", hr: 85, steps: 4700 },
      { day: "D12", hr: 85, steps: 4950 },
      { day: "D14", hr: 84, steps: 5100 },
    ],
    xaiFactors: [
      { name: "Sub-optimal tablet adherence (64%)", value: "+28%", impact: "negative", width: "65%", rationale: "5 missed doses recorded in 14 days due to mild gastrointestinal discomfort." },
      { name: "Moderate Day-14 Hb rise (+0.7)", value: "+12%", impact: "negative", width: "40%", rationale: "Under the target 1.0 g/dL threshold, but partial absorption is evidenced." },
      { name: "Normal CRP levels", value: "-15%", impact: "positive", width: "45%", rationale: "No systemic inflammation; oral iron will succeed if adherence and timing improve." }
    ],
    ganzoni: {
      defaultWeight: 50,
      targetHb: 15.0,
      currentHb: 9.8,
      ironStores: 500
    },
    whatIf: {
      currentTherapyWeek8: "11.1 g/dL",
      currentTherapyWeek12: "11.9 g/dL",
      ivIronWeek8: "12.6 g/dL",
      ivIronWeek12: "13.6 g/dL",
    }
  },
  {
    id: "AMB-3094",
    name: "Anita Kumari",
    avatar: "AK",
    age: 29,
    enrolledDays: 14,
    riskLevel: "High",
    riskTagClass: "bg-[#3e2520] text-[#f7ece2]",
    nonResponseRisk: "82.1%",
    riskDelta: "↑ 31% this week",
    signalStatus: "alert",
    signalTitle: "Severe refractory non-response",
    signalMessage: "Hb stagnant at 8.9 g/dL with severe fatigue and tachycardia (102 bpm). Fast-track IV FCM referral recommended.",
    vitals: {
      hemoglobin: { value: "8.9", unit: "g/dL", tag: "Critical", delta: "+0.1 g/dL since baseline", baseline: "8.8" },
      heartRate: { value: "102", unit: "bpm", tag: "High tachycardia", baseline: "104" },
      activity: { value: "2,400", unit: "steps", tag: "Immobile", baseline: "2,200" },
      adherence: { value: "95%", tag: "14-day", sub: "13 of 14 doses recorded", progress: 95 }
    },
    trajectory: [
      { day: "Day 0", observed: 8.8, forecast: 8.8, bandLow: 8.8, bandHigh: 8.8 },
      { day: "Day 3", observed: 8.7, forecast: null },
      { day: "Day 7", observed: 8.8, forecast: 8.8, bandLow: 8.5, bandHigh: 9.0 },
      { day: "Day 14", observed: 8.9, forecast: 8.9, bandLow: 8.5, bandHigh: 9.2 },
      { day: "Week 4", observed: null, forecast: 9.0, bandLow: 8.4, bandHigh: 9.4 },
      { day: "Week 8", observed: null, forecast: 9.1, bandLow: 8.3, bandHigh: 9.6 },
      { day: "Week 12", observed: null, forecast: 9.2, bandLow: 8.2, bandHigh: 9.8 },
    ],
    wearableHistory: [
      { day: "D0", hr: 104, steps: 2200 },
      { day: "D3", hr: 103, steps: 2300 },
      { day: "D6", hr: 102, steps: 2250 },
      { day: "D9", hr: 101, steps: 2450 },
      { day: "D12", hr: 102, steps: 2350 },
      { day: "D14", hr: 102, steps: 2400 },
    ],
    xaiFactors: [
      { name: "Severe baseline deficit & no rise", value: "+52%", impact: "negative", width: "95%", rationale: "Day-14 rise of +0.1 g/dL indicates complete failure of mucosal absorption." },
      { name: "Chronic inflammation / high ferritin block", value: "+28%", impact: "negative", width: "68%", rationale: "Serum ferritin paradoxically elevated (180 ng/mL) alongside low transferrin saturation (8%), typical of anemia of chronic disease / inflammation." }
    ],
    ganzoni: {
      defaultWeight: 48,
      targetHb: 15.0,
      currentHb: 8.9,
      ironStores: 500
    },
    whatIf: {
      currentTherapyWeek8: "9.1 g/dL",
      currentTherapyWeek12: "9.2 g/dL",
      ivIronWeek8: "12.0 g/dL",
      ivIronWeek12: "13.2 g/dL",
    }
  }
];
