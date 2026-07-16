/* ─────────────────────────────────────────────────────────────
   TeamSection — Founders · Trishul Dynamics
   ───────────────────────────────────────────────────────────── */

const FOUNDERS = [
  {
    name:    "Divyam Saini",
    role:    "CO-FOUNDER",
    domain:  "Electronics · Avionics · Autonomy",
    edu:     "BITS Pilani & Iowa State University",
    leads:   "Avionics, systems integration & sensor architecture",
    detail:
      "Leads all electrical subsystems and the autonomy stack — from flight-controller firmware to on-board edge AI. Designed the ExpressLRS RF link, sensor fusion pipeline, and autonomous mission logic running on the NVIDIA Jetson Nano.",
    tags:    ["CUAV V6X FC", "ELRS RF Link", "Edge AI", "ArduPilot / PX4", "YOLOv8"],
    color:   "amber",
    initials:"DS",
  },
  {
    name:    "Krishna P. Bhalodiya",
    role:    "CO-FOUNDER",
    domain:  "Design · Manufacturing · Structures",
    edu:     "BITS Pilani",
    leads:   "Mechanical subsystems, morph kinematics & production",
    detail:
      "Designed the servo tilt-arm morph mechanism that swings the quad's arms 90° from flight to ground configuration in under two seconds. Leads the carbon-fibre airframe, rocker-suspension wheel system, and the path from prototype to repeatable manufacturing.",
    tags:    ["Servo Tilt-Arms", "CF Airframe", "Morph Kinematics", "Fusion 360", "Manufacturing"],
    color:   "teal",
    initials:"KB",
  },
  {
    name:    "Aarush Bagdiya",
    role:    "HEAD OF OPERATIONS",
    domain:  "Operations · Strategy · Business Development",
    edu:     "B.E. Computer Science · BITS Pilani",
    leads:   "Operations, go-to-market strategy & business development",
    detail:
      "Drives the operational backbone of Trishul Dynamics — from procurement strategy and iDEX grant management to customer engagement with the Indian Armed Forces and paramilitary. Bridges the engineering team and the defence acquisition ecosystem.",
    tags:    ["iDEX / DISC", "Defence Procurement", "Go-to-Market", "CS / Systems", "Operations"],
    color:   "violet",
    initials:"AB",
  },
];

const COLOR = {
  amber: {
    border:  "border-amber-500/30",
    text:    "text-amber-400",
    bg:      "bg-amber-500/8",
    tagBg:   "bg-amber-500/10 border-amber-500/25 text-amber-300",
    dotLine: "bg-amber-500",
  },
  teal: {
    border:  "border-teal-400/30",
    text:    "text-teal-300",
    bg:      "bg-teal-500/8",
    tagBg:   "bg-teal-500/10 border-teal-400/25 text-teal-300",
    dotLine: "bg-teal-400",
  },
  violet: {
    border:  "border-violet-500/30",
    text:    "text-violet-300",
    bg:      "bg-violet-500/8",
    tagBg:   "bg-violet-500/10 border-violet-500/25 text-violet-300",
    dotLine: "bg-violet-500",
  },
};

export default function TeamSection() {
  return (
    <section id="team" className="relative py-28 bg-[#06060e] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-fine opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 mb-3">
            // BUILT BY ENGINEERS · FOR THE FIELD
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            THE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-300">
              TEAM
            </span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Two engineers from BITS Pilani building the machine that border surveillance
            has been waiting for — one handles the sky, one handles the ground.
          </p>
        </div>

        {/* ── Founder cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {FOUNDERS.map((f) => {
            const c = COLOR[f.color];
            return (
              <div
                key={f.name}
                className={`relative border ${c.border} bg-[#09090f] p-8 overflow-hidden`}
              >
                {/* Corner accent */}
                <div className={`absolute top-0 left-0 w-16 h-[2px] ${c.dotLine}`} />
                <div className={`absolute top-0 left-0 w-[2px] h-16 ${c.dotLine}`} />

                {/* Avatar + name row */}
                <div className="flex items-start gap-5 mb-6">
                  {/* Avatar placeholder with initials */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full border-2 ${c.border} ${c.bg} flex items-center justify-center`}>
                    <span className={`font-black text-xl font-mono ${c.text}`}>{f.initials}</span>
                  </div>
                  <div>
                    <div className={`font-mono text-[9px] tracking-[0.3em] mb-0.5 ${c.text}`}>
                      {f.role}
                    </div>
                    <h3 className="text-xl font-black text-white">{f.name}</h3>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">{f.edu}</div>
                  </div>
                </div>

                {/* Domain strip */}
                <div className={`border ${c.border} ${c.bg} px-4 py-2.5 mb-5`}>
                  <div className="font-mono text-[8px] tracking-widest text-slate-600 mb-0.5">DOMAIN</div>
                  <div className={`font-mono text-[11px] ${c.text} tracking-wide`}>{f.domain}</div>
                </div>

                {/* Leads */}
                <div className="mb-4">
                  <div className="font-mono text-[8px] tracking-widest text-slate-600 mb-1.5">LEADS</div>
                  <p className="text-sm font-semibold text-slate-200">{f.leads}</p>
                </div>

                {/* Detail */}
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{f.detail}</p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`border px-2 py-1 text-[9px] font-mono tracking-wider ${c.tagBg}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Contact strip ── */}
        <div className="mt-10 max-w-6xl mx-auto border border-amber-500/10 bg-[#09090f] px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-center sm:text-left">
            <div className="text-[9px] tracking-widest text-slate-600 mb-0.5">DIRECT LINE</div>
            <div className="text-sm text-slate-300">trishul.dynamics@gmail.com</div>
          </div>
          <div className="h-px sm:h-8 sm:w-px w-full bg-slate-800" />
          <div className="font-mono text-center sm:text-left">
            <div className="text-[9px] tracking-widest text-slate-600 mb-0.5">HEADQUARTERS</div>
            <div className="text-sm text-slate-300">Pune, Maharashtra, India</div>
          </div>
          <div className="h-px sm:h-8 sm:w-px w-full bg-slate-800" />
          <a
            href="#contact"
            className="flex-shrink-0 px-6 py-3 border border-amber-500/60 text-amber-400 text-[10px] font-mono tracking-[0.15em] hover:bg-amber-500/10 transition-colors"
          >
            ENGAGE THE TEAM →
          </a>
        </div>

      </div>
    </section>
  );
}
