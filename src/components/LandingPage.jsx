import React from 'react';
import { ArrowRight, Heart, Stethoscope } from 'lucide-react';

export function LandingPage({ onOpenDoctor, onOpenPatient }) {
  return (
    <div 
      className="min-h-screen text-[#f8f3e9] flex flex-col justify-between relative overflow-hidden font-sans select-none"
      style={{
        backgroundColor: '#432f1f',
        backgroundImage: `
          linear-gradient(110deg, #432e1f 0%, #4a3422 20%, #593f28 42%, #6e4f32 64%, #825f3b 84%, #8c6841 100%)
        `,
      }}
    >
      {/* Subtle warm luminous right-side glow matching Figma */}
      <div 
        className="absolute -right-20 top-1/4 w-[750px] h-[750px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(162, 120, 75, 0.28) 0%, rgba(135, 96, 58, 0.14) 45%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Top Navbar with thin divider line matching Figma */}
      <div className="relative z-10">
        <header className="px-6 sm:px-12 lg:px-20 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <img 
              src="/hemalyx-logo.png" 
              alt="Hemalyx" 
              className="w-10 h-10 object-contain drop-shadow-xs select-none" 
            />
            <div>
              <div className="font-bold text-lg tracking-tight text-white leading-none">Hemalyx</div>
              <div className="text-[11px] text-[#c4b1a4] tracking-wide mt-1">Early insight. Better recovery.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-[#d5b29b] uppercase">
            <span>SECURE HEALTH ACCESS</span>
          </div>
        </header>
      </div>

      {/* Main Hero Content */}
      <main className="px-6 sm:px-12 lg:px-20 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10 my-auto">
        {/* Left Column: Headline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-xs font-bold tracking-[0.2em] text-[#dcb47c] uppercase">
            DIGITAL TWIN CARE FOR ANEMIA
          </div>
          
          {/* Dual-tone exact headline from Figma screenshot:
              'Know sooner.' in #f8f3e9 (ivory)
              'Recover better.' in #e5c394 (warm golden amber) */}
          <h1 className="text-5xl sm:text-6xl xl:text-[76px] font-bold leading-[0.98] tracking-tight">
            <span className="text-[#f8f3e9] block">Know</span>
            <span className="text-[#f8f3e9] block">sooner.</span>
            <span className="text-[#e5c394] block">Recover</span>
            <span className="text-[#e5c394] block">better.</span>
          </h1>

          <p className="text-[#cebbae] text-base leading-relaxed max-w-md font-normal pt-1">
            Hemalyx brings patient history, daily health signals, and early screening together—so every person gets the right care at the right time.
          </p>
        </div>

        {/* Right Column: Two Entry Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Doctor Workspace (#f5f0e9 Ivory White Card) */}
          <div className="bg-[#f5f0e9] text-[#221610] rounded-[28px] p-7 flex flex-col justify-between shadow-2xl border border-[#ede3d7]/60 group min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-full bg-[#ede2d4] flex items-center justify-center text-[#553b2d]">
                  <Stethoscope className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#867264] uppercase">
                  CLINICIAN
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#1f140e] mb-6">
                Doctor workspace
              </h2>
            </div>

            <button
              onClick={onOpenDoctor}
              className="w-full py-3.5 px-6 rounded-full bg-[#21140e] hover:bg-[#38241a] text-[#faf6f1] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>Open doctor dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: My Health Journey (#e2cfba Warm Sand/Tan Card) */}
          <div className="bg-[#e2cfba] text-[#221610] rounded-[28px] p-7 flex flex-col justify-between shadow-2xl border border-[#d6c1ab] group min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-full bg-[#d5bfab] flex items-center justify-center text-[#553b2d]">
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[#867264] uppercase">
                  PATIENT
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#1f140e] mb-6">
                My health journey
              </h2>
            </div>

            <button
              onClick={onOpenPatient}
              className="w-full py-3.5 px-6 rounded-full bg-[#724935] hover:bg-[#86563f] text-[#faf6f1] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>View my health</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer matching Figma */}
      <div className="px-6 sm:px-12 lg:px-20 py-6 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#b5a08c] gap-3">
        <div>Built for Anemia Mukt Bharat</div>
        <div>Private by design · Clinical decision support</div>
      </div>
    </div>
  );
}
