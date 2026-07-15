import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   HeroSection — Full-screen command-centre hero
   ───────────────────────────────────────────────────────────── */

/* Tiny telemetry readout displayed bottom-left of the hero */
function TelemetryHUD() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const altitude  = (312 + Math.sin(tick * 0.7) * 8).toFixed(1);
  const velocity  = (24.6 + Math.cos(tick * 0.5) * 1.2).toFixed(1);
  const battery   = Math.max(87, 92 - tick % 12);
  const linkQual  = Math.min(100, 96 + (tick % 5));
  const heading   = ((tick * 3) % 360).toString().padStart(3, "0");

  const rows = [
    { label: "ALT",   value: `${altitude} m`,     color: "text-amber-400" },
    { label: "SPD",   value: `${velocity} m/s`,   color: "text-amber-400" },
    { label: "HDG",   value: `${heading}°`,        color: "text-teal-300"  },
    { label: "PWR",   value: `${battery}%`,        color: battery > 80 ? "text-emerald-400" : "text-red-400" },
    { label: "LINK",  value: `${linkQual}%`,       color: "text-emerald-400" },
    { label: "MODE",  value: "ISR / AUTO",         color: "text-violet-400" },
  ];

  return (
    <div className="relative z-10 font-mono">
      {/* header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
        <span className="text-[9px] tracking-widest text-emerald-400">AEROS MK-1 // LIVE TELEMETRY</span>
      </div>
      {/* data rows */}
      <div className="border border-amber-500/20 bg-black/60 backdrop-blur-sm p-3 grid grid-cols-3 gap-x-6 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <span className="text-[8px] text-slate-500 tracking-widest">{r.label}</span>
            <span className={`text-[11px] ${r.color}`}>{r.value}</span>
          </div>
        ))}
      </div>
      {/* bottom timestamp */}
      <div className="text-[8px] text-slate-600 mt-1 font-mono">
        UTC {new Date().toISOString().slice(11, 19)} · ELRS {(tick % 2 === 0 ? 22 : 21)}KM LINK
      </div>
    </div>
  );
}

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

        {/* drone body SVG */}
        <svg
          width="220" height="220" viewBox="0 0 220 220"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Central fuselage */}
          <rect x="95" y="90" width="30" height="40" rx="4"
            fill="#1a1a2e" stroke="rgba(245,158,11,0.7)" strokeWidth="1.5" />
          {/* Camera dome */}
          <ellipse cx="110" cy="135" rx="10" ry="7"
            fill="#0e0e1a" stroke="rgba(45,212,191,0.6)" strokeWidth="1" />
          {/* Camera lens */}
          <circle cx="110" cy="135" r="4" fill="#2dd4bf" opacity="0.4" />

          {/* Arms — morphed 90° down into rover config at rest = flight config here */}
          {/* Front-Left arm */}
          <line x1="95" y1="100" x2="55" y2="70" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round"/>
          {/* Front-Right arm */}
          <line x1="125" y1="100" x2="165" y2="70" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round"/>
          {/* Rear-Left arm */}
          <line x1="95" y1="120" x2="55" y2="150" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round"/>
          {/* Rear-Right arm */}
          <line x1="125" y1="120" x2="165" y2="150" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round"/>

          {/* Motor mounts */}
          {[[55,70],[165,70],[55,150],[165,150]].map(([cx,cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="10"
                fill="#0e0e1a" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="5" fill="rgba(245,158,11,0.15)" />
              {/* Prop blades */}
              <ellipse cx={cx - 14} cy={cy} rx="12" ry="2.5"
                fill="rgba(245,158,11,0.25)" transform={`rotate(-15,${cx},${cy})`} />
              <ellipse cx={cx + 14} cy={cy} rx="12" ry="2.5"
                fill="rgba(245,158,11,0.25)" transform={`rotate(-15,${cx},${cy})`} />
            </g>
          ))}

          {/* Landing struts (wheel stubs) */}
          {[[75,158],[145,158]].map(([cx,cy], i) => (
            <g key={i}>
              <rect x={cx - 8} y={cy} width="16" height="6" rx="3"
                fill="#1a1a2e" stroke="rgba(45,212,191,0.4)" strokeWidth="1" />
            </g>
          ))}

          {/* Sensor array indicator lines */}
          <line x1="110" y1="90" x2="110" y2="78" stroke="rgba(45,212,191,0.4)" strokeWidth="1" strokeDasharray="2 2"/>
          <circle cx="110" cy="75" r="3" fill="none" stroke="rgba(45,212,191,0.6)" strokeWidth="1"/>
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

          {/* LEFT — copy */}
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
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-white mb-4 animate-fade-in-up"
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
                The <strong className="text-white">Aeros MK-1</strong> is India's first morphing
                hybrid UAV-UGV. It flies, lands, folds its props, swings its servo arms 90°,
                and becomes a silent 4-wheel ground rover — then launches again, on command,
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

            {/* Compliance strip */}
            <div
              className="mt-10 flex flex-wrap gap-3 animate-fade-in-up"
              style={{ animationDelay: "0.55s" }}
            >
              {[
                "iDEX SPRINT-IX",
                "Make-II Category",
                "PIL — Positive List",
                "DGCA ≤25 KG",
                "FMSS Compliant",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2.5 py-1 border border-slate-700/80 text-slate-500 font-mono tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Telemetry HUD — inline below compliance strip */}
            <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.65s" }}>
              <TelemetryHUD />
            </div>
          </div>

          {/* RIGHT — drone visualisation */}
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
