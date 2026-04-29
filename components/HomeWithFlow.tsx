"use client";

import { useCallback, useState } from "react";
import { CampaignFlow, type CampaignFlowStep } from "@/components/CampaignFlow";

export function HomeWithFlow() {
  const [flowStep, setFlowStep] = useState<CampaignFlowStep>("review");
  const onStepChange = useCallback((s: CampaignFlowStep) => {
    setFlowStep(s);
  }, []);
  const showIntroLines = flowStep !== "finished";

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-lg shrink-0 flex-col pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-12 sm:pb-14 sm:pt-14">
      <header className="text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="relative inline-flex h-[3.375rem] w-[3.375rem] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#facc15] via-[#fbbf24] to-[#ea580c] p-[3px] shadow-[0_8px_24px_-6px_rgba(234,88,12,0.45)] ring-3 ring-white/80">
            <span className="flex h-[97%] w-[97%] items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-[2rem] font-black leading-none tracking-tighter text-orange-700">
                R
              </span>
            </span>
            <span
              className="absolute -right-1 bottom-1 h-10 w-10 rounded-full bg-amber-300/95 blur-xl"
              aria-hidden
            />
          </span>
          <span className="text-left leading-none">
            <span className="block text-xl font-black uppercase leading-tight tracking-tight text-orange-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:text-3xl sm:leading-none">
              La roulette cadeau
            </span>
          </span>
        </div>

        {showIntroLines ? (
          <>
            <p className="mx-auto mt-5 max-w-[92%] leading-[1.1] tracking-wide">
              <span className="inline font-black uppercase tracking-wide text-[0.9375rem] text-orange-900 sm:text-lg">
                Merci,<span className="mr-2"> </span>
              </span>
              <span className="inline font-black uppercase tracking-[0.12em] text-amber-800 max-sm:block max-sm:text-center sm:text-xl sm:tracking-[0.15em]">
                bonne chance !
              </span>
            </p>
            <p className="mx-auto mt-4 max-w-[24rem] text-[13px] leading-relaxed text-orange-950/72 sm:text-[14px]">
              Un petit avis sur Google nous aide vraiment — merci d’avance&nbsp;!
              Ensuite, à vous de jouer : en cas de gain, le bon vous est envoyé par
              e-mail.
            </p>
          </>
        ) : null}
      </header>

      <div className="relative z-[5] mt-8 w-full sm:mt-10">
        <CampaignFlow onStepChange={onStepChange} />
      </div>
    </main>
  );
}
