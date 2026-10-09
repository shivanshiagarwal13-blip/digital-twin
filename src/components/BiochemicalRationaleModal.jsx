import React from 'react';
import { X, Dna, ShieldAlert, Sparkles, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

export function BiochemicalRationaleModal({ isOpen, onClose, patient }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <Dna className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Biochemical & Pathophysiological Rationale</h3>
              <p className="text-xs text-[#a9978a]">XAI Attribution Engine · Hepcidin-Ferroportin Axis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#a9978a] hover:text-[#faf6f0] p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 bg-[#ece0d1] rounded-2xl border border-[#dbc9b6]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c3e30] mb-1">
              Case Analysis: {patient?.name} ({patient?.riskLevel})
            </h4>
            <p className="text-xs text-[#4c382e] leading-relaxed">
              Why Hemalyx calculates a <strong>{patient?.nonResponseRisk}</strong> probability of oral iron failure at Week 8 based on Day-14 multimodal telemetry.
            </p>
          </div>

          <div className="space-y-4">
            {/* Factor 1 */}
            <div className="p-4 bg-[#f2e9de] rounded-2xl border border-[#dfd1c1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#251814] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8b4f3b]" />
                  Day-14 Hemoglobin Rise Rate
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#dfcebe] text-[#3e271f]">
                  Okam 2016 Rule
                </span>
              </div>
              <p className="text-xs text-[#523d32] leading-relaxed">
                Oral iron induces an early reticulocyte response peaking around Day 7–10, translating to a measurable peripheral blood hemoglobin elevation of ≥ 1.0 g/dL by Day 14. 
                Patients failing to reach +1.0 g/dL have an odds ratio of failure at 12 weeks of 14.8.
              </p>
            </div>

            {/* Factor 2 */}
            <div className="p-4 bg-[#f2e9de] rounded-2xl border border-[#dfd1c1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#251814] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#8b4f3b]" />
                  Hepcidin-Mediated Ferroportin Block
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#dfcebe] text-[#3e271f]">
                  Inflammatory Block
                </span>
              </div>
              <p className="text-xs text-[#523d32] leading-relaxed">
                In systemic inflammation or subclinical infection, IL-6 triggers hepatic transcription of hepcidin. Elevated hepcidin binds to enterocyte basolateral ferroportin, causing its internalization and lysosomal degradation. Consequently, orally ingested iron remains sequestered in sloughing gut enterocytes and cannot enter circulation.
              </p>
            </div>

            {/* Factor 3 */}
            <div className="p-4 bg-[#f2e9de] rounded-2xl border border-[#dfd1c1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#251814] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8b4f3b]" />
                  Wearable Compensatory Tachycardia & Fatigue
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#dfcebe] text-[#3e271f]">
                  IoT Sensor Fusion
                </span>
              </div>
              <p className="text-xs text-[#523d32] leading-relaxed">
                Resting heart rate reflects cardiovascular compensatory stroke volume demands to maintain tissue oxygenation. As functional iron replenishes myoglobin and mitochondrial cytochromes, resting tachycardia decreases towards baseline (70-78 bpm) while daily step counts expand. Failure of HR reduction is an independent predictor of mucosal absorption block.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620] transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
