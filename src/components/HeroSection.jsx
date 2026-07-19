import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   HeroSection - Full-screen command-centre hero
   ───────────────────────────────────────────────────────────── */


/* Animated corner crosshairs drawn with SVG */
function CrosshairCorner({ pos = "tl" }) {
  const base = "absolute w-8 h-8 border-amber-500/50";
  const classes = {
    tl: "top-6 left-6 border-t-2 border-l-2",
    tr: "top-6 right-6 border-t-2 border-r-2",
    bl: "bottom-6 left-6 border-b-2 border-l-2",
    br: "bottom-6 right-6 border-b-2 border-r-2",
  };
  return <div className={`${base} ${classes[pos]}`} />;
}

/* Minimal SVG drone silhouette for the hero centrepiece */
function DroneSilhouette() {
  return (
    <div className="relative w-72 h-72 lg:w-[420px] lg:h-[420px] flex items-center justify-center animate-float">
      {/* outer orbit ring */}
      <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-rotate-slow" />
      {/* dashed ring */}
      <svg className="absolute inset-0 w-full h-full animate-rotate-slow" style={{ animationDirection: "reverse", animationDuration: "30s" }}>
        <circle
          cx="50%" cy="50%" r="48%"
          fill="none"
          stroke="rgba(245,158,11,0.15)"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
      </svg>

      {/* centre body */}
      <div className="relative z-10 flex items-center justify-center">
        {/* glowing core */}
        <div className="absolute w-16 h-16 rounded-full bg-amber-500/10 blur-xl animate-glow-pulse" />

        {/* Detailed tactical drone body SVG */}
        <svg
          width="260" height="260" viewBox="0 0 260 260"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Hexagonal / Tactical Fuselage */}
          <path d="M110 90 L150 90 L165 130 L150 170 L110 170 L95 130 Z" fill="#1a1a2e" stroke="rgba(245,158,11,0.8)" strokeWidth="2" />
          {/* Inner core detailing */}
          <path d="M117 98 L143 98 L154 130 L143 162 L117 162 L106 130 Z" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          
          {/* AI Brain glowing core */}
          <circle cx="130" cy="130" r="12" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.6)" strokeWidth="1" />
          <circle cx="130" cy="130" r="5" fill="#8b5cf6" className="animate-pulse" />
          <path d="M130 112 L130 118 M130 142 L130 148 M112 130 L118 130 M142 130 L148 130" stroke="rgba(139,92,246,0.8)" strokeWidth="1.5" />
          
          {/* Front Camera/Thermal Payload (facing down on screen) */}
          <path d="M115 170 L145 170 L140 188 L120 188 Z" fill="#0e0e1a" stroke="rgba(45,212,191,0.7)" strokeWidth="1.5" />
          <ellipse cx="130" cy="180" rx="8" ry="4" fill="#2dd4bf" opacity="0.6" />
          <circle cx="130" cy="180" r="2" fill="#fff" opacity="0.9" />
          
          {/* Top LIDAR Scanner */}
          <rect x="122" y="78" width="16" height="12" rx="2" fill="#1a1a2e" stroke="rgba(45,212,191,0.7)" strokeWidth="1.5" />
          <line x1="126" y1="84" x2="134" y2="84" stroke="#2dd4bf" strokeWidth="2" className="animate-pulse" />
          
          {/* Structural Arms */}
          {/* FL Arm */}
          <path d="M102 110 L60 70 L40 70" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M106 114 L70 78" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          {/* FR Arm */}
          <path d="M158 110 L200 70 L220 70" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M154 114 L190 78" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          {/* RL Arm */}
          <path d="M102 150 L60 190 L40 190" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M106 146 L70 182" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          {/* RR Arm */}
          <path d="M158 150 L200 190 L220 190" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M154 146 L190 182" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />

          {/* Rotors / Propellers */}
          {[[40,70],[220,70],[40,190],[220,190]].map(([cx,cy], i) => (
            <g key={i}>
              {/* Motor mount hexagonal base */}
              <polygon points={`${cx},${cy-7} ${cx+6},${cy-3.5} ${cx+6},${cy+3.5} ${cx},${cy+7} ${cx-6},${cy+3.5} ${cx-6},${cy-3.5}`} fill="#1a1a2e" stroke="rgba(245,158,11,0.9)" strokeWidth="1.5" />
              {/* Prop guards */}
              <circle cx={cx} cy={cy} r="22" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="18" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              {/* Spinning prop effect (3 blades) */}
              <g className="animate-spin" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: "3s", animationTimingFunction: "linear" }}>
                <path d={`M${cx} ${cy} L${cx} ${cy-18} M${cx} ${cy} L${cx-16} ${cy+9} M${cx} ${cy} L${cx+16} ${cy+9}`} stroke="rgba(245,158,11,0.4)" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>
          ))}

          {/* Morphing Rover Wheels / Treads (tucked close to fuselage) */}
          {[[85,100],[175,100],[85,160],[175,160]].map(([cx,cy], i) => (
            <g key={i}>
              <rect x={cx - 6} y={cy - 16} width="12" height="32" rx="3" fill="#09090f" stroke="rgba(45,212,191,0.6)" strokeWidth="1.5" />
              {/* Tread pattern lines */}
              {[cy-10, cy-5, cy, cy+5, cy+10].map(yLine => (
                <line key={yLine} x1={cx - 6} y1={yLine} x2={cx + 6} y2={yLine} stroke="rgba(45,212,191,0.3)" strokeWidth="1" />
              ))}
            </g>
          ))}
          
          {/* Target lock / UI overlay elements */}
          <path d="M20 20 L40 20 M20 20 L20 40" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
          <path d="M240 20 L220 20 M240 20 L240 40" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
          <path d="M20 240 L40 240 M20 240 L20 220" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
          <path d="M240 240 L220 240 M240 240 L240 220" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
        </svg>

        {/* ping rings */}
        <div className="absolute w-24 h-24 rounded-full border border-amber-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute w-36 h-36 rounded-full border border-amber-500/10 animate-ping" style={{ animationDuration: "2.8s", animationDelay: "0.5s" }} />
      </div>

      {/* cardinal label ticks */}
      {["N", "E", "S", "W"].map((dir, i) => (
        <div
          key={dir}
          className="absolute text-[9px] font-mono text-amber-500/50"
          style={{
            top:    i === 0 ? "2px"  : i === 2 ? "auto" : "50%",
            bottom: i === 2 ? "2px"  : "auto",
            left:   i === 3 ? "4px"  : i === 1 ? "auto" : "50%",
            right:  i === 1 ? "4px"  : "auto",
            transform: (i === 0 || i === 2) ? "translateX(-50%)" : "translateY(-50%)",
          }}
        >
          {dir}
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Main export ──────────────── */
export default function HeroSection() {
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSub(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#06060e] scanlines"
    >
      {/* ── Background layers ── */}
      {/* Tactical grid */}
      <div className="absolute inset-0 bg-grid-tactical opacity-100 pointer-events-none" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#06060e_90%)] pointer-events-none" />
      {/* Amber glow source */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />
      {/* Scan line sweep */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent animate-scan pointer-events-none" />

      {/* ── Corner crosshairs ── */}
      <CrosshairCorner pos="tl" />
      <CrosshairCorner pos="tr" />
      <CrosshairCorner pos="bl" />
      <CrosshairCorner pos="br" />

      {/* ── Vertical accent lines ── */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-amber-500/0 via-amber-500/8 to-amber-500/0 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-amber-500/0 via-amber-500/8 to-amber-500/0 pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pt-24 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* LEFT - copy */}
          <div className="flex-1 text-left max-w-2xl">

            {/* Mission status badge */}
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-amber-500/25 bg-amber-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-blink" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400">
                CLASSIFIED · PROTOTYPE PHASE · PIL ELIGIBLE
              </span>
            </div>

            {/* Pre-headline */}
            <p className="font-mono text-[11px] tracking-[0.3em] text-slate-500 mb-3 animate-fade-in-up">
              // TRISHUL DYNAMICS · PROGRAMME AEROS
            </p>

            {/* Main headline */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight text-white mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              ONE SYSTEM.{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                TWO DOMAINS.
              </span>
              <br />
              ZERO TRADE-OFFS.
            </h1>

            {/* Sub-headline */}
            {showSub && (
              <p
                className="text-base lg:text-lg text-slate-400 leading-relaxed max-w-xl mb-10 animate-fade-in-up"
                style={{ animationDelay: "0.25s" }}
              >
                The <strong className="text-white">AEROS MK-1</strong> is India's first morphing
                hybrid UAV-UGV. It flies, lands, folds its props, swings its servo tilt-arms 90°,
                and becomes a silent 4-wheel ground rover - then launches again, on command,
                from any terrain.
              </p>
            )}

            {/* KPI bar */}
            <div
              className="grid grid-cols-3 gap-px mb-10 border border-amber-500/15 bg-amber-500/10 animate-fade-in-up"
              style={{ animationDelay: "0.35s" }}
            >
              {[
                { value: "22 KM",   label: "ELRS Link Range" },
                { value: "6+ HRS",  label: "Ground Endurance" },
                { value: "3-IN-1",  label: "Sensor Suite"     },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#06060e] px-4 py-4 text-center">
                  <div className="text-xl lg:text-2xl font-black text-amber-400 font-mono">{kpi.value}</div>
                  <div className="text-[9px] text-slate-500 tracking-widest mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              <a
                href="#morph"
                className="flex items-center gap-2 px-7 py-4 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] hover:bg-amber-400 transition-colors duration-200 group"
              >
                SEE THE MORPH
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#contact"
                className="flex items-center gap-2 px-7 py-4 border border-slate-700 text-slate-300 text-xs font-bold tracking-[0.2em] hover:border-amber-500/50 hover:text-white transition-all duration-200"
              >
                REQUEST DEFENCE BRIEF
              </a>
            </div>


          </div>

          {/* RIGHT - drone visualisation */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <DroneSilhouette />

            {/* Floating annotation cards */}
            <div className="absolute -top-4 -right-4 lg:right-0 bg-[#0e0e1a] border border-amber-500/25 px-3 py-2 font-mono">
              <div className="text-[8px] text-slate-500 tracking-widest mb-0.5">SENSOR</div>
              <div className="text-[10px] text-teal-300">LIDAR · THERMAL · HD</div>
            </div>
            <div className="absolute bottom-6 -right-4 lg:right-0 bg-[#0e0e1a] border border-amber-500/25 px-3 py-2 font-mono">
              <div className="text-[8px] text-slate-500 tracking-widest mb-0.5">AI BRAIN</div>
              <div className="text-[10px] text-violet-300">JETSON NANO · EDGE</div>
            </div>
            <div className="absolute bottom-6 -left-4 lg:left-0 bg-[#0e0e1a] border border-amber-500/25 px-3 py-2 font-mono">
              <div className="text-[8px] text-slate-500 tracking-widest mb-0.5">FRAME</div>
              <div className="text-[10px] text-amber-300">CARBON FIBRE</div>
            </div>
          </div>
        </div>
      </div>


      {/* ── Scroll nudge ── */}
      <div className="absolute bottom-6 right-8 flex flex-col items-center gap-1 z-10">
        <div className="text-[8px] font-mono text-slate-600 tracking-widest rotate-90 mb-2">SCROLL</div>
        <div className="w-[1px] h-10 bg-gradient-to-b from-amber-500/40 to-transparent" />
      </div>
    </section>
  );
}
