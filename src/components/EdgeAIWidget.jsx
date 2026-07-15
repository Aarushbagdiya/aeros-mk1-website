import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   EdgeAIWidget — Simulated live ISR sensor feed
   Modes: HD Video (with bounding boxes) · Thermal · LiDAR
   ───────────────────────────────────────────────────────────── */

/* ── Detection objects that drift across the viewport ── */
const INITIAL_DETECTIONS = [
  { id: 1, label: "PERSONNEL",  conf: 0.97, cls: "hostile", x: 15, y: 25, w: 12, h: 22, vx: 0.04,  vy: 0.01,  color: "#ef4444" },
  { id: 2, label: "VEHICLE",    conf: 0.91, cls: "unknown", x: 55, y: 50, w: 22, h: 14, vx: -0.03, vy: 0.02,  color: "#f59e0b" },
  { id: 3, label: "PERSONNEL",  conf: 0.88, cls: "friendly",x: 75, y: 30, w: 10, h: 20, vx: 0.02,  vy: -0.01, color: "#10b981" },
  { id: 4, label: "STRUCTURE",  conf: 0.99, cls: "poi",     x: 35, y: 60, w: 30, h: 18, vx: 0,     vy: 0,     color: "#8b5cf6" },
];

const CLASS_COLOURS = {
  hostile:  "border-red-500   text-red-400   bg-red-500/10",
  unknown:  "border-amber-500 text-amber-400 bg-amber-500/10",
  friendly: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  poi:      "border-violet-500 text-violet-400 bg-violet-500/10",
};

/* Tiny LiDAR point-cloud dots */
function PointCloud() {
  const points = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 2 + 0.5,
      o: Math.random() * 0.8 + 0.2,
      d: (Math.random() * 8 + 1).toFixed(1), // depth in metres
    }))
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {points.current.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r * 0.3}
          fill={`hsl(${180 + p.d * 10}, 80%, 65%)`}
          opacity={p.o}
          className="animate-pc-flicker"
          style={{ animationDelay: `${i * 0.03}s` }}
        />
      ))}
      {/* depth gradient rings from centre */}
      {[20, 35, 50].map((r, i) => (
        <circle key={i} cx="50" cy="50" r={r}
          fill="none" stroke="rgba(45,212,191,0.08)" strokeWidth="0.3" />
      ))}
    </svg>
  );
}

/* Thermal colour mapping overlay */
function ThermalOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* "heat blobs" */}
      {[
        { left: "15%", top: "25%",  w: 60,  h: 80,  color: "rgba(255,80,0,0.4)"  },
        { left: "55%", top: "50%",  w: 90,  h: 55,  color: "rgba(255,160,0,0.3)" },
        { left: "74%", top: "30%",  w: 50,  h: 75,  color: "rgba(255,80,0,0.35)" },
      ].map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-xl animate-bb-drift"
          style={{
            left: blob.left,
            top:  blob.top,
            width:  blob.w,
            height: blob.h,
            background: blob.color,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
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
      className={`absolute border ${colours} transition-all duration-300 animate-bb-drift`}
      style={{
        left:   `${det.x}%`,
        top:    `${det.y}%`,
        width:  `${det.w}%`,
        height: `${det.h}%`,
        animationDelay: `${det.id * 0.8}s`,
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
  const detCount = mode === "lidar" ? "N/A" : INITIAL_DETECTIONS.length;
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
          {Object.entries({ hostile: 1, unknown: 1, friendly: 1, poi: 1 }).map(([cls, n]) => (
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
          {[0.97, 0.91, 0.88, 0.99].map((c, i) => (
            <div key={i} className="flex-1 bg-amber-500/20 relative">
              <div
                className="absolute bottom-0 left-0 right-0 bg-amber-500/70"
                style={{ height: `${c * 100}%` }}
              />
            </div>
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
            The Aeros MK-1 runs YOLOv8 object detection on an NVIDIA Jetson Nano — classifying
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
            <div className="flex-1 relative aspect-video bg-[#060812] overflow-hidden">
              {/* Fake scene background */}
              <div
                className={`absolute inset-0 transition-all duration-700 ${
                  mode === "thermal"
                    ? "bg-gradient-to-br from-[#1a0a00] via-[#0d0800] to-[#000510]"
                    : mode === "lidar"
                    ? "bg-[#020510]"
                    : "bg-gradient-to-br from-[#0d1117] via-[#0a0f14] to-[#06090e]"
                }`}
              />

              {/* Terrain / scene texture lines (simulated) */}
              {mode === "hd" && (
                <div className="absolute inset-0">
                  {/* Horizon line */}
                  <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-slate-700/30" />
                  {/* Ground texture */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#080c06]/80 to-transparent" />
                  {/* Sky gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#050810]/60 to-transparent" />
                </div>
              )}

              {/* LiDAR point cloud */}
              {mode === "lidar" && <PointCloud />}

              {/* Thermal overlay */}
              {mode === "thermal" && <ThermalOverlay />}

              {/* Bounding boxes */}
              {INITIAL_DETECTIONS.map((det) => (
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
