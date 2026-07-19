import { useState, useEffect } from "react";
import NavBar             from "./components/NavBar.jsx";
import HeroSection        from "./components/HeroSection.jsx";
import MorphSection       from "./components/MorphSection.jsx";
import EdgeAIWidget       from "./components/EdgeAIWidget.jsx";
import SpecsSection       from "./components/SpecsSection.jsx";
import MissionProfiles    from "./components/MissionProfiles.jsx";
import ProcurementSection from "./components/ProcurementSection.jsx";
import TeamSection        from "./components/TeamSection.jsx";
import ContactSection     from "./components/ContactSection.jsx";
import Footer             from "./components/Footer.jsx";

/* ─────────────────────────────────────────────────────────────
   App - Root composition
   ───────────────────────────────────────────────────────────── */

/* Amber tactical divider between sections */
function Divider({ label }) {
  return (
    <div className="relative py-1 overflow-visible">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-[#06060e] px-4 font-mono text-[8px] tracking-widest text-amber-500/30">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

/* Boot splash - animated for 1.8 s then calls onDone */
function BootLoader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#06060e] flex flex-col items-center justify-center gap-6">
      <style>{`
        @keyframes boot-cw    { from { transform: rotate(45deg)  } to { transform: rotate(135deg) } }
        @keyframes boot-ccw   { from { transform: rotate(45deg)  } to { transform: rotate(-45deg) } }
        @keyframes boot-bar   { from { width: 0%   } to { width: 100% } }
        @keyframes boot-fade  { 0%,75% { opacity: 1 } 100% { opacity: 0; pointer-events: none; } }
        .boot-wrap  { animation: boot-fade 1.8s ease-in-out forwards; }
        .boot-cw    { animation: boot-cw  3s linear infinite; }
        .boot-ccw   { animation: boot-ccw 2s linear infinite; }
      `}</style>

      <div className="boot-wrap flex flex-col items-center gap-6">
        {/* Logo with subtle pulse ring */}
        <div className="relative flex items-center justify-center">
          <div className="boot-cw absolute w-28 h-28 rounded-full border border-amber-500/20" />
          <img
            src="/logo.svg"
            alt="Trishul Dynamics"
            className="h-24 w-auto relative z-10"
            draggable="false"
          />
        </div>

        <div className="font-mono text-center">
          <div className="text-amber-400 text-xs tracking-[0.4em] mb-1">TRISHUL DYNAMICS</div>
          <div className="text-slate-600 text-[9px] tracking-widest">
            INITIALISING AEROS COMMAND INTERFACE
          </div>
        </div>

        <div className="w-48 h-px bg-slate-800 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-amber-500"
            style={{ animation: "boot-bar 1.4s ease-out forwards" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Root ─── */
export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      {!booted && <BootLoader onDone={() => setBooted(true)} />}

      <div
        className="transition-opacity duration-700"
        style={{ opacity: booted ? 1 : 0 }}
      >
        <NavBar />

        <main>
          <HeroSection />

          <Divider label="// KINEMATIC TRANSITION" />
          <MorphSection />

          <Divider label="// EDGE INTELLIGENCE" />
          <EdgeAIWidget />

          <Divider label="// TECHNICAL SPECIFICATIONS" />
          <SpecsSection />

          <Divider label="// OPERATIONAL DEPLOYMENT" />
          <MissionProfiles />

          <Divider label="// ACQUISITION & COMPLIANCE" />
          <ProcurementSection />

          <Divider label="// THE TEAM" />
          <TeamSection />

          <Divider label="// SECURE COMMUNICATIONS" />
          <ContactSection />
        </main>

        <Footer />
      </div>
    </>
  );
}
