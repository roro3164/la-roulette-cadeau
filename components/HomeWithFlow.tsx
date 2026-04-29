"use client";

import { useCallback, useState } from "react";
import { BistrotLogo } from "@/components/BistrotLogo";
import { CampaignFlow, type CampaignFlowStep } from "@/components/CampaignFlow";

export function HomeWithFlow() {
  const [flowStep, setFlowStep] = useState<CampaignFlowStep>("review");
  const onStepChange = useCallback((s: CampaignFlowStep) => {
    setFlowStep(s);
  }, []);
  const showIntroLines = flowStep !== "finished";

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-lg shrink-0 flex-col pb-[max(7.75rem,calc(env(safe-area-inset-bottom)+7.25rem))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-12 sm:pb-[max(9.5rem,calc(env(safe-area-inset-bottom)+9rem))] sm:pt-14">
      <footer
        aria-label="Restaurant"
        className="fixed bottom-[max(0.5rem,calc(env(safe-area-inset-bottom)+4px))] left-[max(0.5rem,calc(env(safe-area-inset-left)+2px))] z-30 isolate w-[min(66vw,14rem)] sm:left-[max(0.75rem,calc(env(safe-area-inset-left)+4px))] sm:w-[17rem] md:left-[max(1rem,calc(env(safe-area-inset-left)+6px))] md:w-[18.5rem]"
      >
        <BistrotLogo
          priority
          className="h-auto max-h-[5rem] w-full object-contain object-left opacity-95 drop-shadow-[0_1px_3px_rgba(255,255,255,0.45)] sm:max-h-28"
        />
      </footer>

      <header className="w-full">
        <div className="flex w-full justify-center px-2 pt-0.5 sm:pt-1">
          <span className="max-w-[min(22rem,calc(100%-0.5rem))] bg-linear-to-br from-orange-700 via-orange-600 to-amber-500 bg-clip-text text-center font-sans text-[clamp(1.0625rem,6.25vw,2.75rem)] font-black uppercase leading-none tracking-[0.065em] text-transparent sm:max-w-[min(26rem,calc(100%-2rem))] sm:text-[min(2.625rem,5.5vw)]">
            La roulette cadeau
          </span>
        </div>

        {showIntroLines ? (
          <>
            <p className="mx-auto mt-3 max-sm:mt-2 max-w-[min(26rem,calc(100%-0.75rem))] text-center font-sans font-black uppercase leading-none tracking-[0.065em] whitespace-normal text-[clamp(1rem,4.75vw,1.375rem)] sm:text-[1.3125rem]">
              <span className="text-orange-950">Merci,</span>
              <span className="text-amber-800"> bonne chance&nbsp;!</span>
            </p>
          </>
        ) : flowStep === "finished" ? (
          <p className="mx-auto mt-6 text-center font-sans text-[clamp(1.0625rem,4.25vw,1.3125rem)] font-black uppercase leading-none tracking-[0.065em] text-orange-950/95">
            Merci, à bientôt&nbsp;!
          </p>
        ) : null}
      </header>

      <div className="relative z-[5] mt-8 w-full sm:mt-10">
        <CampaignFlow onStepChange={onStepChange} />
      </div>
    </main>
  );
}
