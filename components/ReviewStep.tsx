"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  googleReviewUrl,
  reviewSkipEnabled,
  reviewStepCountdownEnabled,
  rouletteUnlockSeconds,
} from "@/lib/config";
import { BistrotLogo } from "@/components/BistrotLogo";
import { GoogleStarsRow } from "@/components/GoogleStarsRow";

type Props = {
  onDone: () => void;
};

export function ReviewStep({ onDone }: Props) {
  const openedGoogleRef = useRef(false);
  const advancedRef = useRef(false);
  const unlockingFlight = useRef(false);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const runUnlockPhase = useCallback(async () => {
    if (advancedRef.current || unlockingFlight.current) return;
    unlockingFlight.current = true;
    setUnlockError(null);

    try {
      const res = await fetch("/api/play/unlock", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setUnlockError("Impossible de continuer. Actualisez la page et réessayez.");
        setSecondsLeft(null);
        return;
      }
      advancedRef.current = true;
      setSecondsLeft(null);
      onDone();
    } catch {
      setUnlockError("Connexion interrompue. Réessayez depuis cette page.");
      setSecondsLeft(null);
    } finally {
      unlockingFlight.current = false;
    }
  }, [onDone]);

  const startUnlockCountdown = useCallback(() => {
    if (advancedRef.current) return;
    if (secondsLeft !== null) return;

    setUnlockError(null);

    if (!reviewStepCountdownEnabled || rouletteUnlockSeconds <= 0) {
      void runUnlockPhase();
      return;
    }

    setSecondsLeft(rouletteUnlockSeconds);
  }, [secondsLeft, runUnlockPhase]);

  /** Tick jusqu’à 0. */
  useEffect(() => {
    if (!reviewStepCountdownEnabled) return;
    if (secondsLeft === null || secondsLeft <= 0) return;

    const t = window.setTimeout(() => {
      setSecondsLeft((s) => {
        if (typeof s !== "number" || s <= 1) return 0;
        return s - 1;
      });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  /** Seconde 0 → cookie serveur + passage roue */
  useEffect(() => {
    if (!reviewStepCountdownEnabled) return;
    if (secondsLeft !== 0) return;
    void runUnlockPhase();
  }, [secondsLeft, runUnlockPhase]);

  useEffect(() => {
    const maybeStartCountdown = () => {
      if (!openedGoogleRef.current) return;
      if (advancedRef.current) return;
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      )
        return;
      startUnlockCountdown();
    };
    window.addEventListener("focus", maybeStartCountdown);
    document.addEventListener("visibilitychange", maybeStartCountdown);
    /** Retour depuis Google en arrière-plan (Safari / WebView cache). */
    window.addEventListener("pageshow", maybeStartCountdown);
    return () => {
      window.removeEventListener("focus", maybeStartCountdown);
      document.removeEventListener("visibilitychange", maybeStartCountdown);
      window.removeEventListener("pageshow", maybeStartCountdown);
    };
  }, [startUnlockCountdown]);

  const counting =
    reviewStepCountdownEnabled &&
    typeof secondsLeft === "number" &&
    secondsLeft > 0;

  const steps = [
    "Un petit mot sur Google, ça nous aide vraiment.",
    "Quand c’est fait, revenez simplement ici.",
    "Ensuite, lancez la roue pour tenter votre cadeau !",
  ];

  return (
    <>
      {counting ? (
        <div
          className="fixed inset-0 z-[13000] flex flex-col items-center justify-center overflow-y-auto overscroll-contain bg-gradient-to-b from-amber-200 via-orange-400 to-orange-600 p-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-labelledby="count-label"
        >
          <p
            id="count-label"
            className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/95"
          >
            La roue dans
          </p>
          <p
            className="mt-4 font-mono text-8xl font-bold tabular-nums text-white drop-shadow-md md:text-9xl"
            aria-hidden
          >
            {secondsLeft ?? 0}
          </p>
          <p className="mt-2 text-lg font-medium text-white/95">
            seconde{(secondsLeft ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      ) : null}
      <div
        className="fixed inset-0 z-[12000] flex items-center justify-center overflow-y-auto overscroll-contain bg-orange-950/25 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
      >
        <div className="my-auto w-full max-w-[min(100%,420px)] max-h-[min(100dvh-1.5rem,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem))] overflow-y-auto rounded-[1.75rem] border-2 border-amber-200 bg-white p-6 shadow-[0_24px_60px_-15px_rgba(154,52,18,0.18)]">
          <div className="mx-auto mb-5 flex max-w-[12rem] justify-center">
            <BistrotLogo
              className="h-auto max-h-16 w-full object-contain object-center sm:max-h-[4.25rem]"
            />
          </div>
          <h2
            id="review-title"
            className="text-center text-xl font-extrabold tracking-tight text-amber-950 sm:text-[1.35rem]"
          >
            Merci pour votre passage
          </h2>
          <ol className="mt-5 space-y-3">
            {steps.map((text, i) => (
              <li
                key={text}
                className="flex gap-3 text-sm leading-snug text-amber-950/90"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#facc15] to-[#ea580c] text-xs font-bold text-amber-950 shadow-sm"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/90 px-3 py-2">
            <GoogleStarsRow />
            <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-amber-900/65">
              Avis Google
            </p>
          </div>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 active:scale-[0.99]"
            onClick={() => {
              openedGoogleRef.current = true;
            }}
          >
            Laisser un petit avis sur Google
          </a>
          <p className="mt-3 text-center text-[12px] leading-snug text-amber-950/58">
            Une fois votre avis publié, revenez sur cette page et touchez le bouton ci‑dessous pour accéder à la roue.
          </p>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-amber-300/95 bg-white py-3 text-[15px] font-bold text-orange-950 shadow-sm transition hover:bg-amber-50 active:scale-[0.99]"
            onClick={() => {
              openedGoogleRef.current = true;
              void startUnlockCountdown();
            }}
          >
            Continuer vers la roulette
          </button>
          {unlockError ? (
            <p className="mt-4 rounded-2xl border border-amber-200/90 bg-amber-50 px-3 py-2 text-center text-xs leading-snug text-amber-950">
              {unlockError}
            </p>
          ) : null}
          {reviewSkipEnabled ? (
            <button
              type="button"
              onClick={() => startUnlockCountdown()}
              className="mt-6 w-full py-2 text-center text-xs font-medium text-amber-800/65 underline underline-offset-2"
            >
              Continuer sans laisser d’avis (démo uniquement)
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
