import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';

export function GanzoniReferralModal({ isOpen, onClose, patient, weight, ironDeficit }) {
  if (!isOpen) return null;

  const vials = Math.ceil(ironDeficit / 500); // 500mg FCM vials
  const regimen = ironDeficit > 1000 
    ? `Split dose: 1000 mg IV FCM infusion in 100 mL 0.9% NaCl over 15 mins, followed by remaining ${ironDeficit - 1000} mg at Day 7.` 
    : `Single dose: ${ironDeficit} mg IV FCM infusion in 100 mL 0.9% NaCl over 15 minutes.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Clinical Referral Note & Ganzoni IV Prescription</h3>
              <p className="text-xs text-[#a9978a]">Ganzoni 1970 Equation · Ferric Carboxymaltose (FCM)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#a9978a] hover:text-[#faf6f0] p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Referral Document */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-[#ddd0c0] shadow-sm text-[#231714] font-sans text-xs space-y-4">
            <div className="border-b border-[#ebdcd0] pb-3 flex justify-between items-start">
              <div>
                <h2 className="font-serif text-lg font-bold tracking-tight text-[#221613]">PRIMARY HEALTH CENTRE REFERRAL MEMORANDUM</h2>
                <p className="text-[#6d594f]">National Health Mission · Anemia Mukt Bharat Protocol</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-[#ecdcd0] text-[#4a3429] font-mono px-2 py-0.5 rounded text-[11px] font-bold">
                  URGENT DAY-14 ESCALATION
                </span>
                <p className="text-[11px] text-[#7d685c] mt-0.5">Date: 14 May 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-1">
              <div>
                <p className="text-[#7c685c]">Patient Name:</p>
                <p className="font-bold text-sm">{patient?.name}</p>
                <p className="text-[#7c685c] mt-1">Beneficiary ID / Age:</p>
                <p className="font-semibold">{patient?.id} · {patient?.age} Y / Female</p>
              </div>
              <div>
                <p className="text-[#7c685c]">Referring Facility:</p>
                <p className="font-semibold">Sub-District Hospital / Rural PHC</p>
                <p className="text-[#7c685c] mt-1">Supervising Officer:</p>
                <p className="font-semibold">Dr. A. Sen, Medical Officer</p>
              </div>
            </div>

            <div className="bg-[#f9f4ee] p-3.5 rounded-xl border border-[#e8dbcc] space-y-1.5">
              <h4 className="font-bold text-[#442c22] uppercase tracking-wider text-[11px]">Clinical Indication for IV FCM</h4>
              <p className="text-[#4e3a30] leading-relaxed">
                Oral iron therapy initiated 14 days ago. Hemalyx digital twin flagged high risk of oral non-response ({patient?.nonResponseRisk}). 
                Day-14 Hb rise insufficient with systemic absorption impairment. Ganzoni calculation completed to avoid 3rd-trimester severe anemia or transfusion.
              </p>
            </div>

            <div className="border border-[#e2d3c2] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2e7db] text-[#553f34]">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Target / Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece0d2]">
                  <tr>
                    <td className="p-2.5 font-medium">Body Weight</td>
                    <td className="p-2.5 font-bold">{weight} kg</td>
                    <td className="p-2.5 text-[#6c584d]">Actual</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Day-14 Hemoglobin</td>
                    <td className="p-2.5 font-bold">{patient?.vitals?.hemoglobin?.value} g/dL</td>
                    <td className="p-2.5 text-[#6c584d]">Target: 15.0 g/dL</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Calculated Iron Deficit</td>
                    <td className="p-2.5 font-bold text-[#863725] text-sm">{ironDeficit} mg</td>
                    <td className="p-2.5 text-[#6c584d]">Includes 500mg depot store</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-[#f6ece1] rounded-xl border border-[#e5d4c2]">
              <h4 className="font-bold text-[#402a20] uppercase text-[11px] mb-1">Recommended Regimen</h4>
              <p className="text-[#3b271f] font-medium leading-relaxed">{regimen}</p>
              <p className="text-[11px] text-[#715c50] mt-1">Requires approximately {vials} vial(s) of 500mg Ferric Carboxymaltose.</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full text-xs font-medium border border-[#cdbcab] text-[#553f34] hover:bg-[#ede4d7] flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Referral Note
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
