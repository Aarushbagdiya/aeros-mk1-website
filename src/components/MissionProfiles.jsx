import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   MissionProfiles — Desert / Mountain / Perimeter / Maritime
   ───────────────────────────────────────────────────────────── */

const MISSIONS = [
  {
    id:       "desert",
    label:    "DESERT OPS",
    env:      "Rajasthan / Rann of Kutch",
    tagline:  "Eyes where convoys can't go.",
    icon:     "◈",
    color:    "amber",
    gradient: "from-amber-950/60 to-[#06060e]",
    accent:   "border-amber-500/40 text-amber-400",
    badge_bg: "bg-amber-500/10",
    challenge:
      "Vast open terrain, extreme heat, GPS-spoofing threats, shifting sand dunes obstructing ground vehicles.",
    solution:
      "Aeros MK-1 flies to the target zone, lands behind cover, morphs to rover, and conducts a 6-hour silent stakeout. Thermal sees through heat haze. LiDAR maps dunes autonomously.",
    modes:    ["ISR Hover", "Silent Rover", "Thermal Scan", "Auto-Waypoint"],
    metrics: [
      { label: "Max ambient temp",  val: "55°C" },
      { label: "Sand ingress rated", val: "IP54" },
      { label: "Thermal range",     val: "1.2 km" },
      { label: "Loiter (ground)",   val: "6+ hrs" },
    ],
    capability: [
      { name: "Personnel detection",    score: 5 },
      { name: "Vehicle tracking",       score: 5 },
      { name: "Night/thermal ops",      score: 5 },
      { name: "Cross-terrain mobility", score: 4 },
      { name: "Comms relay",            score: 3 },
    ],
  },
  {
    id:       "mountain",
    label:    "HIGH-ALTITUDE",
    env:      "LoC / Siachen / Arunachal",
    tagline:  "Persistent ISR where boots can't reach.",
    icon:     "▲",
    color:    "teal",
    gradient: "from-teal-950/50 to-[#06060e]",
    accent:   "border-teal-400/40 text-teal-300",
    badge_bg: "bg-teal-500/10",
    challenge:
      "Sub-zero temperatures, thin air reducing lift, rocky terrain, rapid weather changes, and severely limited soldier mobility.",
    solution:
      "Lightweight CF frame retains lift at altitude. Ground rover mode navigates rocky terrain without GPS drop risks. All systems rated to -10°C operational. Battery heated enclosure keeps discharge stable.",
    modes:    ["Altitude ISR", "Rocky Traverse", "Waypoint Relay", "Border Watch"],
    metrics: [
      { label: "Min operating temp",  val: "-10°C" },
      { label: "Max altitude",        val: "5,400 m ASL" },
      { label: "Air density comp.",   val: "Auto-throttle" },
      { label: "Terrain mode",        val: "LIDAR terrain-follow" },
    ],
    capability: [
      { name: "Personnel detection",    score: 5 },
      { name: "Vehicle tracking",       score: 3 },
      { name: "Night/thermal ops",      score: 5 },
      { name: "Cross-terrain mobility", score: 5 },
      { name: "Comms relay",            score: 4 },
    ],
  },
  {
    id:       "perimeter",
    label:    "PERIMETER",
    env:      "FOB / Base / Critical Infrastructure",
    tagline:  "Replace five guards with one platform.",
    icon:     "◎",
    color:    "emerald",
    gradient: "from-emerald-950/50 to-[#06060e]",
    accent:   "border-emerald-500/40 text-emerald-400",
    badge_bg: "bg-emerald-500/10",
    challenge:
      "24/7 perimeter security is manpower-intensive, vulnerable to fatigue, and creates predictable patrol patterns that adversaries can exploit.",
    solution:
      "Aeros MK-1 runs autonomous perimeter loops from a charging pad — flying when needed, quietly rolling when stealth matters. AI alerts the ops room instantly upon classification of any intrusion.",
    modes:    ["Autonomous Patrol", "Stealth Rover", "Alert Mode", "Persistent Watch"],
    metrics: [
      { label: "Patrol perimeter",   val: "Up to 4 km" },
      { label: "Alert latency",      val: "< 2 s" },
      { label: "Continuous ops",     val: "24/7 (charge-swap)" },
      { label: "Guards replaced",    val: "Up to 5 posts" },
    ],
    capability: [
      { name: "Personnel detection",    score: 5 },
      { name: "Vehicle tracking",       score: 4 },
      { name: "Night/thermal ops",      score: 5 },
      { name: "Cross-terrain mobility", score: 4 },
      { name: "Comms relay",            score: 5 },
    ],
  },
  {
    id:       "maritime",
    label:    "COASTAL / MARITIME",
    env:      "Coastline / Island Territories",
    tagline:  "Sea-to-shore ISR from a single asset.",
    icon:     "◉",
    color:    "violet",
    gradient: "from-violet-950/50 to-[#06060e]",
    accent:   "border-violet-500/40 text-violet-400",
    badge_bg: "bg-violet-500/10",
    challenge:
      "Coastal infiltration monitoring demands wide coverage, immediate response, and all-weather operability. Conventional patrol boats are slow and visible.",
    solution:
      "Launched from patrol vessel or shore post, the MK-1 can cover 22 km of coastline on a single sortie. Thermal imaging detects heat signatures of swimmers and small dinghies at night.",
    modes:    ["Coastal Patrol", "Vessel Tracking", "Beach Watch", "Thermal Night Scan"],
    metrics: [
      { label: "Coastal coverage",    val: "22 km range" },
      { label: "Sea-state tolerance", val: "Beaufort 3" },
      { label: "Swimmer detection",   val: "Thermal · 800 m" },
      { label: "Salt-resistant",      val: "Conformal coated" },
    ],
    capability: [
      { name: "Personnel detection",    score: 4 },
      { name: "Vehicle tracking",       score: 5 },
      { name: "Night/thermal ops",      score: 5 },
      { name: "Cross-terrain mobility", score: 3 },
      { name: "Comms relay",            score: 4 },
    ],
  },
];

const COLOR_MAP = {
  amber:   { border: "border-amber-500/40",   text: "text-amber-400",   dot: "bg-amber-400",   barFill: "bg-amber-400",   hoverBg: "hover:bg-amber-500/10"   },
  teal:    { border: "border-teal-400/40",    text: "text-teal-300",    dot: "bg-teal-400",    barFill: "bg-teal-400",    hoverBg: "hover:bg-teal-500/10"    },
  emerald: { border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-400", barFill: "bg-emerald-400", hoverBg: "hover:bg-emerald-500/10" },
  violet:  { border: "border-violet-500/40",  text: "text-violet-400",  dot: "bg-violet-400",  barFill: "bg-violet-400",  hoverBg: "hover:bg-violet-500/10"  },
};

function CapabilityBar({ name, score, color }) {
  const c = COLOR_MAP[color];
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] text-slate-500 w-40 flex-shrink-0">{name}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((pip) => (
          <div
            key={pip}
            className={`w-6 h-1.5 ${pip <= score ? c.barFill : "bg-slate-800"} transition-all duration-500`}
          />
        ))}
      </div>
      <span className={`font-mono text-[10px] ${c.text} w-4`}>{score}/5</span>
    </div>
  );
}

export default function MissionProfiles() {
  const [active, setActive] = useState("desert");

  const mission = MISSIONS.find((m) => m.id === active);
  const c       = COLOR_MAP[mission.color];

  return (
    <section id="missions" className="relative py-28 bg-[#06060e] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-fine opacity-50 pointer-events-none" />
      <div className={`absolute inset-0 bg-gradient-to-b ${mission.gradient} pointer-events-none transition-all duration-700`} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 mb-3">
            // MISSION PROFILES · AEROS MK-1 DEPLOYMENT SCENARIOS
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            WHERE IT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-300">
              OPERATES
            </span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
            From the scorching Thar desert to the frozen heights of the Siachen glacier —
            the Aeros MK-1 is engineered for every theatre the Indian Armed Forces face.
          </p>
        </div>

        {/* ── Mission selector tabs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-10 bg-amber-500/8">
          {MISSIONS.map((m) => {
            const mc = COLOR_MAP[m.color];
            const isActive = m.id === active;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`bg-[#09090f] px-4 py-5 text-left transition-all duration-300 group ${
                  isActive ? `${mc.border} border-b-2` : "border-b-2 border-transparent"
                }`}
              >
                <div className={`text-2xl mb-2 ${isActive ? mc.text : "text-slate-600 group-hover:text-slate-400"}`}>
                  {m.icon}
                </div>
                <div className={`font-mono text-[9px] tracking-widest mb-1 ${
                  isActive ? mc.text : "text-slate-600"
                }`}>
                  {m.label}
                </div>
                <div className={`text-[10px] ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                  {m.env}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Mission detail ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main info */}
          <div className="lg:col-span-2 border border-amber-500/10 bg-[#09090f] p-8">
            {/* Mission header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className={`font-mono text-[9px] tracking-widest mb-1 ${c.text}`}>
                  MISSION PROFILE · {mission.label}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{mission.tagline}</h3>
                <p className="text-slate-500 text-xs mt-1 font-mono">{mission.env}</p>
              </div>
              <div className={`text-4xl ${c.text}`}>{mission.icon}</div>
            </div>

            {/* Challenge / Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="font-mono text-[9px] tracking-widest text-red-400/70 mb-2">
                  // THE CHALLENGE
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{mission.challenge}</p>
              </div>
              <div>
                <div className={`font-mono text-[9px] tracking-widest mb-2 ${c.text} opacity-70`}>
                  // THE SOLUTION
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{mission.solution}</p>
              </div>
            </div>

            {/* Active modes */}
            <div className="mb-8">
              <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-3">
                ACTIVE MODES IN THIS PROFILE
              </div>
              <div className="flex flex-wrap gap-2">
                {mission.modes.map((mode) => (
                  <span
                    key={mode}
                    className={`px-3 py-1.5 border ${c.border} ${mission.badge_bg} ${c.text} text-[10px] font-mono tracking-wider`}
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>

            {/* Capability matrix */}
            <div>
              <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-3">
                CAPABILITY MATRIX
              </div>
              <div className="space-y-2.5">
                {mission.capability.map((cap) => (
                  <CapabilityBar
                    key={cap.name}
                    name={cap.name}
                    score={cap.score}
                    color={mission.color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Metrics sidebar */}
          <div className="flex flex-col gap-4">
            {/* Metrics */}
            <div className="border border-amber-500/10 bg-[#09090f] p-6">
              <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-4">
                KEY METRICS
              </div>
              <div className="space-y-4">
                {mission.metrics.map((m) => (
                  <div key={m.label} className="border-b border-slate-800/60 pb-4 last:border-0 last:pb-0">
                    <div className="font-mono text-[8px] text-slate-500 tracking-widest mb-0.5">
                      {m.label}
                    </div>
                    <div className={`text-lg font-black font-mono ${c.text}`}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployment diagram placeholder */}
            <div className="border border-amber-500/10 bg-[#09090f] p-6 flex-1 flex flex-col">
              <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-4">
                DEPLOYMENT CONCEPT
              </div>
              {/* Simple mission flowchart */}
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { step: "01", label: "LAUNCH",    icon: "↑", color: c.text },
                  { step: "02", label: "FLY TO AO", icon: "→", color: "text-slate-400" },
                  { step: "03", label: "LAND",       icon: "↓", color: "text-slate-400" },
                  { step: "04", label: "MORPH",      icon: "⟳", color: c.text },
                  { step: "05", label: "STAKEOUT",   icon: "◉", color: "text-emerald-400" },
                  { step: "06", label: "RELAUNCH",   icon: "↑", color: c.text },
                ].map((step, i, arr) => (
                  <div key={step.step} className="flex items-center gap-3">
                    <div className={`font-mono text-xs ${step.color} flex-shrink-0 w-5`}>{step.icon}</div>
                    <div className="font-mono text-[9px] text-slate-400 tracking-widest flex-1">{step.label}</div>
                    <div className="font-mono text-[8px] text-slate-700">{step.step}</div>
                    {i < arr.length - 1 && (
                      <div className="absolute left-[31px] mt-6 w-px h-3 bg-slate-800" />
                    )}
                  </div>
                ))}
              </div>
              {/* CTA */}
              <a
                href="#contact"
                className={`mt-6 block text-center py-2.5 border ${c.border} ${c.text} ${c.hoverBg} text-[10px] font-mono tracking-[0.15em] transition-colors`}
              >
                REQUEST MISSION BRIEF →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
