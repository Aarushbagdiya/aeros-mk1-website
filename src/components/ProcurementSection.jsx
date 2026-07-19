import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   ProcurementSection - Compliance matrix, acquisition pathways,
   and supply-chain transparency for MoD procurement officers
   ───────────────────────────────────────────────────────────── */

const COMPLIANCE_ITEMS = [
  {
    scheme:  "Positive Indigenisation List (PIL)",
    ref:     "MoD PIL Category - UAV Systems",
    status:  "ELIGIBLE",
    detail:  "AEROS MK-1 falls under the positive indigenisation list for UAVs ≤25 kg. Fully domestically manufactured. Importation of this category is restricted, creating a mandated government procurement avenue for Indian OEMs.",
    icon:    "◈",
    color:   "emerald",
  },
  {
    scheme:  "iDEX (Innovations for Defence Excellence)",
    ref:     "SPRINT-IX · DIO Problem Statement",
    status:  "ELIGIBLE",
    detail:  "Trishul Dynamics is eligible under iDEX DISC (up to ₹1.5 Cr) for prototype evaluation. Next stage: ADITI / iDEX Prime (up to ₹25 Cr) for field trials and first pilot orders. Further scale through DRDO TDF (up to ₹50 Cr). Full non-dilutive grant ladder mapped to each development milestone.",
    icon:    "⬡",
    color:   "amber",
  },
  {
    scheme:  "Make-II (Industry-Funded)",
    ref:     "DPP 2020 · Chapter III · Para 4.3",
    status:  "APPLICABLE",
    detail:  "Under Make-II, Trishul Dynamics can approach Army HQ / Air HQ with a proposal. No Government funding at prototype stage - suitable for an already-prototyped system like AEROS MK-1 seeking production order.",
    icon:    "▲",
    color:   "teal",
  },
  {
    scheme:  "DGCA Unmanned Aircraft System Rules",
    ref:     "UAS Rules 2021 · Sub-3 KG Green Zone",
    status:  "COMPLIANT",
    detail:  "AUW ≤ 2.8 kg places AEROS MK-1 in the micro-UAS category. Exempt from type certificate requirement in restricted/controlled airspace operations with a valid UAOP. Military deployment under separate operational clearance.",
    icon:    "◉",
    color:   "violet",
  },
  {
    scheme:  "FMSS (Field Maintenance Support System)",
    ref:     "MIL-STD-2361 aligned",
    status:  "ALIGNED",
    detail:  "Modular design ensures sub-assembly swaps in <15 min. Spare parts kitted in standard FMSS boxes. Field maintenance manual (FMM) prepared. Depot-level support plan submitted with Technical Offer.",
    icon:    "◎",
    color:   "rose",
  },
  {
    scheme:  "MSE / MSME Preference Policy",
    ref:     "MoD Order dated 25 Jul 2020",
    status:  "REGISTERED",
    detail:  "Trishul Dynamics is a registered MSME. Entitled to 25% reservation in MoD procurement tenders and 358-day price validity extension. Eligible for EMD exemption in GeM/DAP procurement process.",
    icon:    "▣",
    color:   "slate",
  },
];

const STATUS_STYLE = {
  ELIGIBLE:    "text-emerald-400 border-emerald-500/40 bg-emerald-500/8",
  APPLICABLE:  "text-teal-300   border-teal-400/40    bg-teal-500/8",
  COMPLIANT:   "text-emerald-400 border-emerald-500/40 bg-emerald-500/8",
  ALIGNED:     "text-amber-400  border-amber-500/40   bg-amber-500/8",
  REGISTERED:  "text-violet-400 border-violet-500/40  bg-violet-500/8",
};

const COLOR_MAP = {
  emerald: "text-emerald-400 border-emerald-500/30",
  amber:   "text-amber-400   border-amber-500/30",
  teal:    "text-teal-300    border-teal-400/30",
  violet:  "text-violet-400  border-violet-500/30",
  rose:    "text-rose-400    border-rose-500/30",
  slate:   "text-slate-300   border-slate-600/40",
};

const SUPPLY_CHAIN = [
  { component: "Carbon Fibre Tubes / Plates",    origin: "Domestic (Surat + Bengaluru)",   share: "100%" },
  { component: "T-Motor MN3510 Motors",          origin: "Import → Seeking domestic alt.", share: "0%"   },
  { component: "ESC (BLHeli32 Hobbywing)",       origin: "Import",                          share: "0%"   },
  { component: "CUAV V6X Flight Controller",     origin: "Import → iDEX indigenisation",   share: "0%"   },
  { component: "NVIDIA Jetson Nano",             origin: "Import (strategic exception)",    share: "0%"   },
  { component: "FLIR Thermal Module",            origin: "Import → PIL listed",             share: "0%"   },
  { component: "6061 Aluminium Hardware",        origin: "100% Domestic",                   share: "100%" },
  { component: "PCB / Wiring Harness",           origin: "Domestic (Pilani contract mfg.)",   share: "100%" },
  { component: "LiPo Battery Pack",              origin: "Domestic assembly (cells imp.)",  share: "60%"  },
  { component: "Servo Actuators",                origin: "Domestic (Hyderabad)",            share: "100%" },
  { component: "Final Assembly / Testing",       origin: "India (Trishul Dynamics, Pilani)",  share: "100%" },
];

const ACQUISITION_PATHS = [
  {
    path:     "iDEX DISC",
    phase:    "2026-27 · Validation",
    timeline: "9-18 months",
    value:    "Up to ₹1.5 Cr",
    steps:    ["Submit DISC application to DIO", "Evaluation by iDEX evaluators & DRDO labs", "Grant-funded prototype demo", "BSF / Army observer trial"],
    color:    "amber",
    best:     true,
  },
  {
    path:     "ADITI / iDEX Prime",
    phase:    "2027-28 · Pilot",
    timeline: "18-30 months",
    value:    "Up to ₹25 Cr",
    steps:    ["ADITI round application", "Desert field trials", "First paid border pilot (5-10 units)", "Series A ready"],
    color:    "teal",
    best:     false,
  },
  {
    path:     "DRDO TDF / Make-II",
    phase:    "2028-30 · Scale",
    timeline: "24-36 months",
    value:    "Up to ₹50 Cr",
    steps:    ["DRDO Technology Development Fund grant", "MoD tender (PIL mandated domestic)", "Indian Army / paramilitary: 100+ units", "Mk-2 architecture & export roadmap"],
    color:    "violet",
    best:     false,
  },
];

function ComplianceCard({ item, isActive, onClick }) {
  const c = COLOR_MAP[item.color];
  return (
    <div
      className={`border cursor-pointer transition-all duration-300 ${
        isActive ? `border-amber-500/40 bg-[#0e0e1a]` : "border-slate-800 bg-[#09090f] hover:border-slate-700"
      }`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className={`text-xl ${c.split(" ")[0]}`}>{item.icon}</span>
            <div>
              <div className="text-sm font-bold text-white">{item.scheme}</div>
              <div className="font-mono text-[9px] text-slate-600 mt-0.5">{item.ref}</div>
            </div>
          </div>
          <span className={`flex-shrink-0 border px-2 py-0.5 text-[9px] font-mono tracking-widest ${
            STATUS_STYLE[item.status]
          }`}>
            {item.status}
          </span>
        </div>
        {isActive && (
          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3 mt-2">
            {item.detail}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProcurementSection() {
  const [activeCompliance, setActiveCompliance] = useState(0);
  const [activePath, setActivePath] = useState(0);

  return (
    <section id="procurement" className="relative py-28 bg-[#07070f] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 mb-3">
            // PROCUREMENT INTELLIGENCE · FOR ACQUISITION OFFICERS
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            PROCUREMENT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              READY
            </span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
            Every acquisition pathway mapped. Every compliance criterion pre-verified.
            Trishul Dynamics has engineered AEROS MK-1 from day one to meet MoD's procurement
            requirements - not as an afterthought.
          </p>
        </div>

        {/* ── Compliance matrix ── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-px h-5 bg-amber-500" />
            <h3 className="text-lg font-bold text-white tracking-wide">COMPLIANCE MATRIX</h3>
            <div className="flex-1 h-px bg-amber-500/10" />
            <span className="font-mono text-[9px] text-slate-600">CLICK TO EXPAND</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPLIANCE_ITEMS.map((item, i) => (
              <ComplianceCard
                key={i}
                item={item}
                isActive={activeCompliance === i}
                onClick={() => setActiveCompliance(activeCompliance === i ? -1 : i)}
              />
            ))}
          </div>
        </div>

        {/* ── Acquisition pathways ── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-px h-5 bg-amber-500" />
            <h3 className="text-lg font-bold text-white tracking-wide">ACQUISITION PATHWAYS</h3>
            <div className="flex-1 h-px bg-amber-500/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACQUISITION_PATHS.map((path, index) => {
              const colors = {
                amber:  { border: "border-amber-500/40", text: "text-amber-400",  bg: "bg-amber-500/5"  },
                teal:   { border: "border-teal-400/40",  text: "text-teal-300",   bg: "bg-teal-500/5"   },
                violet: { border: "border-violet-500/40",text: "text-violet-400", bg: "bg-violet-500/5" },
              }[path.color];

              const isActive = activePath === index;

              return (
                <div
                  key={path.path}
                  onClick={() => setActivePath(isActive ? -1 : index)}
                  className={`relative border cursor-pointer transition-all duration-300 ${
                    isActive ? `${colors.border} ${path.best ? colors.bg : "bg-[#0e0e1a]"}` : "border-slate-800 bg-[#09090f] hover:border-slate-700"
                  } p-6`}
                >
                  {path.best && (
                    <div className={`absolute -top-3 left-4 px-3 py-0.5 border ${isActive ? colors.border : "border-slate-800"} ${isActive ? colors.bg : "bg-[#09090f]"} ${isActive ? colors.text : "text-slate-500"} text-[9px] font-mono tracking-widest transition-colors duration-300`}>
                      ★ RECOMMENDED
                    </div>
                  )}
                  <div className={`font-mono text-[9px] tracking-widest mb-1 ${isActive ? colors.text : "text-slate-600"}`}>
                    {path.phase}
                  </div>
                  <h4 className={`text-base font-black mb-4 ${isActive ? "text-white" : "text-slate-400"}`}>{path.path}</h4>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                      <div className="font-mono text-[8px] text-slate-600 mb-0.5">TIMELINE</div>
                      <div className={`text-sm font-bold ${isActive ? colors.text : "text-slate-500"}`}>{path.timeline}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[8px] text-slate-600 mb-0.5">FUNDING</div>
                      <div className={`text-sm font-bold ${isActive ? colors.text : "text-slate-500"}`}>{path.value}</div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="space-y-1.5 border-t border-slate-800 pt-4 mt-2">
                      {path.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`font-mono text-[9px] mt-0.5 flex-shrink-0 ${colors.text}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[11px] text-slate-400">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Supply chain transparency ── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-px h-5 bg-amber-500" />
            <h3 className="text-lg font-bold text-white tracking-wide">SUPPLY CHAIN TRANSPARENCY</h3>
            <div className="flex-1 h-px bg-amber-500/10" />
            <span className="font-mono text-[9px] text-slate-600">DOMESTIC CONTENT DISCLOSURE</span>
          </div>
          <div className="border border-amber-500/10 bg-[#09090f] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 gap-px bg-amber-500/8">
              {["COMPONENT", "SUPPLY ORIGIN", "DOMESTIC %"].map((h) => (
                <div key={h} className="bg-[#0d0d1a] px-4 py-2.5 font-mono text-[9px] tracking-widest text-slate-600">
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            {SUPPLY_CHAIN.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 gap-px bg-amber-500/8 border-t border-amber-500/5 ${
                  i % 2 === 0 ? "bg-opacity-100" : ""
                }`}
              >
                <div className={`${i % 2 === 0 ? "bg-[#0a0a14]" : "bg-[#09090f]"} px-4 py-3 text-[11px] text-slate-300`}>
                  {row.component}
                </div>
                <div className={`${i % 2 === 0 ? "bg-[#0a0a14]" : "bg-[#09090f]"} px-4 py-3 text-[11px] text-slate-400 font-mono`}>
                  {row.origin}
                </div>
                <div className={`${i % 2 === 0 ? "bg-[#0a0a14]" : "bg-[#09090f]"} px-4 py-3`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800">
                      <div
                        className={`h-full transition-all ${
                          row.share === "100%" ? "bg-emerald-500" :
                          row.share === "0%"   ? "bg-red-800"     :
                                                 "bg-amber-500"
                        }`}
                        style={{ width: row.share }}
                      />
                    </div>
                    <span className={`font-mono text-[10px] ${
                      row.share === "100%" ? "text-emerald-400" :
                      row.share === "0%"   ? "text-red-400"     :
                                             "text-amber-400"
                    }`}>
                      {row.share}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-2">
            * Import substitution roadmap submitted with Technical Offer. Target: 65% domestic content by Batch-2 (18 months post-LOI).
          </p>
        </div>

        {/* ── Commercial terms callout ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label:   "UNIT PRICE (INDICATIVE)",
              value:   "₹ 15-30 Lakhs",
              sub:     "Pilot-batch pricing (5-10 units). Scale orders (100+): ₹25-50 L/unit.",
              color:   "amber",
            },
            {
              label:   "WARRANTY & AMC",
              value:   "24 Months",
              sub:     "On-site AMC available. 48-hour spare delivery SLA.",
              color:   "teal",
            },
            {
              label:   "LEAD TIME (PRODUCTION)",
              value:   "90-120 Days",
              sub:     "Post-LOI. First 3 units available from existing stock.",
              color:   "emerald",
            },
          ].map((card) => {
            const cs = {
              amber:   "border-amber-500/30 text-amber-400",
              teal:    "border-teal-400/30  text-teal-300",
              emerald: "border-emerald-500/30 text-emerald-400",
            }[card.color];
            return (
              <div key={card.label} className={`border ${cs} bg-[#09090f] p-6`}>
                <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-1">{card.label}</div>
                <div className={`text-2xl font-black mb-2 ${cs.split(" ")[1]}`}>{card.value}</div>
                <p className="text-xs text-slate-500">{card.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
