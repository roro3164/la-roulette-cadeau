"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import {
  RIM_CENTER_R,
  RIM_IN,
  RIM_OUT,
  RIM_STROKE,
  WHEEL_CX as CX,
  WHEEL_CY as CY,
  WHEEL_VIEW_BOX,
} from "@/lib/wheel-geometry";

const INK = "#9a3412";
const LIGHTS = 16;
const BULB_R = 3.15;

type Pt = { x: number; y: number };
function atRing(r: number, degFromTop: number): Pt {
  const t = (degFromTop * Math.PI) / 180;
  return { x: CX + r * Math.sin(t), y: CY - r * Math.cos(t) };
}

/** Silhouette goutte (pointeur) ; remplissage plat + contours type BD. */
const PTR_PATH =
  "M 0 0.4 C -1.4 0.1 -9.6 0.1 -12 1.1 C -15.2 1.3 -16 3 -16 5.2 C -16 9.6 -12 20 -6.8 30 L -1.05 45 L 0 53.2 L 1.05 45 L 6.8 30 C 12 20 16 9.6 16 5.2 C 16 3 15.2 1.3 12 1.1 C 9.6 0.1 1.4 0.1 0 0.4 Z";

export function WheelRim({ spinning = false }: { spinning?: boolean }) {
  const id = useId().replace(/:/g, "");
  const p = (s: string) => `rim-${id}-${s}`;

  return (
    <svg
      viewBox={WHEEL_VIEW_BOX}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={p("ptrGradient")}
          x1="-12"
          y1="4"
          x2="12"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id={p("rimInk")} x="-6%" y="-6%" width="112%" height="112%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="a" />
          <feOffset dy="0.7" result="b" />
          <feFlood floodColor="#9a3412" floodOpacity="0.22" result="c" />
          <feComposite in="c" in2="b" operator="in" result="d" />
          <feMerge>
            <feMergeNode in="d" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${p("rimInk")})`}>
        <circle
          cx={CX}
          cy={CY}
          r={RIM_CENTER_R}
          fill="none"
          stroke={INK}
          strokeWidth={RIM_STROKE + 2.2}
        />
        <circle
          cx={CX}
          cy={CY}
          r={RIM_CENTER_R}
          fill="none"
          stroke="#ededed"
          strokeWidth={RIM_STROKE - 0.45}
        />
      </g>
      <circle
        cx={CX}
        cy={CY}
        r={RIM_CENTER_R}
        fill="none"
        stroke={INK}
        strokeWidth="1.35"
      />

      {Array.from({ length: LIGHTS }, (_, k) => {
        const a = (k * 360) / LIGHTS;
        const c = atRing((RIM_IN + RIM_OUT) / 2, a);
        return (
          <g key={k} transform={`translate(${c.x},${c.y})`}>
            <circle r={BULB_R + 0.85} fill="none" stroke={INK} strokeWidth="1.1" />
            <circle
              r={BULB_R}
              fill="#fffbeb"
              stroke={INK}
              strokeWidth="0.55"
            />
            <circle r={BULB_R * 0.38} cx={BULB_R * 0.15} cy={BULB_R * -0.2} fill="#ffffff" opacity={0.85} />
          </g>
        );
      })}

      {/* Flèche à droite, pointée vers le centre (repère ancien midi + rotate(+90°) → vers la gauche) */}
      <g transform={`translate(${CX + RIM_OUT + 1.25}, ${CY}) rotate(90)`}>
        <motion.g
          style={{ transformOrigin: "0px 6px", transformBox: "fill-box" }}
          animate={{
            rotate: spinning ? [-8, 6, -6, 7, -5, 5, -7, 5] : 0,
          }}
          transition={{
            rotate: spinning
              ? { repeat: Infinity, duration: 0.38, ease: [0.4, 0, 0.2, 1] }
              : { type: "spring", stiffness: 420, damping: 26 },
          }}
        >
          <g transform="scale(1.12) translate(0,-0.5)">
            {/* Ombre plate type décalque */}
            <path
              d={PTR_PATH}
              fill="#c2410c"
              opacity={0.28}
              transform="translate(0.9, 1.8)"
            />
            <path
              d={PTR_PATH}
              fill={`url(#${p("ptrGradient")})`}
              stroke={INK}
              strokeWidth="1.1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0.85" r="2.3" fill="#fffbeb" stroke={INK} strokeWidth="1" />
          </g>
        </motion.g>
      </g>
    </svg>
  );
}
