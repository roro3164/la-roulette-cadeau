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
    <main className="relative z-10 mx-auto flex w-full max-w-lg shrink-0 flex-col pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-12 sm:pb-14 sm:pt-14">
      <header className="text-center">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
          <span className="relative mx-auto inline-flex shrink-0 items-center justify-center px-1 sm:mx-0">
            <BistrotLogo
              priority
              className="max-w-[min(21rem,92vw)] w-[min(336px,92vw)] max-h-20.5 sm:max-h-24"
            />
          </span>
          <span className="max-sm:text-center sm:text-left">
            <span className="block bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text font-sans text-xl font-black uppercase leading-none tracking-[0.065em] text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] sm:text-3xl">
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
          </>
        ) : flowStep === "finished" ? (
          <p className="mx-auto mt-5 text-[15px] font-semibold text-orange-950/90">
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
