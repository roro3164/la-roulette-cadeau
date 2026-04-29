"use client";

import { useCallback, useEffect, useState } from "react";
import { EmailStep } from "@/components/EmailStep";
import { ReviewStep } from "@/components/ReviewStep";
import { ThankYouToast } from "@/components/ThankYouToast";
import { Wheel } from "@/components/Wheel";
import { STORAGE_PARTICIPATION_DONE_KEY } from "@/lib/campaign-storage";
import { demoReplayEnabled } from "@/lib/config";
import { WHEEL_SEGMENTS } from "@/lib/wheel-segments";

const isDev = process.env.NODE_ENV === "development";

export type CampaignFlowStep =
  | "review"
  | "wheel"
  | "email"
  | "thanks"
  | "finished";

type Props = {
  /** Pour adapter le header (ex. masquer l’intro sur l’écran « terminé »). */
  onStepChange?: (step: CampaignFlowStep) => void;
};

export function CampaignFlow({ onStepChange }: Props = {}) {
  const [step, setStep] = useState<CampaignFlowStep>("review");
  const [wonIndex, setWonIndex] = useState<number | null>(null);
  const [wheelKey, setWheelKey] = useState(0);
  const [restartBusy, setRestartBusy] = useState(false);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  /**
   * Au chargement : option `?reset=1` pour repartir sur l’avis (tablette / test).
   * En développement on ne rouvre pas l’écran « terminé » depuis le stockage
   * (recharger = retrouver la page de départ).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reset") === "1") {
        window.localStorage.removeItem(STORAGE_PARTICIPATION_DONE_KEY);
        setStep("review");
        setWonIndex(null);
        setWheelKey((k) => k + 1);
        const url = new URL(window.location.href);
        url.searchParams.delete("reset");
        window.history.replaceState(
          {},
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
        void fetch("/api/play/reset", {
          method: "POST",
          credentials: "include",
        });
        return;
      }
      if (
        !isDev &&
        window.localStorage.getItem(STORAGE_PARTICIPATION_DONE_KEY) === "1"
      ) {
        setStep("finished");
      }
    } catch {
      /* ignore storage indisponible */
    }
  }, []);

  const suppressWin = step === "email" || step === "thanks";
  const wonLabel =
    wonIndex !== null ? WHEEL_SEGMENTS[wonIndex].label : "";

  const onSpinComplete = useCallback((idx: number) => {
    setWonIndex(idx);
  }, []);

  const onContinueAfterWin = useCallback(() => {
    setStep("email");
  }, []);

  const finalizeParticipation = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_PARTICIPATION_DONE_KEY, "1");
      }
    } catch {
      /* ignore */
    }
    setStep("finished");
    setWonIndex(null);
  }, []);

  const showWheel =
    step === "wheel" || step === "email" || step === "thanks";

  /** Repart depuis l’étape « avis Google » (efface cookie + marque locale). */
  const restartParticipation = useCallback(async () => {
    setRestartBusy(true);
    try {
      const res = await fetch("/api/play/reset", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      try {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_PARTICIPATION_DONE_KEY);
        }
      } catch {
        /* ignore */
      }
      setWonIndex(null);
      setWheelKey((k) => k + 1);
      setStep("review");
    } finally {
      setRestartBusy(false);
    }
  }, []);

  return (
    <>
      {step === "review" ? (
        <ReviewStep onDone={() => setStep("wheel")} />
      ) : null}

      {showWheel ? (
        <Wheel
          key={wheelKey}
          suppressWinPresentation={suppressWin}
          suppressSpinButton={step === "email" || step === "thanks"}
          onSpinComplete={onSpinComplete}
          onContinueAfterWin={onContinueAfterWin}
        />
      ) : null}

      {step === "email" && wonLabel ? (
        <EmailStep
          prizeLabel={wonLabel}
          onBack={() => setStep("wheel")}
          onSuccess={() => setStep("thanks")}
        />
      ) : null}

      {step === "thanks" ? (
        <ThankYouToast onDismiss={finalizeParticipation} />
      ) : null}

      {demoReplayEnabled && step === "finished" ? (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[20000] flex -translate-x-1/2">
          <button
            type="button"
            onClick={() => void restartParticipation()}
            disabled={restartBusy}
            className="rounded-full border-2 border-dashed border-amber-600/85 bg-linear-to-br from-orange-100 to-amber-100 px-6 py-3 text-sm font-black uppercase tracking-wide text-orange-950 shadow-xl ring-4 ring-orange-400/35 transition hover:brightness-[1.02] disabled:opacity-55"
          >
            {restartBusy ? "…" : "Démo · Rejouer"}
          </button>
        </div>
      ) : null}

      {isDev ? (
        <div className="fixed bottom-[5.125rem] left-[max(0.5rem,env(safe-area-inset-left))] z-[20001]">
          <button
            type="button"
            onClick={() => void restartParticipation()}
            disabled={restartBusy}
            className="rounded-md border border-amber-400/70 bg-orange-950/85 px-2 py-1 font-mono text-[11px] text-amber-100 shadow-lg backdrop-blur-sm hover:bg-orange-950 disabled:opacity-60"
          >
            [dev] Réinitialiser session
          </button>
        </div>
      ) : null}
    </>
  );
}
