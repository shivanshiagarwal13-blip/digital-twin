import React from 'react';
import { X, Download, FileCheck, CheckCircle2 } from 'lucide-react';

export function ProgramBriefModal({ isOpen, onClose, cohortSize, totalSavingsCr, nonResponders }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-xl rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">National Policy Brief Generated</h3>
              <p className="text-xs text-[#a9978a]">Anemia Mukt Bharat · Public Health Economics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#a9978a] hover:text-[#faf6f0] p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#ebdcd0] rounded-2xl border border-[#d9c5b2]">
            <h4 className="font-bold text-sm text-[#382319]">Executive Summary: Day-14 Hemalyx Deployment</h4>
            <p className="text-xs text-[#523d32] mt-1 leading-relaxed">
              Based on NFHS-5 national prevalence (57%) and the clinical failure rate of oral iron (27.2%), early algorithmic interception at Day 14 averts systemic hospital admissions and maternal morbidity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#e1d3c3]">
              <span className="text-[#7d685c] block text-[11px]">Enrolled Women Cohort:</span>
              <span className="font-bold text-base text-[#241713]">{cohortSize.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#e1d3c3]">
              <span className="text-[#7d685c] block text-[11px]">Early Identified Failures:</span>
              <span className="font-bold text-base text-[#241713]">{nonResponders.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#e1d3c3]">
              <span className="text-[#7d685c] block text-[11px]">Timeline Advantage:</span>
              <span className="font-bold text-base text-[#241713]">70 Days Earlier (D14 vs D84)</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#e1d3c3]">
              <span className="text-[#7d685c] block text-[11px]">State Budget Savings:</span>
              <span className="font-bold text-base text-[#803822]">₹{totalSavingsCr} Crores</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium border border-[#cdbcab] text-[#553f34] hover:bg-[#ede4d7]"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Executive Program Brief PDF downloaded successfully.");
                onClose();
              }}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620] flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
