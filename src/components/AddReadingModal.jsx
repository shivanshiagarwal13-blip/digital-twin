import React, { useState } from 'react';
import { PlusCircle, X, Check, Activity, Heart, Droplets, Calendar } from 'lucide-react';

export function AddReadingModal({ isOpen, onClose, onAddReading, patient }) {
  const [hb, setHb] = useState(patient?.vitals?.hemoglobin?.value || '10.0');
  const [hr, setHr] = useState(patient?.vitals?.heartRate?.value || '78');
  const [steps, setSteps] = useState('6500');
  const [notes, setNotes] = useState('Day-14 routine PHC follow-up');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddReading({
      hb: parseFloat(hb),
      hr: parseInt(hr),
      steps: parseInt(steps),
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6f0] text-[#241814] w-full max-w-lg rounded-3xl shadow-2xl border border-[#ded1c2] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#231714] text-[#faf6f0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3d2922] flex items-center justify-center text-[#e8dacb]">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Add Clinical & Wearable Reading</h3>
              <p className="text-xs text-[#a9978a]">{patient?.name} · {patient?.id}</p>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1.5 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#884737]" />
              Hemoglobin (g/dL)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="18.0"
                value={hb}
                onChange={(e) => setHb(e.target.value)}
                className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613] focus:outline-none focus:ring-2 focus:ring-[#7b4d3a]"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-[#7d685c] font-medium">g/dL</span>
            </div>
            <p className="text-[11px] text-[#7d685c] mt-1">Okam threshold: ≥ 1.0 g/dL increase at Day 14 indicates responder</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#9a4b3f]" />
                Resting Heart Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="45"
                  max="160"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613] focus:outline-none focus:ring-2 focus:ring-[#7b4d3a]"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#7d685c] font-medium">bpm</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#a16b43]" />
                Daily Steps
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="35000"
                  step="50"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#221613] focus:outline-none focus:ring-2 focus:ring-[#7b4d3a]"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[#7d685c] font-medium">steps</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#634c3f] mb-1.5">
              Clinical Assessment Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#f0e7dc] border border-[#d2c0ae] rounded-xl px-3.5 py-2.5 text-sm text-[#221613] focus:outline-none focus:ring-2 focus:ring-[#7b4d3a]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium border border-[#cdbcab] text-[#553f34] hover:bg-[#ede4d7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#211714] text-[#f5eee5] hover:bg-[#382620] transition-colors"
            >
              Save & Recalculate Twin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
