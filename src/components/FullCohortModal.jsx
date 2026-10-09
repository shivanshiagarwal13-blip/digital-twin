import React from 'react';
import { X, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { PATIENTS } from '../data/patients';

export function FullCohortModal({ isOpen, onClose, onSelectPatient }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Full Enrolled Patient Cohort</h3>
              <p className="text-xs text-[#a9978a]">14 Enrolled Mothers & Adolescent Girls · PHC Ward 4</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#a9978a] hover:text-[#faf6f0] p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table content */}
        <div className="p-6 overflow-y-auto">
          <div className="border border-[#e2d4c3] rounded-2xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0e4d7] text-[#553e32] border-b border-[#dfcfbd]">
                <tr>
                  <th className="p-3 font-semibold">Patient Name & ID</th>
                  <th className="p-3 font-semibold">Age</th>
                  <th className="p-3 font-semibold">Day 14 Hb</th>
                  <th className="p-3 font-semibold">Adherence</th>
                  <th className="p-3 font-semibold">Non-Response Risk</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee2d5]">
                {PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fcf7f1] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#eedccf] text-[#55382b] font-bold text-xs flex items-center justify-center">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-[#201511]">{p.name}</div>
                          <div className="text-[11px] text-[#7f695d]">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#443329]">{p.age} y</td>
                    <td className="p-3 font-semibold text-[#201511]">{p.vitals.hemoglobin.value} g/dL</td>
                    <td className="p-3 text-[#443329]">{p.vitals.adherence.value}</td>
                    <td className="p-3 font-bold text-[#201511]">{p.nonResponseRisk}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.riskTagClass}`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          onSelectPatient(p.id);
                          onClose();
                        }}
                        className="px-3 py-1 bg-[#231714] text-[#faf6f0] hover:bg-[#3f2b23] rounded-full text-[11px] font-medium transition-colors"
                      >
                        Inspect Twin →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-[#f2e7db] border-t border-[#dfd0bf] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620]"
          >
            Close Cohort Monitor
          </button>
        </div>
      </div>
    </div>
  );
}
