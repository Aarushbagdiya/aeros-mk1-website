import { useState, useEffect, useRef } from "react";
import MorphCanvas3D from "./MorphCanvas3D.jsx";

/* ═══════════════════════════════════════════════════════════════
   MorphSection - Physically-accurate 90° arm-swing animation
   ═══════════════════════════════════════════════════════════════
   Mechanical model
   ─────────────────
   • X-frame quadcopter: 4 arms in plan at ±45° from body centre
   • Each arm PIVOTS at the SHOULDER JOINT (body edge) around the
     arm's own lateral axis
   • Swing: HORIZONTAL (0°) → POINTING DOWN (90°)
   • Motor hub at arm tip becomes the wheel / ground-contact point
   • Body lifts as arm-legs push it above ground datum

   View rendered: FRONT ELEVATION
   Front-left (FL) + front-right (FR) arms drawn solid/bright.
   Rear-left (RL) + rear-right (RR) drawn behind at 45% opacity
   to convey depth without a full 3D engine.
   ════════════════════════════════════════════════════════════════ */

/* ── Geometry constants (viewBox units ≈ mm at 1:1) ── */
const VB_W     = 520;
const VB_H     = 400;
const CX       = 260;   // body centre X (never moves)
const BODY_W   = 118;   // fuselage width
const BODY_H   = 52;    // fuselage depth (front elevation)
const ARM_LEN  = 116;   // shoulder-to-motor distance
const MOTOR_R  = 13;    // motor hub radius
const WHEEL_R  = 17;    // wheel radius
const PROP_SPAN= 36;    // half-span of one prop blade
const GROUND_Y = 360;   // ground datum Y in viewBox

/* ─────────────────────────────────────────────────────────────
   geometry(p) - compute every derived position from progress p
   ─────────────────────────────────────────────────────────────
   Key insight:
   Left arm pivot is at (CX - BODY_W/2, bodyCY).
   In FLIGHT the arm extends LEFT:  tip = pivot + (-ARM_LEN, 0)
   In ROVER  the arm hangs DOWN:    tip = pivot + (0, +ARM_LEN)
   General:  tip = pivot + ARM_LEN × (−cosθ, +sinθ)
   Right arm is the mirror: tip = pivot + ARM_LEN × (+cosθ, +sinθ)
   ───────────────────────────────────────────────────────────── */
function geometry(p) {
  const θ   = p * 90;                      // degrees: 0 → 90
  const rad = (θ * Math.PI) / 180;

  /* Body rises as arm-legs extend and contact the ground.
     Correct physics: shoulder pivot is at bodyCY, arm hangs down ARM_LEN.
     For tip to touch GROUND_Y:  bodyCY + ARM_LEN = GROUND_Y
     → ROVER_CY = GROUND_Y − ARM_LEN                              */
  const FLIGHT_CY = 168;
  const ROVER_CY  = GROUND_Y - ARM_LEN;  // = 244; body bottom at 270, 90 mm clearance
  const bodyCY    = FLIGHT_CY + (ROVER_CY - FLIGHT_CY) * p;

  /* Shoulder pivot points */
  const lPx = CX - BODY_W / 2;
  const rPx = CX + BODY_W / 2;
  const lPivot = { x: lPx, y: bodyCY };
  const rPivot = { x: rPx, y: bodyCY };

  /* Arm tips (trigonometric - no SVG transform required) */
  const lTip = { x: lPx - ARM_LEN * Math.cos(rad), y: bodyCY + ARM_LEN * Math.sin(rad) };
  const rTip = { x: rPx + ARM_LEN * Math.cos(rad), y: bodyCY + ARM_LEN * Math.sin(rad) };

  /* Prop blade direction
     • In flight (θ=0): arm points left/right → prop perpendicular → points UP (−y)
     • As arm rotates down, prop folds toward the arm axis
     propFold blends between "perpendicular to arm" and "along arm" */
  const propFold = (Math.PI / 2) * (1 - p);   // 90° open → 0° folded

  /* Left arm unit vector */
  const lAx = -Math.cos(rad), lAy = Math.sin(rad);
  /* Perpendicular (rotated 90° CCW) = left arm's "up" direction */
  const lPerpX = -lAy, lPerpY = lAx;
  /* Blend: propFold=π/2 → perpendicular, propFold=0 → along arm */
  const lPropDir = {
    x: lPerpX * Math.cos(propFold) + lAx * Math.sin(propFold),
    y: lPerpY * Math.cos(propFold) + lAy * Math.sin(propFold),
  };

  /* Right arm */
  const rAx = Math.cos(rad), rAy = Math.sin(rad);
  const rPerpX = -rAy, rPerpY = rAx;
  const rPropDir = {
    x: rPerpX * Math.cos(propFold) + rAx * Math.sin(propFold),
    y: rPerpY * Math.cos(propFold) + rAy * Math.sin(propFold),
  };

  const groundClearance = Math.max(0, GROUND_Y - (bodyCY + BODY_H / 2));

  return { θ, rad, bodyCY, lPivot, rPivot, lTip, rTip, lPropDir, rPropDir, groundClearance };
}

/* ── Arm + motor + prop + wheel assembly ── */
function ArmAssembly({ pivot, tip, propDir, isFront, propOp, wheelOp, active }) {
  const baseOp   = isFront ? 1 : 0.42;
  const armColor = isFront ? "rgba(245,158,11,0.88)" : "rgba(245,158,11,0.32)";
  const armW     = isFront ? 3 : 2;
  const hubColor = isFront ? "rgba(245,158,11,0.72)" : "rgba(245,158,11,0.28)";
  const whlColor = isFront ? "rgba(45,212,191,0.88)"  : "rgba(45,212,191,0.38)";

  const p1 = { x: tip.x + propDir.x * PROP_SPAN, y: tip.y + propDir.y * PROP_SPAN };
  const p2 = { x: tip.x - propDir.x * PROP_SPAN, y: tip.y - propDir.y * PROP_SPAN };

  return (
    <g opacity={baseOp}>
      {/* Arm tube - inner glow stripe */}
      <line x1={pivot.x} y1={pivot.y} x2={tip.x} y2={tip.y}
        stroke={isFront ? "rgba(245,158,11,0.18)" : "none"} strokeWidth={armW + 4} strokeLinecap="round" />
      {/* Arm tube - main */}
      <line x1={pivot.x} y1={pivot.y} x2={tip.x} y2={tip.y}
        stroke={armColor} strokeWidth={armW} strokeLinecap="round" />

      {/* Shoulder joint ring */}
      <circle cx={pivot.x} cy={pivot.y} r={5.5}
        fill="#111120" stroke={hubColor} strokeWidth="1.5" />
      <circle cx={pivot.x} cy={pivot.y} r={2} fill="rgba(245,158,11,0.25)" />

      {/* Servo-active sweep ring */}
      {active && isFront && (
        <circle cx={pivot.x} cy={pivot.y} r={10}
          fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="0.8"
          strokeDasharray="4 3"
          style={{ transformOrigin: `${pivot.x}px ${pivot.y}px`, animation: "morph-spin 1.2s linear infinite" }} />
      )}

      {/* Motor hub */}
      <circle cx={tip.x} cy={tip.y} r={MOTOR_R}
        fill="#0d0d1c" stroke={hubColor} strokeWidth="1.5" />
      <circle cx={tip.x} cy={tip.y} r={4.5} fill="rgba(245,158,11,0.18)" />

      {/* Propeller blades */}
      <g opacity={propOp}>
        <line x1={tip.x} y1={tip.y} x2={p1.x} y2={p1.y}
          stroke="rgba(245,158,11,0.62)" strokeWidth="3" strokeLinecap="round" />
        <line x1={tip.x} y1={tip.y} x2={p2.x} y2={p2.y}
          stroke="rgba(245,158,11,0.62)" strokeWidth="3" strokeLinecap="round" />
        {/* Prop disc halo (flight only) */}
        {propOp > 0.45 && (
          <ellipse cx={tip.x} cy={tip.y}
            rx={PROP_SPAN * propOp} ry={PROP_SPAN * propOp * 0.14}
            fill="rgba(245,158,11,0.05)"
            transform={`rotate(${Math.atan2(propDir.y, propDir.x) * (180 / Math.PI)}, ${tip.x}, ${tip.y})`}
          />
        )}
      </g>

      {/* Wheel */}
      <g opacity={wheelOp}>
        {/* Tyre */}
        <circle cx={tip.x} cy={tip.y} r={WHEEL_R}
          fill="none" stroke={whlColor} strokeWidth={isFront ? 2.2 : 1.4} />
        {/* Hub */}
        <circle cx={tip.x} cy={tip.y} r={5} fill="rgba(45,212,191,0.08)" />
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((d) => {
          const r2 = (d * Math.PI) / 180;
          return (
            <line key={d}
              x1={tip.x + 5 * Math.cos(r2)}   y1={tip.y + 5 * Math.sin(r2)}
              x2={tip.x + (WHEEL_R - 2) * Math.cos(r2)} y2={tip.y + (WHEEL_R - 2) * Math.sin(r2)}
              stroke={isFront ? "rgba(45,212,191,0.45)" : "rgba(45,212,191,0.2)"}
              strokeWidth="1" strokeLinecap="round" />
          );
        })}
        {/* Ground contact flat (tyre squish) */}
        {wheelOp > 0.8 && (
          <line x1={tip.x - WHEEL_R + 3} y1={tip.y + WHEEL_R}
                x2={tip.x + WHEEL_R - 3} y2={tip.y + WHEEL_R}
            stroke={whlColor} strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
}

/* ── Fuselage body ── */
function Fuselage({ bodyCY, p }) {
  const bx = CX - BODY_W / 2;
  const by = bodyCY - BODY_H / 2;
  const ledColor = p < 0.5 ? "#f59e0b" : "#10b981";
  const modeStr  = p < 0.12 ? "FLT" : p < 0.88 ? "TRN" : "GND";

  return (
    <g>
      {/* Body glow */}
      <rect x={bx - 4} y={by - 4} width={BODY_W + 8} height={BODY_H + 8} rx={10}
        fill="rgba(245,158,11,0.03)" />
      {/* Main fuselage */}
      <rect x={bx} y={by} width={BODY_W} height={BODY_H} rx={6}
        fill="#0e0e1c" stroke="rgba(245,158,11,0.82)" strokeWidth="1.5" />
      {/* Top accent bar */}
      <rect x={bx + 8} y={by} width={BODY_W - 16} height={3} rx={1}
        fill="rgba(245,158,11,0.28)" />
      {/* Internal partition lines */}
      <line x1={bx + 8} y1={bodyCY - 8} x2={bx + BODY_W - 8} y2={bodyCY - 8}
        stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
      <line x1={bx + 8} y1={bodyCY + 8} x2={bx + BODY_W - 8} y2={bodyCY + 8}
        stroke="rgba(245,158,11,0.12)" strokeWidth="1" />

      {/* CUAV V6X label */}
      <text x={CX} y={bodyCY + 4} textAnchor="middle"
        fill="rgba(245,158,11,0.32)" fontSize="7" fontFamily="monospace">CUAV V6X</text>

      {/* Jetson label */}
      <text x={bx + BODY_W - 6} y={by + 14} textAnchor="end"
        fill="rgba(118,185,0,0.45)" fontSize="6" fontFamily="monospace">JETSON</text>

      {/* Status LED + mode */}
      <circle cx={bx + 10} cy={by + 10} r={3} fill={ledColor}>
        <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" repeatCount="indefinite" />
      </circle>
      <text x={bx + 16} y={by + 14} fill="rgba(245,158,11,0.42)" fontSize="6" fontFamily="monospace">
        {modeStr}
      </text>

      {/* Camera gimbal dome */}
      <ellipse cx={CX} cy={by + BODY_H + 1} rx={17} ry={10}
        fill="#080812" stroke="rgba(45,212,191,0.65)" strokeWidth="1.2" />
      <circle cx={CX} cy={by + BODY_H + 3} r={5.5}
        fill="rgba(45,212,191,0.1)" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
      <circle cx={CX + 2} cy={by + BODY_H + 1} r={2} fill="rgba(45,212,191,0.55)" />
    </g>
  );
}

/* ── Ground datum ── */
function Ground({ p }) {
  const op = Math.min(1, Math.max(0, (p - 0.18) * 3.5));
  if (op === 0) return null;
  return (
    <g opacity={op}>
      <line x1={22} y1={GROUND_Y} x2={VB_W - 22} y2={GROUND_Y}
        stroke="rgba(245,158,11,0.28)" strokeWidth="1" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i}
          x1={30 + i * 30} y1={GROUND_Y}
          x2={18 + i * 30} y2={GROUND_Y + 7}
          stroke="rgba(245,158,11,0.11)" strokeWidth="0.8" />
      ))}
      <text x={30} y={GROUND_Y + 16}
        fill="rgba(245,158,11,0.28)" fontSize="7" fontFamily="monospace">
        GROUND DATUM
      </text>
    </g>
  );
}

/* ── Measurement annotations ── */
function Annotations({ geo, p }) {
  const { θ, bodyCY, lPivot, lTip, rTip, groundClearance } = geo;

  /* Arm angle arc on the left shoulder */
  const arcR = 30;
  const arcSX = lPivot.x - arcR;           // start: points left
  const arcSY = lPivot.y;
  const arcEx = lPivot.x - arcR * Math.cos((θ * Math.PI) / 180);
  const arcEy = lPivot.y + arcR * Math.sin((θ * Math.PI) / 180);

  return (
    <g fontFamily="monospace" fontSize="8">
      {/* Arm angle arc */}
      {p > 0.02 && (
        <>
          <path
            d={`M ${arcSX} ${arcSY} A ${arcR} ${arcR} 0 ${θ > 180 ? 1 : 0} 1 ${arcEx} ${arcEy}`}
            fill="none" stroke="rgba(245,158,11,0.48)" strokeWidth="1" strokeDasharray="3 2"
          />
          <text
            x={lPivot.x - 52}
            y={lPivot.y + (θ / 90) * 22 + 4}
            fill="rgba(245,158,11,0.75)"
          >
            {Math.round(θ)}°
          </text>
        </>
      )}

      {/* Motor-to-motor span (flight only) */}
      {p < 0.12 && (
        <g opacity={Math.max(0, 1 - p * 8)}>
          <line x1={lTip.x} y1={lTip.y + 26} x2={rTip.x} y2={rTip.y + 26}
            stroke="rgba(245,158,11,0.28)" strokeWidth="1" strokeDasharray="3 2" />
          <line x1={lTip.x} y1={lTip.y + 18} x2={lTip.x} y2={lTip.y + 34}
            stroke="rgba(245,158,11,0.28)" strokeWidth="1" />
          <line x1={rTip.x} y1={rTip.y + 18} x2={rTip.x} y2={rTip.y + 34}
            stroke="rgba(245,158,11,0.28)" strokeWidth="1" />
          <text x={CX} y={lTip.y + 44} textAnchor="middle" fill="rgba(245,158,11,0.38)">
            560 mm MOTOR-TO-MOTOR
          </text>
        </g>
      )}

      {/* Ground clearance (rover phase) */}
      {p > 0.78 && (
        <g opacity={Math.min(1, (p - 0.78) * 4.5)}>
          <line x1={CX + 74} y1={bodyCY + 26} x2={CX + 74} y2={GROUND_Y}
            stroke="rgba(45,212,191,0.5)" strokeWidth="1" strokeDasharray="3 2" />
          <line x1={CX + 68} y1={bodyCY + 26} x2={CX + 80} y2={bodyCY + 26}
            stroke="rgba(45,212,191,0.4)" strokeWidth="1" />
          <line x1={CX + 68} y1={GROUND_Y} x2={CX + 80} y2={GROUND_Y}
            stroke="rgba(45,212,191,0.4)" strokeWidth="1" />
          <text x={CX + 84} y={(bodyCY + 26 + GROUND_Y) / 2 + 3}
            fill="rgba(45,212,191,0.62)">
            ~{Math.round(groundClearance * 0.82)} mm
          </text>
          <text x={CX + 84} y={(bodyCY + 26 + GROUND_Y) / 2 + 14}
            fill="rgba(45,212,191,0.38)" fontSize="7">
            CLEARANCE
          </text>
        </g>
      )}

      {/* Servo torque readout (transition) */}
      {p > 0.06 && p < 0.94 && (
        <text x={CX} y={VB_H - 10} textAnchor="middle"
          fill="rgba(245,158,11,0.5)">
          ▶ SERVO - {Math.round(θ * 0.22 + 1)} kg·cm · TORQUE ACTIVE
        </text>
      )}
    </g>
  );
}

/* ── Plan-view mini-inset (top-left) ── */
function PlanInset({ p }) {
  const θRad = (p * 90 * Math.PI) / 180;
  const R    = 30;   // arm radius in inset
  const cx   = 62, cy = 62;
  // 4 arms in plan at 45°/135°/225°/315°
  // horizontal projection shrinks by cos(θ) as arm folds down
  const arms = [45, 135, 225, 315].map((baseDeg) => {
    const bRad = (baseDeg * Math.PI) / 180;
    const proj = R * Math.cos(θRad);
    return { x: cx + proj * Math.cos(bRad), y: cy + proj * Math.sin(bRad) };
  });

  return (
    <g transform="translate(10, 10)">
      <rect x={0} y={0} width={124} height={124} rx={2}
        fill="#060610" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
      <text x={62} y={10} textAnchor="middle"
        fill="rgba(245,158,11,0.38)" fontSize="6" fontFamily="monospace">PLAN VIEW</text>

      {/* Body */}
      <rect x={50} y={50} width={24} height={24} rx={2}
        fill="#0e0e1c" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />

      {/* 4 arms */}
      {arms.map((tip, i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y}
            stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y}
            r={Math.max(1.5, 5 * Math.cos(θRad))}
            fill="#0e0e1c" stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
          {p > 0.28 && (
            <circle cx={tip.x} cy={tip.y}
              r={Math.max(0, 7 * Math.sin(θRad))}
              fill="none" stroke="rgba(45,212,191,0.5)" strokeWidth="1" />
          )}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={3} fill="rgba(45,212,191,0.4)" />
      <text x={cx} y={20} textAnchor="middle"
        fill="rgba(245,158,11,0.28)" fontSize="6" fontFamily="monospace">N</text>
    </g>
  );
}

/* ── Full SVG canvas ── */
function MorphCanvas({ p }) {
  const geo = geometry(p);
  const { lPivot, rPivot, lTip, rTip, lPropDir, rPropDir, bodyCY } = geo;

  const propOp  = Math.max(0, 1 - p * 2.5);
  const wheelOp = Math.min(1, Math.max(0, (p - 0.32) * 2.8));
  const active  = p > 0.04 && p < 0.96;

  /* Rear arm positions (slight depth offset - same angle) */
  const rearOfsX = 14, rearOfsY = 8;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ overflow: "visible" }}>

      <style>{`
        @keyframes morph-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Micro-grid background */}
      <defs>
        <pattern id="mg" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0L0 0 0 20" fill="none" stroke="rgba(245,158,11,0.035)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width={VB_W} height={VB_H} fill="url(#mg)" />

      {/* ── REAR arms (drawn first = behind) ── */}
      <ArmAssembly
        pivot={{ x: lPivot.x + rearOfsX, y: lPivot.y + rearOfsY }}
        tip={{ x: lTip.x + rearOfsX, y: lTip.y + rearOfsY }}
        propDir={lPropDir} isFront={false}
        propOp={propOp} wheelOp={wheelOp} active={active}
      />
      <ArmAssembly
        pivot={{ x: rPivot.x - rearOfsX, y: rPivot.y + rearOfsY }}
        tip={{ x: rTip.x - rearOfsX, y: rTip.y + rearOfsY }}
        propDir={rPropDir} isFront={false}
        propOp={propOp} wheelOp={wheelOp} active={active}
      />

      {/* Ground (between layers) */}
      <Ground p={p} />

      {/* ── FRONT arms ── */}
      <ArmAssembly
        pivot={lPivot} tip={lTip}
        propDir={lPropDir} isFront={true}
        propOp={propOp} wheelOp={wheelOp} active={active}
      />
      <ArmAssembly
        pivot={rPivot} tip={rTip}
        propDir={rPropDir} isFront={true}
        propOp={propOp} wheelOp={wheelOp} active={active}
      />

      {/* Fuselage (on top of everything) */}
      <Fuselage bodyCY={bodyCY} p={p} />

      {/* Annotations */}
      <Annotations geo={geo} p={p} />

      {/* Plan inset */}
      <PlanInset p={p} />

      {/* Corner brackets */}
      {[
        `M 8 22 L 8 8 L 22 8`,
        `M ${VB_W-22} 8 L ${VB_W-8} 8 L ${VB_W-8} 22`,
        `M 8 ${VB_H-22} L 8 ${VB_H-8} L 22 ${VB_H-8}`,
        `M ${VB_W-22} ${VB_H-8} L ${VB_W-8} ${VB_H-8} L ${VB_W-8} ${VB_H-22}`,
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(245,158,11,0.32)" strokeWidth="1.5" />
      ))}

      {/* Mode + angle readout (top-right) */}
      <text x={VB_W - 10} y={22} textAnchor="end"
        fill="rgba(245,158,11,0.52)" fontSize="8" fontFamily="monospace">
        {p < 0.08 ? "// FLIGHT MODE - ARMS HORIZONTAL"
          : p < 0.92 ? "// TRANSITION - SERVOS ACTIVE"
          : "// ROVER MODE - ARMS LOCKED 90°"}
      </text>
      <text x={VB_W - 10} y={35} textAnchor="end"
        fill="rgba(45,212,191,0.62)" fontSize="9" fontFamily="monospace">
        ARM: {String(Math.round(geo.θ)).padStart(2,"0")}° / 90°
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════
   Step descriptor cards
   ══════════════════════════════════════════ */
const STEPS = [
  {
    id: 0, range: [0, 0.3],
    phase: "01 · FLIGHT MODE",
    title: "Airborne ISR",
    accent: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/5",
    grad: "from-amber-500/60",
    body: "Arms locked at 0° horizontal. Four T-Motor brushless motors produce 6.4 kg total thrust (2.3× AUW ratio). ExpressLRS link active at 22 km. Full sensor suite streaming in real-time.",
  },
  {
    id: 1, range: [0.3, 0.7],
    phase: "02 · KINEMATIC TRANSITION",
    title: "90° Servo Arm Swing",
    accent: "text-teal-300", border: "border-teal-400/40", bg: "bg-teal-500/5",
    grad: "from-teal-400/60",
    body: "MAVLink CMD triggers four shoulder servos simultaneously. Each arm pivots on its lateral axis - tip sweeping from horizontal to vertically downward in 1.8 s. Props auto-fold to ≤11 cm. Body rises as arm-legs extend.",
  },
  {
    id: 2, range: [0.7, 1],
    phase: "03 · ROVER MODE",
    title: "Silent Ground Rover",
    accent: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/5",
    grad: "from-emerald-400/60",
    body: "Arms detent-locked at 90°. Motor hubs touch ground - wheels engage. Body elevated ~95 mm on arm-legs. 6+ hour silent ISR stakeout on brushed drive motors. Zero acoustic signature. Relaunch on any command.",
  },
];

/* ══════════════════════════════════════════
   Main export
   ══════════════════════════════════════════ */
export default function MorphSection() {
  const [p, setP]             = useState(0);
  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(false);
  const sectionRef            = useRef(null);
  const rafRef                = useRef(null);

  /* Scroll-driven progress */
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect  = sectionRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const prog  = Math.min(1, Math.max(0, -rect.top / (total * 0.72)));
      setP(prog);
      setStep(STEPS.findIndex((s) => prog <= s.range[1]) ?? 2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Manual play */
  const play = () => {
    if (playing) return;
    setP(0); setPlaying(true);
    let prog = 0;
    const tick = () => {
      prog = Math.min(1, prog + 0.005);
      setP(prog);
      setStep(STEPS.findIndex((s) => prog <= s.range[1]) ?? 2);
      if (prog < 1) rafRef.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div ref={sectionRef} className="relative h-[320vh]" id="morph">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-[#07070f]">
        <div className="absolute inset-0 bg-grid-fine opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_50%,rgba(245,158,11,0.025),transparent)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-10 py-4">

          {/* Header */}
          <div className="text-center mb-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/55 mb-1.5">
              // CORE INNOVATION · PATENTED KINEMATIC MECHANISM
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              THE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-teal-300">
                MORPH
              </span>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-7">

            {/* ── Canvas ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-2.5">
              {/* 3D WebGL Canvas */}
              <div
                className="relative border border-amber-500/15 bg-[#060610] overflow-hidden"
                style={{ aspectRatio: "16/10" }}
              >
                <MorphCanvas3D progress={p} />
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none z-10"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)" }} />
                {/* Mode + angle readout overlay */}
                <div className="absolute top-3 right-4 z-10 text-right font-mono">
                  <div className="text-[9px] tracking-widest text-amber-500/50">
                    {p < 0.08 ? "// FLIGHT MODE - ARMS HORIZONTAL"
                      : p < 0.92 ? "// TRANSITION - SERVOS ACTIVE"
                      : "// ROVER MODE - ARMS LOCKED 90°"}
                  </div>
                  <div className="text-[11px] text-teal-300/70 mt-0.5">
                    ARM: {String(Math.round(p * 90)).padStart(2,"0")}° / 90°
                  </div>
                </div>
                {/* Mode indicator bottom-left */}
                <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    p < 0.12 ? "bg-amber-400" : p < 0.88 ? "bg-amber-400 animate-blink" : "bg-emerald-400"
                  }`} />
                  <span className="text-[9px] tracking-widest text-slate-500">
                    {p < 0.12 ? "FLT" : p < 0.88 ? "TRN" : "GND"} · AEROS MK-1 · 3D RENDER
                  </span>
                </div>
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={play} disabled={playing}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-amber-500/40 text-amber-400 text-[10px] font-mono tracking-[0.15em] hover:bg-amber-500/8 transition-colors disabled:opacity-40"
                >
                  {playing
                    ? <><span className="animate-spin inline-block mr-1">⟳</span>MORPHING</>
                    : <>▶ PLAY</>}
                </button>

                {/* Progress bar */}
                <div className="flex-1">
                  <div className="flex justify-between font-mono text-[8px] text-slate-700 mb-1">
                    <span>0° FLIGHT</span><span>45° MID</span><span>90° ROVER</span>
                  </div>
                  <div className="relative h-[2px] bg-slate-800/80">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-teal-400"
                      style={{ width: `${p * 100}%`, transition: "none" }}
                    />
                    {[0, 0.3, 0.5, 0.7, 1].map((m) => (
                      <div key={m}
                        className="absolute top-1/2 w-[5px] h-[5px] rounded-full bg-slate-700 border border-slate-600 -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:bg-amber-500 transition-colors"
                        style={{ left: `${m * 100}%` }}
                        onClick={() => { setP(m); setStep(STEPS.findIndex((s) => m <= s.range[1]) ?? 2); }}
                      />
                    ))}
                  </div>
                </div>

                {/* Live angle chip */}
                <div className="flex-shrink-0 border border-teal-500/30 bg-teal-500/5 px-3 py-1.5 font-mono text-[11px] text-teal-300 w-[72px] text-center tabular-nums">
                  {Math.round(p * 90)}° / 90°
                </div>
              </div>

              <p className="font-mono text-[8px] text-slate-700 text-center tracking-widest">
                ↕ SCROLL TO DRIVE · OR CLICK PROGRESS BAR · OR PRESS PLAY
              </p>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-shrink-0 w-full lg:w-[268px] xl:w-[296px] flex flex-col gap-2.5">
              {/* Step cards */}
              {STEPS.map((s) => {
                const active = step === s.id;
                return (
                  <div key={s.id}
                    onClick={() => { const mid = (s.range[0] + s.range[1]) / 2; setP(mid); setStep(s.id); }}
                    className={`border p-4 cursor-pointer transition-all duration-300 ${
                      active
                        ? `${s.border} ${s.bg}`
                        : "border-slate-800/40 opacity-40 hover:opacity-65"
                    }`}
                  >
                    <div className={`font-mono text-[9px] tracking-widest mb-0.5 ${s.accent}`}>
                      {s.phase}
                    </div>
                    <div className="text-white text-[13px] font-bold mb-0">{s.title}</div>
                    {active && (
                      <>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1.5">{s.body}</p>
                        <div className={`mt-2.5 h-px bg-gradient-to-r ${s.grad} to-transparent`} />
                      </>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
