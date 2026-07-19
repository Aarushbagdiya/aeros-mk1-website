import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   SpecsSection — Tabbed technical specifications
   Tabs: Airframe · Propulsion · Comms · Sensors · AI & Software
   ───────────────────────────────────────────────────────────── */

const TABS = [
  {
    id:    "airframe",
    label: "AIRFRAME",
    icon:  "◈",
    color: "amber",
    specs: [
      { key: "Primary material",      val: "Unidirectional carbon-fibre tube & plate", highlight: true },
      { key: "Motor-to-motor span",    val: "560 mm (diagonal, flight config)" },
      { key: "Footprint (rover)",      val: "430 × 380 mm (wheel base)" },
      { key: "All-up weight (AUW)",    val: "≤ 2.8 kg (DGCA sub-3 kg class)", highlight: true },
      { key: "Payload capacity",       val: "Up to 600 g" },
      { key: "IP rating",              val: "IP54 — dust & splash resistant" },
      { key: "Operating temp",         val: "-10°C to +55°C" },
      { key: "Arm pivot mechanism",    val: "Dual servo, 20 kg·cm, aluminium yoke" },
      { key: "Arm swing angle",        val: "0° – 90° in 1.8 s", highlight: true },
    ],
  },
  {
    id:    "propulsion",
    label: "PROPULSION",
    icon:  "⟳",
    color: "teal",
    specs: [
      { key: "Motors",                 val: "T-Motor MN3510-700KV (×4)", highlight: true },
      { key: "ESCs",                   val: "Hobbywing XRotor 40A BLHeli32" },
      { key: "Propellers (flight)",    val: "12×4.5\" CF bi-blade, foldable" },
      { key: "Static thrust / motor",  val: "1.6 kg @ 100% throttle", highlight: true },
      { key: "Total thrust",           val: "6.4 kg (2.3× AUW ratio)" },
      { key: "Battery",                val: "6S 5000 mAh LiPo (22.2 V nominal)" },
      { key: "Flight endurance",        val: "~40 min (high-density pack, ISR hover)", highlight: true },
      { key: "Drive motors (rover)",   val: "370-type brushed DC, 250 RPM@6V" },
      { key: "Ground endurance",       val: "6+ hours (silent surveillance)", highlight: true },
      { key: "Ground speed (max)",     val: "3.2 km/h" },
      { key: "Wheel diameter",         val: "100 mm rubber, all-terrain tread" },
    ],
  },
  {
    id:    "comms",
    label: "COMMS / RF",
    icon:  "◎",
    color: "violet",
    specs: [
      { key: "RC / Telemetry link",    val: "ExpressLRS (ELRS) 2.4 GHz", highlight: true },
      { key: "Control range",          val: "15–22 km LOS (high-gain patch)", highlight: true },
      { key: "Telemetry protocol",     val: "MAVLink 2.0 over CRSF/UART" },
      { key: "Video downlink",         val: "H.265 / 1080p @ 30 fps" },
      { key: "Video range",            val: "Up to 10 km (LOS, 5.8 GHz)" },
      { key: "Encryption",             val: "AES-128 on control channel" },
      { key: "Frequency agility",      val: "Hopping across 80 channels" },
      { key: "Latency (RC loop)",      val: "< 5 ms",                      highlight: true },
      { key: "GCS compatibility",      val: "Mission Planner, QGroundControl" },
      { key: "Failsafe modes",         val: "RTH / Hold / Land (configurable)" },
      { key: "COMSEC readiness",       val: "External crypto module slot" },
    ],
  },
  {
    id:    "sensors",
    label: "SENSORS",
    icon:  "◉",
    color: "emerald",
    specs: [
      { key: "Thermal camera",         val: "FLIR Lepton 3.5 — 160×120 LWIR", highlight: true },
      { key: "Thermal NETD",           val: "< 50 mK" },
      { key: "HD camera",              val: "Sony IMX477 — 12.3 MP, 1/2.3\"" },
      { key: "HD FOV",                 val: "83° (wide) / 35° (tele, 2× optical)" },
      { key: "LiDAR unit",             val: "TFMini-S (ToF) — 12 m range", highlight: true },
      { key: "LiDAR refresh rate",     val: "100 Hz" },
      { key: "Flight controller",      val: "CUAV V6X (dual IMU)",           highlight: true },
      { key: "IMU",                    val: "ICM-42688-P + ICM-20649 (redundant)" },
      { key: "Barometer",             val: "MS5611 — ±10 cm resolution" },
      { key: "Magnetometer",           val: "RM3100" },
      { key: "GNSS",                   val: "u-blox M10 (GPS + GLONASS + Galileo)" },
    ],
  },
  {
    id:    "ai",
    label: "AI & SW",
    icon:  "⬡",
    color: "rose",
    specs: [
      { key: "Edge AI platform",       val: "NVIDIA Jetson Nano 4GB",        highlight: true },
      { key: "AI framework",           val: "TensorRT 8.x + CUDA 10.2" },
      { key: "Detection model",        val: "YOLOv8-Small (INT8 quantised)", highlight: true },
      { key: "Inference speed",        val: "30 FPS @ 1920×1080 input" },
      { key: "Inference latency",      val: "< 15 ms per frame",             highlight: true },
      { key: "Tracked classes",        val: "Personnel, Vehicles, Structures, Animals" },
      { key: "Flight firmware",        val: "ArduPilot / PX4 (dual-boot)" },
      { key: "Ground station",         val: "Mission Planner + custom TD GCS" },
      { key: "Autonomy modes",         val: "Waypoint, Loiter, Follow-Me, Auto-Morph" },
      { key: "Companion OS",           val: "Ubuntu 20.04 LTS (Jetson L4T)" },
      { key: "Data recording",         val: "256 GB NVMe (encrypted at rest)" },
    ],
  },
];

const COLOR_MAP = {
  amber:   { tab: "border-amber-500/60 text-amber-400 bg-amber-500/8", dot: "bg-amber-400",   hl: "text-amber-300" },
  teal:    { tab: "border-teal-400/60  text-teal-300  bg-teal-500/8",  dot: "bg-teal-400",    hl: "text-teal-200"  },
  violet:  { tab: "border-violet-500/60 text-violet-400 bg-violet-500/8", dot: "bg-violet-400", hl: "text-violet-300" },
  emerald: { tab: "border-emerald-500/60 text-emerald-400 bg-emerald-500/8", dot: "bg-emerald-400", hl: "text-emerald-300" },
  rose:    { tab: "border-rose-500/60 text-rose-400 bg-rose-500/8", dot: "bg-rose-400", hl: "text-rose-300" },
};

export default function SpecsSection() {
  const [activeTab, setActiveTab] = useState("airframe");

  const tab  = TABS.find((t) => t.id === activeTab);
  const cols = COLOR_MAP[tab.color];

  return (
    <section id="specs" className="relative py-28 bg-[#07070f] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-70 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 mb-3">
            // TECHNICAL DATASHEET · AEROS MK-1
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              FULL{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                SPECIFICATIONS
              </span>
            </h2>
            {/* Classification badge */}
            <div className="border border-slate-700 bg-[#0a0a14] px-4 py-2 font-mono text-[9px] text-slate-500 tracking-widest flex-shrink-0">
              DOCUMENT CLASS: RESTRICTED · TRISHUL DYNAMICS INTERNAL
            </div>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-amber-500/10 pb-0">
          {TABS.map((t) => {
            const c = COLOR_MAP[t.color];
            const isActive = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-mono tracking-widest border-b-2 -mb-px transition-all duration-200 ${
                  isActive
                    ? `${c.tab} border-b-current`
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Specs table ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-amber-500/8">
          {tab.specs.map((spec, i) => (
            <div
              key={i}
              className={`flex items-start justify-between px-5 py-3.5 gap-4 ${
                spec.highlight
                  ? "bg-[#0e0e1a]"
                  : "bg-[#09090f]"
              }`}
            >
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {spec.highlight && (
                  <div className={`w-1 h-4 ${cols.dot} opacity-80 flex-shrink-0`} />
                )}
                {!spec.highlight && <div className="w-1 h-4 flex-shrink-0" />}
                <span className="font-mono text-[11px] text-slate-400">{spec.key}</span>
              </div>
              <span
                className={`font-mono text-[11px] text-right ${
                  spec.highlight ? cols.hl : "text-slate-200"
                }`}
              >
                {spec.val}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom stat strip ── */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-amber-500/8">
          {[
            { label: "AUW",           value: "≤ 2.8 kg",  sub: "DGCA Sub-3 Class" },
            { label: "Link Range",    value: "22 KM",     sub: "ELRS High-Gain"   },
            { label: "AI Latency",    value: "< 15 ms",   sub: "On-Board Edge"    },
            { label: "Endurance",     value: "6+ HRS",    sub: "Ground Rover Mode"},
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a14] px-6 py-5 text-center">
              <div className="font-mono text-[9px] text-slate-600 tracking-widest mb-1">{s.label}</div>
              <div className="text-2xl font-black text-amber-400">{s.value}</div>
              <div className="font-mono text-[9px] text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
