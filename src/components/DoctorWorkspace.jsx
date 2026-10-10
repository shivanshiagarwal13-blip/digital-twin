import React, { useState } from 'react';
import { 
  Camera, Plus, Search, ChevronRight, Activity, Heart, 
  CheckCircle2, Sparkles, Check, FileText, ArrowRight, 
  Globe, Stethoscope, Droplets, UserPlus
} from 'lucide-react';
import { PATIENTS } from '../data/patients';
import { NFHS5_STATES } from '../data/states';

export function DoctorWorkspace({
  activeTab,
  setActiveTab,
  selectedPatientId,
  setSelectedPatientId,
  onExitPortal,
  onOpenNailScan,
  onOpenAddReading,
  onOpenRationale,
  onOpenReferral,
  onOpenFullCohort,
  onOpenProgramBrief,
  onOpenEnroll
}) {
  const [patientSearch, setPatientSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [whatIfMode, setWhatIfMode] = useState('current'); // 'current' or 'iv'
  const [patientWeight, setPatientWeight] = useState(55);
  const [cohortSize, setCohortSize] = useState(100000);

  // Active patient object
  const currentPatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  // Ganzoni calculation: Deficit = [Weight * (15 - Actual Hb) * 2.4] + 500
  const actualHbNum = parseFloat(currentPatient.vitals.hemoglobin.value) || 10.0;
  const calculatedDeficit = Math.round((patientWeight * (15.0 - actualHbNum) * 2.4) + 500);

  // Filtered patients for sidebar
  const filteredPatients = PATIENTS.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Filtered states for Program view
  const filteredStates = NFHS5_STATES.filter(s => 
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Economic calculations for Program view
  const nonRespondersEst = Math.round(cohortSize * 0.272);
  const savingsPerPatient = 7200;
  const totalSavingsCr = ((nonRespondersEst * savingsPerPatient) / 10000000).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f0e5d8] text-[#211510] flex flex-col font-sans select-none">
      {/* 1. Top Navbar: Warm Light Cream Background exactly matching Figma */}
      <nav className="bg-[#fcf9f4] text-[#211510] px-6 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#ebdccb] shadow-2xs">
        {/* Left branding */}
        <div 
          onClick={onExitPortal}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/hemalyx-logo.png" 
            alt="Hemalyx" 
            className="w-8 h-8 object-contain select-none group-hover:scale-105 transition-transform" 
          />
          <div>
            <div className="font-bold text-sm tracking-tight text-[#1f140e] leading-none">Hemalyx</div>
            <div className="text-[10px] text-[#7a6558] tracking-wide mt-0.5">Oral iron response intelligence</div>
          </div>
        </div>

        {/* Center Pill Tab Switcher */}
        <div className="bg-[#eadbc9] p-1 rounded-full flex items-center border border-[#ddcdba] shadow-inner">
          <button
            onClick={() => setActiveTab('patient_care')}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'patient_care'
                ? 'bg-white text-[#1f140e] shadow-sm'
                : 'text-[#6f594b] hover:text-[#211510]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Patient care</span>
          </button>
          <button
            onClick={() => setActiveTab('program_view')}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'program_view'
                ? 'bg-white text-[#1f140e] shadow-sm'
                : 'text-[#6f594b] hover:text-[#211510]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Program view</span>
          </button>
        </div>

        {/* Right Exit & Avatar */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onExitPortal}
            className="text-xs text-[#6f594b] hover:text-[#211510] flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
          >
            <span>Exit portal</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#cbb59f] text-[#241510] font-bold text-xs flex items-center justify-center border border-[#ba9e84]">
            DR
          </div>
        </div>
      </nav>

      {/* 2. Sub-header Breadcrumb */}
      <div className="bg-[#ebdccb] px-6 sm:px-8 py-2.5 flex items-center justify-between text-xs text-[#5a4537] border-b border-[#dfcebc]">
        <div className="font-medium">
          {activeTab === 'patient_care' ? 'Clinical workspace' : 'National health dashboard'}
        </div>
        <div className="text-[11px] text-[#786355]">
          Last sync: today, 09:42
        </div>
      </div>

      {/* 3. Main Body */}
      {activeTab === 'patient_care' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* A. Left Sidebar: DARK ESPRESSO Cohort Monitor matching Figma Image 2 */}
          <aside className="w-full lg:w-72 bg-[#1f1410] text-[#fbf7f2] flex flex-col shrink-0 border-r border-[#32221b]">
            <div className="p-4 border-b border-[#30211a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#8c7565]">
                  COHORT MONITOR
                </span>
                <span className="text-[10px] bg-[#32231c] px-2 py-0.5 rounded-full text-[#cbb6a4] font-bold">
                  14 enrolled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white tracking-tight">Active patients</h3>
                <button
                  onClick={onOpenEnroll}
                  className="px-2.5 py-1 rounded-full bg-[#36241b] hover:bg-[#4a3226] text-[11px] font-semibold text-[#f5eee5] flex items-center gap-1 border border-[#4d3528] cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3 h-3 text-[#d2ab96]" />
                  <span>Enroll</span>
                </button>
              </div>

              {/* Dark Search Input */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 text-[#887263] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full bg-[#2a1d17] border border-[#3f2b22] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#887263] focus:outline-none focus:ring-1 focus:ring-[#aa7c5c]"
                />
              </div>
            </div>

            {/* Patient roster list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#2a1d17]">
              {filteredPatients.map((p) => {
                const isSelected = p.id === currentPatient.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#ebdccb] text-[#211510] shadow-sm'
                        : 'text-[#e5d7ca] hover:bg-[#281b15]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                          isSelected ? 'bg-[#c2aa95] text-[#22150f]' : 'bg-[#30221b] text-[#cbb6a4]'
                        }`}>
                          {p.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-xs ${isSelected ? 'text-[#211510]' : 'text-white'}`}>
                              {p.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                              isSelected
                                ? 'bg-[#d9c8b6] text-[#2d1e18]'
                                : p.riskLevel === 'High'
                                ? 'bg-[#3d241d] text-[#e89d91]'
                                : 'bg-[#30221b] text-[#bca594]'
                            }`}>
                              {p.riskLevel === 'Low risk' ? 'Low' : p.riskLevel}
                            </span>
                          </div>
                          <div className={`text-[10px] ${isSelected ? 'text-[#705d51]' : 'text-[#8b7565]'}`}>
                            {p.id} · Day {p.enrolledDays}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-xs ${isSelected ? 'text-[#211510]' : 'text-[#e2d3c5]'}`}>
                          {p.vitals.hemoglobin.value} Hb
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View full cohort link */}
            <div className="p-3 bg-[#19100d] border-t border-[#2d1e17] text-center">
              <button
                onClick={onOpenFullCohort}
                className="text-xs font-semibold text-[#cbb6a3] hover:text-white flex items-center justify-center gap-1 w-full py-1 cursor-pointer transition-colors"
              >
                <span>View full cohort</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>

          {/* B. Center & Right Main Content: Warm Sand Almond Palette */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
            {/* Patient Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#c2aa95] text-[#22150f] font-bold text-sm flex items-center justify-center shadow-xs">
                  {currentPatient.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-[#1f140e]">
                      {currentPatient.name}
                    </h2>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[#cfba9f] text-[#2d1d16] border border-[#beaa90]">
                      {currentPatient.riskLevel}
                    </span>
                  </div>
                  <div className="text-xs text-[#705d51] mt-0.5">
                    {currentPatient.age} years · {currentPatient.id} · Enrolled {currentPatient.enrolledDays} days ago
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenNailScan}
                  className="px-4 py-2 rounded-full border border-[#ded0bf] bg-white hover:bg-[#faf4ec] text-xs font-semibold text-[#2b1b14] flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#5e3d2f]" />
                  <span>Nail scan</span>
                </button>
                <button
                  onClick={onOpenAddReading}
                  className="px-4 py-2 rounded-full bg-[#211510] hover:bg-[#38241b] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add reading</span>
                </button>
              </div>
            </div>

            {/* Day 14 Clinical Signal Alert Card */}
            <div className="bg-[#ded0be] rounded-3xl p-5 border border-[#cfc0ae] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#211510] shrink-0 mt-0.5 shadow-xs">
                  <Check className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#695244] uppercase">
                    DAY 14 CLINICAL SIGNAL
                  </div>
                  <h3 className="font-bold text-base text-[#20140e] mt-0.5">
                    {currentPatient.signalTitle}
                  </h3>
                  <p className="text-xs text-[#523d31] mt-1 max-w-xl leading-relaxed font-normal">
                    {currentPatient.signalMessage}
                  </p>
                </div>
              </div>

              <div className="md:text-right shrink-0 bg-white/40 md:bg-transparent p-3 md:p-0 rounded-2xl">
                <div className="text-[10px] font-bold tracking-wider text-[#695244] uppercase">
                  NON-RESPONSE RISK
                </div>
                <div className="text-3xl font-serif font-bold text-[#20140e] leading-none mt-1">
                  {currentPatient.nonResponseRisk}
                </div>
                <div className="text-[11px] text-[#554034] mt-1 font-medium">
                  {currentPatient.riskDelta}
                </div>
              </div>
            </div>

            {/* 4 Distinct Color Vitals Cards matching Figma Image 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Hemoglobin (Warm Sand Peach #debfa3) */}
              <div className="bg-[#debfa3] p-4 rounded-3xl border border-[#cbab90] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between text-xs text-[#5a4233] relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[#4a3427]">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold bg-white/40 px-2.5 py-0.5 rounded-full text-[#3b271d]">
                    Improving
                  </span>
                </div>
                <div className="mt-3 relative z-10">
                  <div className="text-[11px] text-[#5c4436]">Hemoglobin</div>
                  <div className="text-2xl font-bold text-[#20140e]">
                    10 <span className="text-xs font-normal text-[#5a4234]">g/dL</span>
                  </div>
                </div>
                {/* Mini sparkline curve matching figma */}
                <svg className="w-full h-8 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 0 25 Q 40 22 100 8" fill="none" stroke="#684735" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Card 2: Heart rate (Terracotta Rose #c8967b) */}
              <div className="bg-[#c8967b] p-4 rounded-3xl border border-[#b68269] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between text-xs text-[#4b2d1d] relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[#4a2e1f]">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold bg-white/40 px-2.5 py-0.5 rounded-full text-[#361e12]">
                    Resting
                  </span>
                </div>
                <div className="mt-3 relative z-10">
                  <div className="text-[11px] text-[#4b2f21]">Heart rate</div>
                  <div className="text-2xl font-bold text-[#20140e]">
                    78 <span className="text-xs font-normal text-[#482d20]">bpm</span>
                  </div>
                </div>
                {/* Mini descending curve */}
                <svg className="w-full h-8 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 0 10 Q 50 18 100 24" fill="none" stroke="#482d20" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Card 3: Activity (Light Sandy Beige #deccb7) */}
              <div className="bg-[#deccb7] p-4 rounded-3xl border border-[#cbb8a3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between text-xs text-[#523e32] relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[#4c372b]">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold bg-white/40 px-2.5 py-0.5 rounded-full text-[#3a271c]">
                    Daily avg.
                  </span>
                </div>
                <div className="mt-3 relative z-10">
                  <div className="text-[11px] text-[#554033]">Activity</div>
                  <div className="text-2xl font-bold text-[#20140e]">
                    6,420 <span className="text-xs font-normal text-[#554033]">steps</span>
                  </div>
                </div>
                {/* Mini ascending activity curve */}
                <svg className="w-full h-8 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 0 24 Q 45 20 100 10" fill="none" stroke="#5d4334" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Card 4: Adherence (Light Sandy Beige #deccb7) */}
              <div className="bg-[#deccb7] p-4 rounded-3xl border border-[#cbb8a3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between text-xs text-[#523e32] relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-[#4c372b]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold bg-white/40 px-2.5 py-0.5 rounded-full text-[#3a271c]">
                    14-day
                  </span>
                </div>
                <div className="mt-3 relative z-10">
                  <div className="text-[11px] text-[#554033]">Adherence</div>
                  <div className="text-2xl font-bold text-[#20140e]">
                    92%
                  </div>
                  {/* Progress bar matching Figma */}
                  <div className="mt-2 w-full bg-[#c9b5a0] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#382319] h-full rounded-full transition-all duration-700" 
                      style={{ width: '92%' }} 
                    />
                  </div>
                  <div className="text-[9px] text-[#715c4f] mt-1.5">
                    12 of 13 doses recorded
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Split: Trajectories vs Explainability/What-If */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Charts */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Recovery Trajectory Chart Card in Pure Warm White */}
                <div className="bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                        RECOVERY TRAJECTORY
                      </div>
                      <h3 className="font-bold text-base text-[#1f140e] mt-0.5">
                        Hemoglobin response
                      </h3>
                      <p className="text-xs text-[#6e594c]">
                        Observed values and 12-week twin forecast
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#5f493d]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1f140e]" />
                        <span>Observed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#8a5b42] bg-[#cbb39e]" />
                        <span>Twin forecast</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="relative h-64 w-full mt-4 select-none">
                    <svg className="w-full h-full" viewBox="0 0 540 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8d5d44" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#8d5d44" stopOpacity="0.04" />
                        </linearGradient>
                      </defs>

                      {/* Y-axis grid lines (8, 10, 12, 14) */}
                      <line x1="40" y1="25" x2="520" y2="25" stroke="#f0e6dc" strokeWidth="1" />
                      <text x="24" y="29" fill="#998679" fontSize="10">14</text>

                      {/* Normal threshold 12.0 */}
                      <line x1="40" y1="80" x2="520" y2="80" stroke="#cdbcae" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="24" y="84" fill="#998679" fontSize="10">12</text>
                      <text x="410" y="74" fill="#846f61" fontSize="10" fontStyle="italic">Normal threshold 12.0</text>

                      <line x1="40" y1="135" x2="520" y2="135" stroke="#f0e6dc" strokeWidth="1" />
                      <text x="24" y="139" fill="#998679" fontSize="10">10</text>

                      <line x1="40" y1="190" x2="520" y2="190" stroke="#f0e6dc" strokeWidth="1" />
                      <text x="24" y="194" fill="#998679" fontSize="10">8</text>

                      {/* Day 14 vertical marker line */}
                      <line x1="200" y1="20" x2="200" y2="195" stroke="#cdbba9" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="182" y="16" fill="#786355" fontSize="10" fontWeight="bold">Day 14</text>

                      {/* Dynamic Confidence Envelope Band between Day 14 and Week 12 */}
                      {currentPatient.riskLevel === 'Low risk' ? (
                        <path
                          d="M 200 135 L 290 115 L 400 85 L 510 60 L 510 95 L 400 115 L 290 145 Z"
                          fill="url(#bandGradient)"
                        />
                      ) : (
                        <path
                          d="M 200 160 L 290 157 L 400 155 L 510 150 L 510 180 L 400 182 L 290 178 Z"
                          fill="url(#bandGradient)"
                        />
                      )}

                      {/* Forecast Trajectory (Dashed) */}
                      {currentPatient.riskLevel === 'Low risk' ? (
                        <>
                          <path
                            d="M 200 135 Q 320 105 510 75"
                            fill="none"
                            stroke="#8a5c43"
                            strokeWidth="2.5"
                            strokeDasharray="5 4"
                          />
                          <circle cx="290" cy="120" r="3" fill="#8a5c43" />
                          <circle cx="400" cy="98" r="3" fill="#8a5c43" />
                          <circle cx="510" cy="75" r="3.5" fill="#8a5c43" />
                        </>
                      ) : (
                        <>
                          <path
                            d="M 200 160 Q 320 162 510 165"
                            fill="none"
                            stroke="#8a5c43"
                            strokeWidth="2.5"
                            strokeDasharray="5 4"
                          />
                          <circle cx="290" cy="161" r="3" fill="#8a5c43" />
                          <circle cx="400" cy="163" r="3" fill="#8a5c43" />
                          <circle cx="510" cy="165" r="3.5" fill="#8a5c43" />
                        </>
                      )}

                      {/* What-If IV Iron Alternate Trajectory Overlay (Green/Golden line) */}
                      {whatIfMode === 'iv' && (
                        <>
                          <path
                            d="M 200 160 Q 320 120 510 95"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray="4 3"
                          />
                          <circle cx="290" cy="138" r="3.5" fill="#10b981" />
                          <circle cx="400" cy="115" r="3.5" fill="#10b981" />
                          <circle cx="510" cy="95" r="4" fill="#10b981" />
                          <text x="375" y="105" fill="#10b981" fontSize="9" fontWeight="bold">+0.84 g/dL IV Iron</text>
                        </>
                      )}

                      {/* Observed Curve (Solid line with markers) */}
                      {currentPatient.riskLevel === 'Low risk' ? (
                        <>
                          <path
                            d="M 50 174 Q 85 186 115 160 T 200 135"
                            fill="none"
                            stroke="#1f140e"
                            strokeWidth="3"
                          />
                          <circle cx="50" cy="174" r="4.5" fill="#1f140e" />
                          <circle cx="115" cy="160" r="4.5" fill="#1f140e" />
                          <circle cx="200" cy="135" r="4.5" fill="#1f140e" />
                        </>
                      ) : (
                        <>
                          <path
                            d="M 50 165 Q 85 168 115 163 T 200 160"
                            fill="none"
                            stroke="#1f140e"
                            strokeWidth="3"
                          />
                          <circle cx="50" cy="165" r="4.5" fill="#1f140e" />
                          <circle cx="115" cy="163" r="4.5" fill="#1f140e" />
                          <circle cx="200" cy="160" r="4.5" fill="#1f140e" />
                        </>
                      )}

                      {/* X-axis labels */}
                      <text x="40" y="212" fill="#998679" fontSize="10">Day 0</text>
                      <text x="105" y="212" fill="#998679" fontSize="10">Day 7</text>
                      <text x="188" y="212" fill="#998679" fontSize="10">Day 14</text>
                      <text x="278" y="212" fill="#998679" fontSize="10">Week 4</text>
                      <text x="388" y="212" fill="#998679" fontSize="10">Week 8</text>
                      <text x="495" y="212" fill="#998679" fontSize="10">Week 12</text>
                    </svg>
                  </div>

                  {/* Chart Footnote Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0e6dc] text-xs">
                    <span className="font-semibold text-[#3e2c22]">
                      {currentPatient.vitals?.hemoglobin?.delta || '+1.4 g/dL since baseline'}
                    </span>
                    <span className="font-semibold text-[#3e2c22]">
                      {currentPatient.riskLevel === 'Low risk'
                        ? `Expected Week 12: ${currentPatient.trajectory?.[6]?.forecast || 12.7} g/dL`
                        : `Projected Week 12: ${currentPatient.trajectory?.[6]?.forecast || 9.5} g/dL (Stalled)`}
                    </span>
                  </div>
                </div>

                {/* 2. Wearable Stream Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                        WEARABLE STREAM
                      </div>
                      <h3 className="font-bold text-base text-[#1f140e] mt-0.5">
                        Physiological recovery
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#e4f0e2] text-[#2c5324] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#3d842d] animate-pulse" />
                      <span>Live sync</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5b463a] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1f140e]" />
                      <span>Resting heart rate</span>
                      <strong className="text-[#1f140e] font-mono">{currentPatient.vitals.heartRate.value} bpm</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ab7343]" />
                      <span>Daily steps</span>
                      <strong className="text-[#1f140e] font-mono">{currentPatient.vitals.activity.value}</strong>
                    </div>
                  </div>

                  {/* Dual sparklines */}
                  <div className="h-20 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 500 70" preserveAspectRatio="none">
                      {/* HR Curve */}
                      <path
                        d="M 10 15 Q 120 22 250 42 T 490 58"
                        fill="none"
                        stroke="#1f140e"
                        strokeWidth="2.5"
                      />
                      {/* Steps Curve */}
                      <path
                        d="M 10 60 Q 120 52 250 35 T 490 15"
                        fill="none"
                        stroke="#ab7343"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): AI Explainability + Counterfactual + Ganzoni */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Explainable AI Card matching Figma */}
                <div className="bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                        EXPLAINABLE AI
                      </div>
                      <h3 className="font-bold text-base text-[#1f140e] mt-0.5">
                        Why this prediction?
                      </h3>
                      <p className="text-xs text-[#705c50]">
                        Contribution to non-response probability
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#ebdccb] text-[#3e2b20] text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#794931]" />
                      <span>AI</span>
                    </div>
                  </div>

                  {/* Horizontal Factor Bars */}
                  <div className="space-y-3.5 pt-1">
                    {(currentPatient.xaiFactors || []).map((factor, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#2c1d16] font-medium">{factor.name}</span>
                          <span className={`font-mono font-bold ${factor.impact === 'negative' ? 'text-[#873827]' : 'text-[#382116]'}`}>
                            {factor.value}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#ede1d4] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${factor.impact === 'negative' ? 'bg-[#984535]' : 'bg-[#382116]'}`}
                            style={{ width: factor.width || '50%' }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onOpenRationale}
                      className="text-xs font-semibold text-[#573d30] hover:text-[#1f140e] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View biochemical rationale</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Counterfactual / What-If Simulator Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                        COUNTERFACTUAL
                      </div>
                      <h3 className="font-bold text-base text-[#1f140e] mt-0.5">
                        What-if simulator
                      </h3>
                      <p className="text-xs text-[#705c50]">
                        Preview an alternate intervention trajectory.
                      </p>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#8a5b42]" />
                  </div>

                  {/* Pills: 4 Clinical Scenarios */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWhatIfMode('current')}
                      className={`p-2.5 rounded-2xl text-left border text-xs transition-all cursor-pointer ${
                        whatIfMode === 'current'
                          ? 'bg-[#decbb8] border-[#cbb39d] text-[#1f140e] font-semibold shadow-2xs'
                          : 'bg-[#f4ebe0] border-[#e2d5c5] text-[#6b584c] hover:bg-[#ede0d2]'
                      }`}
                    >
                      <div className="font-bold">Current therapy</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Oral iron · Baseline</div>
                    </button>

                    <button
                      onClick={() => setWhatIfMode('iv')}
                      className={`p-2.5 rounded-2xl text-left border text-xs transition-all cursor-pointer ${
                        whatIfMode === 'iv'
                          ? 'bg-[#decbb8] border-[#cbb39d] text-[#1f140e] font-semibold shadow-2xs'
                          : 'bg-[#f4ebe0] border-[#e2d5c5] text-[#6b584c] hover:bg-[#ede0d2]'
                      }`}
                    >
                      <div className="font-bold">Switch to IV iron</div>
                      <div className="text-[10px] opacity-80 mt-0.5">FCM boost +0.84 g/dL</div>
                    </button>

                    <button
                      onClick={() => setWhatIfMode('adherence')}
                      className={`p-2.5 rounded-2xl text-left border text-xs transition-all cursor-pointer ${
                        whatIfMode === 'adherence'
                          ? 'bg-[#decbb8] border-[#cbb39d] text-[#1f140e] font-semibold shadow-2xs'
                          : 'bg-[#f4ebe0] border-[#e2d5c5] text-[#6b584c] hover:bg-[#ede0d2]'
                      }`}
                    >
                      <div className="font-bold">Adherence &gt;95%</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Correct administration</div>
                    </button>

                    <button
                      onClick={() => setWhatIfMode('tests')}
                      className={`p-2.5 rounded-2xl text-left border text-xs transition-all cursor-pointer ${
                        whatIfMode === 'tests'
                          ? 'bg-[#decbb8] border-[#cbb39d] text-[#1f140e] font-semibold shadow-2xs'
                          : 'bg-[#f4ebe0] border-[#e2d5c5] text-[#6b584c] hover:bg-[#ede0d2]'
                      }`}
                    >
                      <div className="font-bold">Extra Workup</div>
                      <div className="text-[10px] opacity-80 mt-0.5">B12 / Celiac / GI Screen</div>
                    </button>
                  </div>

                  {/* Projected stat */}
                  <div className="bg-[#f2e6d9] p-3.5 rounded-2xl border border-[#ddcfbf] flex items-center justify-between text-xs">
                    <span className="text-[#5f4c41]">
                      {whatIfMode === 'tests' ? 'Recommended Investigation' : 'Projected Week 8 Hb'}
                    </span>
                    <span className="text-base font-bold text-[#1f140e]">
                      {whatIfMode === 'current'
                        ? (currentPatient.whatIf?.currentTherapyWeek8 || '11.8 g/dL')
                        : whatIfMode === 'iv'
                        ? (currentPatient.whatIf?.ivIronWeek8 || '12.9 g/dL')
                        : whatIfMode === 'adherence'
                        ? `${(parseFloat(currentPatient.vitals.hemoglobin.value) + 1.8).toFixed(1)} g/dL`
                        : 'Serum B12 + Celiac Panel'}
                    </span>
                  </div>
                </div>

                {/* 3. Ganzoni Calculator Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                        GANZONI CALCULATOR
                      </div>
                      <h3 className="font-bold text-base text-[#1f140e] mt-0.5">
                        IV iron requirement
                      </h3>
                    </div>
                    <FileText className="w-4 h-4 text-[#8a5b42]" />
                  </div>

                  {/* Weight Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-[#523d32] mb-1.5 font-medium">
                      <span>Patient weight</span>
                      <span className="font-bold">{patientWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="95"
                      value={patientWeight}
                      onChange={(e) => setPatientWeight(parseInt(e.target.value))}
                      className="w-full accent-[#382116] bg-[#e1d3c2] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Iron Deficit Box + Referral Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="bg-[#ebdccb] p-3 rounded-2xl border border-[#d8c5b2]">
                      <div className="text-[9px] font-bold tracking-wider uppercase text-[#735d50]">
                        IRON DEFICIT
                      </div>
                      <div className="text-xl font-bold text-[#1f140e]">
                        {calculatedDeficit} mg
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenReferral(patientWeight, calculatedDeficit)}
                      className="px-5 py-2.5 rounded-full bg-[#211510] hover:bg-[#38241b] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      Create referral
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* PROGRAM VIEW */
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#e5d6c6] shadow-xs">
              <div className="text-[11px] text-[#786457]">Women with anemia</div>
              <div className="text-3xl font-bold text-[#1f140e] mt-1">57%</div>
              <div className="text-[11px] text-[#847164] mt-1">NFHS-5 national average</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e5d6c6] shadow-xs">
              <div className="text-[11px] text-[#786457]">Expected non-responders</div>
              <div className="text-3xl font-bold text-[#1f140e] mt-1">27.2%</div>
              <div className="text-[11px] text-[#847164] mt-1">Oral iron therapy</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e5d6c6] shadow-xs">
              <div className="text-[11px] text-[#786457]">Decision gained</div>
              <div className="text-3xl font-bold text-[#1f140e] mt-1">70 days</div>
              <div className="text-[11px] text-[#847164] mt-1">Day 14 vs. Day 84</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e5d6c6] shadow-xs">
              <div className="text-[11px] text-[#786457]">Potential savings</div>
              <div className="text-3xl font-bold text-[#1f140e] mt-1">₹7,200</div>
              <div className="text-[11px] text-[#847164] mt-1">Estimated per patient</div>
            </div>
          </div>

          {/* 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: State Prioritization Table */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                    STATE PRIORITIZATION
                  </div>
                  <h3 className="font-bold text-lg text-[#1f140e] mt-0.5">
                    Anemia burden by state
                  </h3>
                </div>

                {/* State search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-[#867366] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search state"
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full bg-[#f4ebe0] border border-[#d6c5b4] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#221613] placeholder-[#9c897c] focus:outline-none focus:ring-1 focus:ring-[#774f3d]"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-bold text-[#745f52] uppercase border-b border-[#e5d5c5]">
                    <tr>
                      <th className="py-2.5 font-semibold">STATE</th>
                      <th className="py-2.5 font-semibold">ANEMIC WOMEN</th>
                      <th className="py-2.5 font-semibold">EST. NON-RESPONSE</th>
                      <th className="py-2.5 font-semibold text-right">PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee3d6]">
                    {filteredStates.map((state, idx) => (
                      <tr key={idx} className="hover:bg-[#faf4ec] transition-colors">
                        <td className="py-3 font-semibold text-[#1f140e]">{state.name}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-[#e2d2c1] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#704838] rounded-full"
                                style={{ width: `${state.anemicPct}%` }}
                              />
                            </div>
                            <span className="font-medium text-[#463228]">{state.anemicPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-[#463228] font-medium">{state.nonResponsePct}%</td>
                        <td className="py-3 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            state.priority === 'High'
                              ? 'bg-[#382116] text-white'
                              : 'bg-[#ded1c1] text-[#4d362a]'
                          }`}>
                            {state.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Economic Impact Model */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e5d6c6] shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-[#796456] uppercase">
                    ECONOMIC IMPACT MODEL
                  </div>
                  <h3 className="font-bold text-lg text-[#1f140e] mt-0.5">
                    Plan a screening cohort
                  </h3>
                  <p className="text-xs text-[#705c50]">
                    Estimate avoided escalation costs from earlier identification.
                  </p>
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-[#523d32] mb-1.5 font-medium">
                    <span>Women starting oral iron</span>
                    <span className="font-bold font-mono text-sm">{cohortSize.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={cohortSize}
                    onChange={(e) => setCohortSize(parseInt(e.target.value))}
                    className="w-full accent-[#382116] bg-[#e1d3c2] h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#867365] mt-1 font-mono">
                    <span>10k</span>
                    <span>10 lakh</span>
                  </div>
                </div>

                {/* Savings Callout Box */}
                <div className="bg-[#decaba] rounded-2xl p-6 text-center border border-[#cbbaaa] shadow-xs">
                  <div className="text-[11px] font-bold tracking-widest text-[#6c5547] uppercase">
                    PROJECTED PROGRAM SAVINGS
                  </div>
                  <div className="text-4xl font-serif font-bold text-[#1f140e] my-2">
                    ₹{totalSavingsCr} Cr
                  </div>
                  <p className="text-xs text-[#523d30]">
                    by identifying {nonRespondersEst.toLocaleString('en-IN')} likely non-responders at Day 14.
                  </p>
                </div>

                {/* Checkpoints */}
                <div className="space-y-2 text-xs text-[#4c372b] pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#754a37]" />
                    <span>Fewer emergency transfusions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#754a37]" />
                    <span>Reduced hospital admissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#754a37]" />
                    <span>Earlier etiological workup</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenProgramBrief(cohortSize, totalSavingsCr, nonRespondersEst)}
                className="w-full py-3.5 px-6 rounded-full bg-[#211510] hover:bg-[#38241b] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Download program brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
