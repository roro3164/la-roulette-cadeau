"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getConfettiOriginAboveButton,
  launchPrizeConfetti,
} from "@/lib/celebration-confetti";
import {
  playWheelStopChime,
  playWheelTick,
  resumeAudioContext,
} from "@/lib/wheel-audio";
import { NEXT_VISIT_PRIZE_NOTE, WHEEL_SEGMENTS } from "@/lib/wheel-segments";
import { WHEEL_POINTER_DEG_FROM_TOP } from "@/lib/wheel-geometry";
import { WheelDisc } from "./WheelDisc";
import { WheelRim } from "./WheelRim";

const SLICE = 360 / WHEEL_SEGMENTS.length;

/** Aligne la case gagnante sous le repère angle des parts (voir flèche sur la jante). */
function computeNextRotation(
  currentDeg: number,
  winningIndex: number,
  minFullSpins: number,
): number {
  const centerDeg = winningIndex * SLICE + SLICE / 2;
  const pos = (centerDeg + currentDeg) % 360;
  const normalized = pos < 0 ? pos + 360 : pos;
  const tgt = WHEEL_POINTER_DEG_FROM_TOP;
  let delta = ((tgt - normalized) % 360 + 360) % 360;
  if (delta === 0) delta = 360;
  return currentDeg + delta + 360 * minFullSpins;
}

type WheelProps = {
  onSpinComplete?: (winningIndex: number) => void;
  /** Masque confettis + overlay de gain (étapes suivantes : avis, e-mail). */
  suppressWinPresentation?: boolean;
  /** Masque le bouton « Jouer » (formulaire e-mail, toast, etc.). */
  suppressSpinButton?: boolean;
  onContinueAfterWin?: () => void;
};

export function Wheel({
  onSpinComplete,
  suppressWinPresentation = false,
  suppressSpinButton = false,
  onContinueAfterWin,
}: WheelProps) {
  const rotation = useMotionValue(0);
  /** Mobile : bouton hors du transform bande HeyPulse → portail sur document.body */
  const [narrowForSpinPortal, setNarrowForSpinPortal] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const go = () => setNarrowForSpinPortal(mq.matches);
    go();
    mq.addEventListener("change", go);
    return () => mq.removeEventListener("change", go);
  }, []);

  const spinLockRef = useRef(false);
  const wheelBoxRef = useRef<HTMLDivElement>(null);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const spin = useCallback(async () => {
    if (spinLockRef.current) return;
    spinLockRef.current = true;
    setSpinning(true);
    setError(null);
    setLastWin(null);

    let winningIndex: number;
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        credentials: "include",
      });
      let dataJson: {
        winningIndex?: unknown;
        error?: string;
      } = {};
      try {
        dataJson = (await res.json()) as {
          winningIndex?: unknown;
          error?: string;
        };
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(
          typeof dataJson.error === "string" && dataJson.error.length > 0
            ? dataJson.error
            : "La roue ne répond pas. Réessayez.",
        );
        spinLockRef.current = false;
        setSpinning(false);
        return;
      }
      if (
        typeof dataJson.winningIndex !== "number" ||
        dataJson.winningIndex < 0 ||
        dataJson.winningIndex >= WHEEL_SEGMENTS.length
      ) {
        throw new Error("Données invalides");
      }
      winningIndex = dataJson.winningIndex;
    } catch {
      setError("La roue ne répond pas. Réessayez.");
      spinLockRef.current = false;
      setSpinning(false);
      return;
    }

    const from = rotation.get();
    const to = computeNextRotation(from, winningIndex, 4);

    resumeAudioContext();

    const bucketAt = (deg: number) => {
      const a =
        ((WHEEL_POINTER_DEG_FROM_TOP - deg) % 360 + 360) % 360;
      return Math.floor(a / SLICE);
    };
    let lastBucket = bucketAt(from);
    let rafId = 0;

    const tickLoop = () => {
      const b = bucketAt(rotation.get());
      if (b !== lastBucket) {
        lastBucket = b;
        playWheelTick(0.085);
      }
      rafId = requestAnimationFrame(tickLoop);
    };
    rafId = requestAnimationFrame(tickLoop);

    try {
      await animate(rotation, to, {
        type: "tween",
        duration: 3.2,
        ease: [0.2, 0.85, 0.15, 1],
      });
    } finally {
      cancelAnimationFrame(rafId);
    }

    playWheelStopChime();

    setLastWin(winningIndex);
    onSpinComplete?.(winningIndex);
    spinLockRef.current = false;
    setSpinning(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const origin =
          getConfettiOriginAboveButton(spinButtonRef.current, 18) ?? undefined;
        launchPrizeConfetti(origin);
      });
    });
  }, [onSpinComplete, rotation]);



  /** z-index vignette ~2000, texte gain ~10000, confettis ~10600 (voir celebration-confetti.ts). */
  const winPresentationPortal =
    typeof document !== "undefined" &&
    lastWin !== null &&
    !spinning &&
    !suppressWinPresentation
      ? createPortal(
          <>
            <motion.div
              className="pointer-events-none fixed inset-0"
              style={{ zIndex: 2000 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1] }}
              aria-hidden
            >
              <div
                className="h-full w-full"
                style={{
                  background:
                    "radial-gradient(ellipse 120vmin 115vmin at 50% 42%, rgba(15,23,42,0.78) 0%, rgba(3,7,18,0.9) 52%, rgba(2,6,15,0.96) 100%)",
                }}
              />
            </motion.div>
            <div
              className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              aria-live="polite"
            >
              <motion.div
                className="m-0 flex max-w-[min(24rem,90vw)] flex-col items-center gap-3 text-center sm:gap-4"
                initial={{ scale: 0.88, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 22,
                  mass: 0.75,
                }}
              >
                <motion.span
                  className="relative z-[1] block h-44 w-44 shrink-0 rounded-3xl ring-2 ring-white/20 ring-offset-2 ring-offset-transparent sm:h-52 sm:w-52 md:h-56 md:w-56"
                  aria-hidden
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.06 }}
                  style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
                >
                  <motion.span
                    className="block h-full w-full overflow-hidden rounded-3xl"
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.6,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <image
                        href={WHEEL_SEGMENTS[lastWin].src}
                        width={200}
                        height={200}
                        x={0}
                        y={0}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </svg>
                  </motion.span>
                </motion.span>
                <span
                  className="block text-lg font-extrabold leading-tight tracking-tight text-white [text-shadow:0_2px_0_rgba(0,0,0,0.45),0_0_28px_rgba(0,0,0,0.5)] sm:text-xl min-[500px]:text-2xl"
                  lang="fr"
                >
                  Vous avez gagné
                </span>
                <motion.span
                  className="inline-block max-w-[min(90vw,22rem)] px-1 text-3xl font-extrabold leading-tight text-white [text-shadow:0_3px_0_rgba(0,0,0,0.5),0_0_32px_rgba(0,0,0,0.45)] sm:text-4xl min-[500px]:text-5xl"
                  animate={{
                    y: [0, -2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    ease: "easeInOut",
                  }}
                >
                  {WHEEL_SEGMENTS[lastWin].label}
                </motion.span>
                <p className="mx-auto max-w-[min(90vw,22rem)] px-2 text-[11px] font-medium leading-snug text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                  {NEXT_VISIT_PRIZE_NOTE}
                </p>
              </motion.div>
            </div>
          </>,
          document.body,
        )
      : null;

  const showWinActions =
    lastWin !== null &&
    !spinning &&
    !suppressWinPresentation &&
    onContinueAfterWin != null;

  const spinCluster = (
    <>
      <motion.button
        ref={spinButtonRef}
        type="button"
        onClick={spin}
        disabled={spinning}
        animate={
          spinning
            ? { y: 0, scale: 1, rotate: 0 }
            : {
                y: [0, -16, 5, -16, 0],
                scale: [1, 1.09, 1.04, 1.08, 1],
                rotate: [0, -1.8, 2, -1.2, 0],
              }
        }
        transition={
          spinning
            ? { duration: 0.2 }
            : { repeat: Infinity, duration: 1.35, ease: "easeInOut" }
        }
        className="min-h-[4.375rem] w-full max-w-[min(calc(100vw-env(safe-area-inset-right)-env(safe-area-inset-left)-1rem),22rem)] shrink-0 rounded-[1.25rem] border-2 border-orange-950/85 bg-white px-5 py-4 text-center align-middle text-[clamp(13px,3vw,15px)] font-black uppercase leading-none whitespace-nowrap tracking-[0.065em] text-orange-950 shadow-[0_15px_0_0_rgba(194,65,12,0.78),0_22px_44px_-10px_rgba(234,88,12,0.35)] outline-none transition [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] active:translate-y-[6px] active:shadow-[0_9px_0_0_rgba(194,65,12,0.65)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none max-sm:w-full sm:mx-auto sm:min-h-[4.375rem] sm:w-full sm:max-w-[22rem] sm:px-10 sm:py-4 sm:text-[15px] sm:pb-[calc(env(safe-area-inset-bottom,0px)+2px)]"
      >
        {spinning ? "Ça tourne…" : "Jouer la partie"}
      </motion.button>
      {error ? (
        <p
          className="max-sm:self-end max-sm:text-right rounded-xl border border-orange-200/90 bg-orange-50/95 px-2.5 py-1.5 text-center text-[12px] font-semibold leading-snug text-amber-950 sm:self-auto sm:text-center"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </>
  );

  const spinPortal =
    typeof document !== "undefined" &&
    narrowForSpinPortal &&
    !suppressSpinButton ? (
      createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 left-auto right-0 z-[60] flex justify-end">
          <div className="pointer-events-auto mb-[max(0.75rem,env(safe-area-inset-bottom,0px))] mr-[max(0.35rem,env(safe-area-inset-right))] ml-2 mt-0 flex w-auto max-w-[min(calc(100vw-env(safe-area-inset-right)-env(safe-area-inset-left)-0.75rem),22rem)] -translate-x-8 -translate-y-[min(5rem,18dvh)] flex-col items-end gap-2">
            {spinCluster}
          </div>
        </div>,
        document.body,
      )
    ) : null;

  return (
    <div
      suppressHydrationWarning
      className={
        suppressSpinButton
          ? "mx-auto mt-6 w-full pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] md:pb-12"
          : "mx-auto mt-6 w-full pb-[max(7rem,calc(env(safe-area-inset-bottom)+5.75rem))] max-sm:pb-[max(10.5rem,calc(env(safe-area-inset-bottom)+8.25rem))] md:pb-16"
      }
    >
      {/* Mobile HeyPulse · bande pleine largeur centrée comme avant */}
      <div className="max-sm:relative max-sm:left-1/2 max-sm:w-screen max-sm:-translate-x-1/2 max-sm:overflow-x-clip max-sm:overflow-y-visible sm:left-auto sm:w-full sm:translate-x-0 sm:overflow-visible sm:px-4 md:mx-auto md:max-w-[44rem] md:pb-24">
        <div className="relative max-sm:flex max-sm:min-h-[min(96vw,82dvh)] max-sm:flex-col max-sm:items-stretch max-sm:pr-0 sm:grid sm:min-h-0 sm:grid-cols-[minmax(0,1fr),minmax(13rem,20rem)] sm:items-stretch sm:gap-x-4 sm:gap-y-11 sm:max-w-2xl sm:px-2 md:max-w-[44rem]">
          {/* Zone roue */}
          <div className="max-sm:pointer-events-none max-sm:absolute max-sm:inset-x-0 max-sm:top-[52%] max-sm:z-[1] max-sm:-translate-y-1/2 max-sm:overflow-visible sm:relative sm:inset-auto sm:top-auto sm:translate-y-0 sm:z-auto sm:flex sm:pointer-events-auto sm:justify-self-start sm:justify-start sm:py-10">
            <div
              ref={wheelBoxRef}
              className="relative isolate aspect-square shrink-0 drop-shadow-[0_20px_48px_-10px_rgba(194,65,12,0.45)] max-sm:absolute max-sm:left-0 max-sm:top-1/2 max-sm:z-0 max-sm:w-[min(166vw,50rem)] max-sm:-translate-x-[43%] max-sm:-translate-y-1/2 sm:relative sm:left-auto sm:top-auto sm:z-auto sm:translate-x-0 sm:translate-y-0 sm:w-[27.25rem] md:w-[29.75rem]"
            >
              <div className="absolute inset-0 z-1 flex items-center justify-center p-0">
                <motion.div
                  className="h-full w-full origin-center will-change-transform backface-hidden transform-[translateZ(0)] drop-shadow-[0_6px_24px_rgba(234,88,12,0.38)]"
                  style={{ rotate: rotation, transformOrigin: "50% 50%" }}
                >
                  <WheelDisc segments={WHEEL_SEGMENTS} />
                </motion.div>
              </div>
              <WheelRim spinning={spinning} />
            </div>
          </div>

          {!narrowForSpinPortal && !suppressSpinButton ? (
            <div className="relative z-[6] mx-auto flex w-full max-w-[22rem] flex-col gap-2 sm:relative sm:h-full sm:min-h-0 sm:w-full sm:flex-col sm:justify-end sm:self-stretch sm:gap-3 sm:px-0 sm:pb-2 sm:pt-2 md:mx-auto sm:-translate-x-7 sm:-translate-y-[min(2.75rem,10vh)]">
              {spinCluster}
            </div>
          ) : null}
        </div>
      </div>

      {spinPortal}

      {winPresentationPortal}

      {showWinActions
        ? createPortal(
            <div
              className="fixed inset-x-0 bottom-0 z-[11000] flex justify-center bg-gradient-to-r from-[#facc15] to-[#f97316] px-4 pt-[0.9375rem] pb-[max(1rem,calc(env(safe-area-inset-bottom)+12px))] shadow-[0_-14px_40px_-4px_rgba(194,65,12,0.35)]"
            >
              <button
                type="button"
                onClick={() => onContinueAfterWin?.()}
                className="min-h-[2.9375rem] w-full max-w-md rounded-xl border-[3px] border-orange-950/85 bg-white px-6 py-[0.75rem] text-center text-[0.688rem] font-black uppercase tracking-[0.08em] text-orange-950 shadow-[0_8px_0_0_rgba(194,65,12,0.78)] transition active:translate-y-1 active:bg-amber-50"
              >
                Recevoir mon bon par e-mail
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
