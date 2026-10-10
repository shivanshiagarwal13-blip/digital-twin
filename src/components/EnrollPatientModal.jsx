import React, { useState } from 'react';
import { UserPlus, X, Heart, Droplets, Activity, FileText } from 'lucide-react';

export function EnrollPatientModal({ isOpen, onClose, onEnrollPatient }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('26');
  const [baselineHb, setBaselineHb] = useState('8.4');
  const [ferritin, setFerritin] = useState('9.0');
  const [crpHigh, setCrpHigh] = useState(false);
  const [adherencePct, setAdherencePct] = useState('88');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PT';

    const newId = `AMB-${Math.floor(2000 + Math.random() * 8000)}`;
    const hbNum = parseFloat(baselineHb);
    const crpVal = crpHigh;

    // Fast simulation heuristic
    const isLikelyResponder = !crpVal && parseFloat(adherencePct) >= 80;

    const patientObj = {
      id: newId,
      name: name.trim(),
      avatar: initials,
      age: parseInt(age),
      enrolledDays: 14,
      riskLevel: isLikelyResponder ? "Low risk" : "High",
      riskTagClass: isLikelyResponder ? "bg-[#e5dcd1] text-[#3e2e25] border border-[#d2c3b2]" : "bg-[#3e2520] text-[#f7ece2]",
      nonResponseRisk: isLikelyResponder ? "8.4%" : "76.2%",
      riskDelta: isLikelyResponder ? "↓ 12% this week" : "↑ 28% this week",
      signalStatus: isLikelyResponder ? "on_track" : "alert",
      signalTitle: isLikelyResponder ? "Therapy response is on track" : "Early non-response alert triggered",
      signalMessage: isLikelyResponder 
        ? `Hb has risen by 1.2 g/dL, above the 1.0 g/dL threshold.` 
        : `Hb has only risen by 0.3 g/dL. Inflammation or absorption block suspected.`,
      vitals: {
        hemoglobin: {
          value: isLikelyResponder ? (hbNum + 1.2).toFixed(1) : (hbNum + 0.3).toFixed(1),
          unit: "g/dL",
          tag: isLikelyResponder ? "Improving" : "Stalled",
          delta: isLikelyResponder ? "+1.2 g/dL since baseline" : "+0.3 g/dL since baseline",
          baseline: hbNum.toFixed(1)
        },
        heartRate: {
          value: isLikelyResponder ? "79" : "97",
          unit: "bpm",
          tag: isLikelyResponder ? "Healthy Range" : "Tachycardia",
          baseline: "96"
        },
        activity: {
          value: isLikelyResponder ? "6,100" : "3,100",
          unit: "steps",
          tag: isLikelyResponder ? "Active" : "Fatigued",
          baseline: "3,000"
        },
        adherence: {
          value: `${adherencePct}%`,
          tag: "14-day",
          sub: `${Math.round(14 * (parseInt(adherencePct) / 100))} of 14 doses recorded`,
          progress: parseInt(adherencePct)
        }
      },
      trajectory: [
        { day: "Day 0", observed: hbNum, forecast: hbNum, bandLow: hbNum, bandHigh: hbNum },
        { day: "Day 7", observed: hbNum + (isLikelyResponder ? 0.7 : 0.2), forecast: hbNum + (isLikelyResponder ? 0.7 : 0.2), bandLow: hbNum, bandHigh: hbNum + 1.0 },
        { day: "Day 14", observed: hbNum + (isLikelyResponder ? 1.2 : 0.3), forecast: hbNum + (isLikelyResponder ? 1.2 : 0.3), bandLow: hbNum + 0.1, bandHigh: hbNum + 1.4 },
        { day: "Week 4", observed: null, forecast: hbNum + (isLikelyResponder ? 2.0 : 0.4), bandLow: hbNum + 0.2, bandHigh: hbNum + 2.4 },
        { day: "Week 8", observed: null, forecast: hbNum + (isLikelyResponder ? 2.8 : 0.5), bandLow: hbNum + 0.3, bandHigh: hbNum + 3.2 },
        { day: "Week 12", observed: null, forecast: hbNum + (isLikelyResponder ? 3.4 : 0.6), bandLow: hbNum + 0.4, bandHigh: hbNum + 3.8 }
      ],
      wearableHistory: [
        { day: "D0", hr: 96, steps: 3000 },
        { day: "D7", hr: isLikelyResponder ? 86 : 96, steps: isLikelyResponder ? 4800 : 3100 },
        { day: "D14", hr: isLikelyResponder ? 79 : 97, steps: isLikelyResponder ? 6100 : 3100 },
      ],
      xaiFactors: [
        {
          name: isLikelyResponder ? "Favorable Day-14 Hb rise (+1.2)" : "Blunted Day-14 Hb rise (+0.3)",
          value: isLikelyResponder ? "-38%" : "+46%",
          impact: isLikelyResponder ? "positive" : "negative",
          width: "85%",
          rationale: isLikelyResponder 
            ? "Hb rise cleared the 1.0 g/dL threshold (Okam 2016)."
            : "Under the 1.0 g/dL threshold. Strong predictor of oral iron failure."
        },
        {
          name: crpVal ? "Active Systemic Inflammation (High CRP)" : "Normal inflammatory markers (Low CRP)",
          value: crpVal ? "+26%" : "-12%",
          impact: crpVal ? "negative" : "positive",
          width: "60%",
          rationale: crpVal 
            ? "Hepcidin upregulation degrades enterocyte ferroportin, preventing oral iron transport."
            : "Uninhibited ferroportin enables normal duodenal iron absorption."
        },
        {
          name: `Tablet compliance (${adherencePct}%)`,
          value: parseInt(adherencePct) < 70 ? "+22%" : "-10%",
          impact: parseInt(adherencePct) < 70 ? "negative" : "positive",
          width: "45%",
          rationale: `Reported adherence of ${adherencePct}%.`
        }
      ],
      ganzoni: {
        defaultWeight: 52,
        targetHb: 15.0,
        currentHb: hbNum + (isLikelyResponder ? 1.2 : 0.3),
        ironStores: 500
      },
      whatIf: {
        currentTherapyWeek8: `${(hbNum + (isLikelyResponder ? 2.8 : 0.5)).toFixed(1)} g/dL`,
        currentTherapyWeek12: `${(hbNum + (isLikelyResponder ? 3.4 : 0.6)).toFixed(1)} g/dL`,
        ivIronWeek8: `${(hbNum + 3.2).toFixed(1)} g/dL`,
        ivIronWeek12: `${(hbNum + 4.1).toFixed(1)} g/dL`,
      }
    };

    onEnrollPatient(patientObj);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-lg rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Enroll New Digital Twin Patient</h3>
              <p className="text-xs text-[#a9978a]">Initialize baseline biomarkers & trajectory</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#a9978a] hover:text-[#faf6f0] p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1">
              Patient Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Kavita Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613] focus:outline-none focus:ring-2 focus:ring-[#7b4d3a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="12"
                max="65"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1">
                Starting Hb (g/dL)
              </label>
              <input
                type="number"
                step="0.1"
                min="4.0"
                max="14.0"
                value={baselineHb}
                onChange={(e) => setBaselineHb(e.target.value)}
                className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1">
                Serum Ferritin (ng/mL)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="300"
                value={ferritin}
                onChange={(e) => setFerritin(e.target.value)}
                className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1">
                Pill Adherence (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={adherencePct}
                onChange={(e) => setAdherencePct(e.target.value)}
                className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613]"
                required
              />
            </div>
          </div>

          {/* Inflammation toggle */}
          <div className="p-3 bg-[#ede2d4] rounded-xl border border-[#dfd0bf] flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-[#38231a] block">Active Inflammation / High CRP?</span>
              <span className="text-[11px] text-[#786457]">Upregulates hepcidin, blocking gut iron absorption</span>
            </div>
            <input
              type="checkbox"
              checked={crpHigh}
              onChange={(e) => setCrpHigh(e.target.checked)}
              className="w-5 h-5 accent-[#7b4d3a] cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium border border-[#cdbcab] text-[#553f34] hover:bg-[#ede4d7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620] transition-colors"
            >
              Initialize Digital Twin →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
