"use client";


import { motion } from "framer-motion";
import type { WheelSegment } from "@/lib/wheel-segments";
import {
  DISC_HUB_R,
  DISC_R,
  DISC_TEXT_R,
  WHEEL_CX as CX,
  WHEEL_CY as CY,
  WHEEL_VIEW_BOX,
} from "@/lib/wheel-geometry";

type Props = {
  segments: readonly WheelSegment[];
};

function edge(cx: number, cy: number, r: number, degFromTop: number) {
  const t = (degFromTop * Math.PI) / 180;
  return { x: cx + r * Math.sin(t), y: cy - r * Math.cos(t) };
}

function wedgePath(i: number, n: number, r: number) {
  const step = 360 / n;
  const a0 = i * step;
  const a1 = (i + 1) * step;
  const p0 = edge(CX, CY, r, a0);
  const p1 = edge(CX, CY, r, a1);
  return `M ${CX} ${CY} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`;
}

function labelAt(i: number, n: number) {
  const step = 360 / n;
  const mid = i * step + step / 2;
  return { ...edge(CX, CY, DISC_TEXT_R, mid), a: mid };
}

/** Jaune / orange uniquement — pas de noir dans les cases. */
const CASE_ORANGE = "#f97316";
const CASE_YELLOW = "#facc15";
/** Encre brun chaud pour contours (style dessin, sans noir). */
const INK = "#9a3412";

/** Même jeu qu’entre les rayons centraux : liséré brun + bande crème (#fffbeb). */
const RADIAL_STROKE_INK = 14;
const RADIAL_STROKE_WHITE = 12.5;

/** Grande couronne périmétrique : crème ~moitié de l’ancienne épaisseur ; chemin calé pour coller à l’extérieur (bord ext. brun = DISC_R). */
const OUTER_RING_INK = 6;
const OUTER_RING_WHITE = 5.125;

function wedgeFill(i: number): string {
  return i % 2 === 0 ? CASE_YELLOW : CASE_ORANGE;
}

export function WheelDisc({ segments }: Props) {
  const n = segments.length;
  /** Bord extérieur du liséré brun tangent à l’arc des parts (DISC_R). */
  const outerRingR = DISC_R - OUTER_RING_INK / 2;

  return (
    <svg
      viewBox={WHEEL_VIEW_BOX}
      className="h-full w-full overflow-visible"
      shapeRendering="geometricPrecision"
      role="img"
      aria-label={`Roue à ${segments.length} cases`}
    >
      <g>
        {segments.map((_, i) => (
          <path
            key={i}
            d={wedgePath(i, n, DISC_R)}
            fill={wedgeFill(i)}
            stroke="none"
          />
        ))}

        {Array.from({ length: n }, (_, i) => {
          const step = 360 / n;
          const a = i * step;
          const pIn = edge(CX, CY, DISC_HUB_R + 0.5, a);
          const pOut = edge(CX, CY, DISC_R, a);
          return (
            <g key={i} className="pointer-events-none">
              <line
                x1={pIn.x}
                y1={pIn.y}
                x2={pOut.x}
                y2={pOut.y}
                stroke={INK}
                strokeWidth={RADIAL_STROKE_INK}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={pIn.x}
                y1={pIn.y}
                x2={pOut.x}
                y2={pOut.y}
                stroke="#fffbeb"
                strokeWidth={RADIAL_STROKE_WHITE}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={outerRingR}
          fill="none"
          stroke={INK}
          strokeWidth={OUTER_RING_INK}
          className="pointer-events-none"
        />
        <circle
          cx={CX}
          cy={CY}
          r={outerRingR}
          fill="none"
          stroke="#fffbeb"
          strokeWidth={OUTER_RING_WHITE}
          className="pointer-events-none"
        />
      </g>

      {segments.map((seg, i) => {
        const { x, y, a } = labelAt(i, n);
        const art = 58;
        return (
          <g
            key={`l${i}`}
            className="pointer-events-none select-none"
            transform={`translate(${x},${y}) rotate(${a})`}
          >
            <title>{seg.label}</title>
            <motion.g
              animate={{
                rotate: [0, 3.5, -2.8, 0],
                scale: [1, 1.08, 0.96, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.85 + i * 0.07,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            >
              <svg
                x={-art / 2}
                y={-art / 2}
                width={art}
                height={art}
                viewBox="0 0 200 200"
                aria-hidden
              >
                <image
                  href={seg.src}
                  width={200}
                  height={200}
                  x={0}
                  y={0}
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </motion.g>
          </g>
        );
      })}

      <g>
        <circle
          cx={CX}
          cy={CY}
          r={DISC_HUB_R + 0.35}
          fill="none"
          stroke={INK}
          strokeWidth="4.65"
        />
        <circle
          cx={CX}
          cy={CY}
          r={DISC_HUB_R}
          fill="#fffbeb"
          stroke="#fbbf24"
          strokeWidth="3.85"
        />
        <text
          x={CX}
          y={CY}
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#ea580c"
          stroke="#9a3412"
          strokeWidth={0.45}
          fontSize={DISC_HUB_R * 0.68}
          fontWeight={900}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          className="pointer-events-none select-none"
          style={{ letterSpacing: "-0.05em", paintOrder: "stroke fill" }}
        >
          R
        </text>
      </g>
    </svg>
  );
}
