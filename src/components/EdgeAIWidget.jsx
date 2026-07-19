import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   EdgeAIWidget - Simulated live ISR sensor feed
   Modes: HD Video (with bounding boxes) · Thermal · LiDAR
   ───────────────────────────────────────────────────────────── */

/* ── Detections verified via percentage grid overlay on source images (1376×768) ── */
const MODE_DETECTIONS = {
  hd: [
    // Left Humvee on road curve
    { id: 1, label: "VEHICLE",   conf: 0.96, cls: "unknown", x: 43, y: 78, w: 7, h: 9 },
    // Right Humvee farther up
    { id: 2, label: "VEHICLE",   conf: 0.91, cls: "unknown", x: 50, y: 73, w: 6, h: 7 },
    // Person 1 walking on road near left vehicle
    { id: 3, label: "PERSONNEL", conf: 0.88, cls: "friendly",x: 39, y: 84, w: 1.5, h: 5 },
    // Person 2
    { id: 4, label: "PERSONNEL", conf: 0.85, cls: "friendly",x: 42, y: 83, w: 1.5, h: 5 },
  ],
  thermal: [
    // Humvee body
    { id: 5, label: "VEHICLE",   conf: 0.98, cls: "unknown", x: 49, y: 35, w: 16, h: 47 },
    // Middle person (between vehicle and taller person)
    { id: 8, label: "PERSONNEL", conf: 0.94, cls: "hostile", x: 66, y: 40, w: 5,  h: 42 },
    // Taller person
    { id: 6, label: "PERSONNEL", conf: 0.97, cls: "hostile", x: 73, y: 33, w: 7,  h: 49 },
    // Shorter rightmost person
    { id: 7, label: "PERSONNEL", conf: 0.92, cls: "hostile", x: 83, y: 36, w: 7,  h: 46 },
  ],
  lidar: []
};

const CLASS_COLOURS = {
  hostile:  "border-red-500   text-red-400   bg-red-500/10",
  unknown:  "border-amber-500 text-amber-400 bg-amber-500/10",
  friendly: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  poi:      "border-violet-500 text-violet-400 bg-violet-500/10",
};

/* Thermal colour mapping overlay (just the palette bar) */
function ThermalOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Thermal palette bar */}
      <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1">
        <span className="font-mono text-[7px] text-white/60">°C</span>
        <div
          className="w-3 h-24 rounded-sm"
          style={{ background: "linear-gradient(to bottom, #fff 0%, #ff5000 35%, #ff0 60%, #00f 100%)" }}
        />
        <div className="font-mono text-[7px] text-white/60 space-y-4 text-right">
          <div>45</div>
          <div>30</div>
          <div>15</div>
        </div>
      </div>
    </div>
  );
}

/* Detection bounding box */
function BoundingBox({ det, mode }) {
  if (mode === "lidar") return null;

  const colours =
    mode === "thermal"
      ? "border-orange-400 text-orange-300 bg-orange-500/10"
      : CLASS_COLOURS[det.cls];

  return (
    <div
      className={`absolute border ${colours} transition-all duration-300`}
      style={{
        left:   `${det.x}%`,
        top:    `${det.y}%`,
        width:  `${det.w}%`,
        height: `${det.h}%`,
      }}
    >
      {/* Label chip */}
      <div className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[8px] font-mono ${colours} whitespace-nowrap`}>
        {det.label} · {(det.conf * 100).toFixed(0)}%
      </div>
      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current" />
    </div>
  );
}

/* HUD scan crosshair at centre */
function CentreReticle({ mode }) {
  const c = mode === "thermal" ? "rgba(255,160,0,0.5)" : "rgba(45,212,191,0.5)";
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
      {/* crosshair */}
      <line x1="50" y1="40" x2="50" y2="46" stroke={c} strokeWidth="0.4" />
      <line x1="50" y1="54" x2="50" y2="60" stroke={c} strokeWidth="0.4" />
      <line x1="40" y1="50" x2="46" y2="50" stroke={c} strokeWidth="0.4" />
      <line x1="54" y1="50" x2="60" y2="50" stroke={c} strokeWidth="0.4" />
      <circle cx="50" cy="50" r="4" fill="none" stroke={c} strokeWidth="0.4" />
      {/* heading arc */}
      <path
        d="M 20 15 A 35 35 0 0 1 80 15"
        fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="0.4"
      />
      {/* azimuth tick marks */}
      {[-40,-20,0,20,40].map((deg, i) => (
        <g key={i} transform={`translate(${50 + deg}, 15)`}>
          <line x1="0" y1="0" x2="0" y2={i === 2 ? -3 : -1.5}
            stroke="rgba(245,158,11,0.4)" strokeWidth="0.3" />
          <text x="0" y={i === 2 ? -4 : -3} textAnchor="middle"
            fill="rgba(245,158,11,0.4)" fontSize="2.2" fontFamily="monospace">
            {(270 + (i - 2) * 10) % 360}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* Telemetry sidebar */
function TelemetrySidebar({ mode, tick }) {
  const currentDetections = MODE_DETECTIONS[mode] || [];
  const detCount = mode === "lidar" ? "N/A" : currentDetections.length;
  const fps      = mode === "lidar" ? "10" : "30";
  const latency  = (12 + (tick % 8)).toString();

  return (
    <div className="w-44 flex-shrink-0 bg-[#0a0a14] border-l border-amber-500/15 p-3 font-mono flex flex-col gap-4">
      {/* AI Engine */}
      <div>
        <div className="text-[8px] text-amber-500/60 tracking-widest mb-1.5">AI ENGINE</div>
        <div className="space-y-1">
          {[
            ["Platform", "Jetson Nano"],
            ["Model",    "YOLOv8-S"],
            ["FPS",      fps],
            ["Latency",  `${latency} ms`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[9px] text-slate-600">{k}</span>
              <span className="text-[9px] text-teal-300">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detections */}
      <div>
        <div className="text-[8px] text-amber-500/60 tracking-widest mb-1.5">DETECTIONS</div>
        <div className="text-2xl text-amber-400 font-black">{detCount}</div>
        <div className="text-[8px] text-slate-600">OBJECTS TRACKED</div>
        <div className="mt-2 space-y-1">
          {Object.entries(
            currentDetections.reduce(
              (acc, det) => {
                acc[det.cls] = (acc[det.cls] || 0) + 1;
                return acc;
              },
              { hostile: 0, unknown: 0, friendly: 0, poi: 0 }
            )
          ).map(([cls, n]) => (
            <div key={cls} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  cls === "hostile"  ? "bg-red-500"     :
                  cls === "unknown"  ? "bg-amber-500"   :
                  cls === "friendly" ? "bg-emerald-500" :
                                       "bg-violet-500"
                }`} />
                <span className="text-[8px] text-slate-500 uppercase">{cls}</span>
              </div>
              <span className="text-[9px] text-slate-300">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor health */}
      <div>
        <div className="text-[8px] text-amber-500/60 tracking-widest mb-1.5">SENSORS</div>
        <div className="space-y-1.5">
          {[
            { name: "THERMAL", ok: true  },
            { name: "LIDAR",   ok: true  },
            { name: "HD CAM",  ok: true  },
            { name: "GPS",     ok: tick % 20 > 2 },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-[8px] text-slate-500">{s.name}</span>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-emerald-400 animate-blink" : "bg-red-500"}`} />
                <span className={`text-[8px] ${s.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {s.ok ? "OK" : "WAIT"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence histogram */}
      <div>
        <div className="text-[8px] text-amber-500/60 tracking-widest mb-1.5">CONFIDENCE</div>
        <div className="flex items-end gap-0.5 h-12">
          {currentDetections.map((det, i) => (
            <div key={i} className="flex-1 bg-amber-500/20 relative group">
              <div
                className="absolute bottom-0 left-0 right-0 bg-amber-500/70 transition-all"
                style={{ height: `${det.conf * 100}%` }}
              />
            </div>
          ))}
          {/* Fill empty slots if less than 4 detections */}
          {Array.from({ length: Math.max(0, 4 - currentDetections.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 bg-amber-500/10 relative" />
          ))}
        </div>
        <div className="flex justify-between text-[7px] text-slate-600 mt-0.5">
          <span>P1</span><span>P2</span><span>P3</span><span>P4</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Main export ──────────────── */
export default function EdgeAIWidget() {
  const [mode, setMode] = useState("hd");   // "hd" | "thermal" | "lidar"
  const [tick, setTick] = useState(0);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [isLive]);

  const modeLabels = { hd: "HD VIDEO", thermal: "THERMAL IR", lidar: "LIDAR CLOUD" };
  const modeIcons  = { hd: "◉", thermal: "▣", lidar: "⬡" };

  return (
    <section id="edge-ai" className="relative py-28 bg-[#06060e] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-fine opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(45,212,191,0.03),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-teal-400/60 mb-3">
            // ON-BOARD EDGE INTELLIGENCE · NO CLOUD DEPENDENCY
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            EDGE AI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
              LIVE FEED
            </span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
            The AEROS MK-1 runs YOLOv8 object detection on an NVIDIA Jetson Nano - classifying
            threats, vehicles, and persons at 30 fps with sub-15 ms latency, entirely on-board.
            No network. No cloud. No vulnerability.
          </p>
        </div>

        {/* ── Feed widget ── */}
        <div className="max-w-5xl mx-auto">
          {/* Control bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            {/* Mode selector */}
            <div className="flex items-center gap-1 border border-amber-500/20 bg-[#0a0a14] p-1">
              {Object.entries(modeLabels).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setMode(k)}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-widest flex items-center gap-1.5 transition-colors duration-200 ${
                    mode === k
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/40"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span>{modeIcons[k]}</span> {label}
                </button>
              ))}
            </div>

            {/* Status chips */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLive((l) => !l)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] font-mono tracking-widest transition-colors ${
                  isLive
                    ? "border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10"
                    : "border-emerald-500/40 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-red-500 animate-blink" : "bg-emerald-500"}`} />
                {isLive ? "⏸ PAUSE" : "▶ RESUME"}
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
                <span className="text-[10px] font-mono text-emerald-400">EDGE · LIVE</span>
              </div>
            </div>
          </div>

          {/* Main viewport + sidebar */}
          <div className="flex border border-amber-500/20">
            {/* Viewport */}
            <div 
              className="flex-1 relative aspect-video bg-[#060812] overflow-hidden bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(/feed_${mode}.jpg)` }}
            >
              {/* Tint overlay for better HUD contrast */}
              <div className="absolute inset-0 bg-[#060812]/20" />

              {/* Thermal overlay */}
              {mode === "thermal" && <ThermalOverlay />}

              {/* Bounding boxes */}
              {(MODE_DETECTIONS[mode] || []).map((det) => (
                <BoundingBox key={det.id} det={det} mode={mode} />
              ))}

              {/* Centre reticle */}
              <CentreReticle mode={mode} />

              {/* Scan-line sweep */}
              {isLive && (
                <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent animate-scan" />
              )}

              {/* Scanline texture */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)"
                }}
              />

              {/* Top HUD bar */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-black/50 backdrop-blur-sm flex items-center justify-between px-3">
                <div className="flex items-center gap-3 font-mono text-[8px]">
                  <span className="text-amber-400">AEROS-MK1</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-teal-300">{modeLabels[mode]}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">ALT 312m · AZ 087°</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[8px]">
                  <span className="text-slate-500">
                    {new Date().toISOString().slice(11, 19)} UTC
                  </span>
                  {isLive && (
                    <span className="text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500 animate-blink" /> REC
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom HUD strip */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/50 backdrop-blur-sm flex items-center justify-between px-3">
                <span className="font-mono text-[8px] text-slate-500">
                  ELRS · {22 - (tick % 2)} KM · RSSI -{(tick % 10 + 70)}dBm
                </span>
                <span className="font-mono text-[8px] text-emerald-400">
                  EDGE INFERENCE · {12 + (tick % 8)} MS
                </span>
              </div>

              {/* Paused overlay */}
              {!isLive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="font-mono text-xs tracking-widest text-slate-400 border border-slate-700 px-4 py-2">
                    ⏸ FEED PAUSED
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <TelemetrySidebar mode={mode} tick={tick} />
          </div>

          {/* Bottom legend */}
          <div className="mt-3 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              {Object.entries({
                hostile:  ["red-500",     "HOSTILE"],
                unknown:  ["amber-500",   "UNKNOWN"],
                friendly: ["emerald-500", "FRIENDLY"],
                poi:      ["violet-500",  "POI"],
              }).map(([cls, [color, label]]) => (
                <div key={cls} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 border border-${color}`} />
                  <span className="font-mono text-[9px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
            <div className="font-mono text-[9px] text-slate-600">
              SIM · YOLOv8-S · JETSON NANO 4GB · INT8 QUANT
            </div>
          </div>
        </div>

        {/* ── Capability cards below ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-5xl mx-auto">
          {[
            {
              icon: "◉",
              title: "On-Board Detection",
              body:  "YOLOv8 runs fully on Jetson Nano. No uplink required for classification. Mission continues through full comms blackout.",
              color: "text-teal-300",
              border:"border-teal-500/20",
            },
            {
              icon: "▣",
              title: "Thermal Fusion",
              body:  "Uncooled LWIR thermal fused with HD via pixel-level registration. Personnel detection in zero-light, dense fog, and camouflaged terrain.",
              color: "text-amber-400",
              border:"border-amber-500/20",
            },
            {
              icon: "⬡",
              title: "LiDAR Point Cloud",
              body:  "3D terrain mapping in real-time. Obstacle avoidance during rover traverse. Exportable as PCD/PLY for battlefield digital twins.",
              color: "text-violet-400",
              border:"border-violet-500/20",
            },
          ].map((c) => (
            <div key={c.title} className={`border ${c.border} bg-[#0a0a14] p-6`}>
              <div className={`text-3xl mb-3 ${c.color}`}>{c.icon}</div>
              <div className="text-white font-bold mb-2">{c.title}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
