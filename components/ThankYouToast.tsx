"use client";

import { useEffect } from "react";

type Props = {
  onDismiss: () => void;
};

/**
 * Petit pop après envoi réel du bon — style carte claire façon jeu mobile.
 */
export function ThankYouToast({ onDismiss }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="toast-merci"
      className="fixed inset-0 z-[12000] flex cursor-pointer items-center justify-center overflow-y-auto overscroll-contain bg-orange-950/28 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]"
      onClick={onDismiss}
    >
      <div
        className="max-w-sm cursor-default rounded-[1.75rem] border-2 border-amber-200/90 bg-white px-8 py-9 text-center shadow-[0_28px_48px_-18px_rgba(194,65,12,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-3xl leading-none" aria-hidden>
          ✅
        </p>
        <p
          id="toast-merci"
          className="mt-4 text-xl font-extrabold leading-snug text-amber-950"
        >
          Merci pour votre participation&nbsp;!
        </p>
        <p className="mt-3 text-[15px] leading-snug text-amber-900/82">
          À bientôt — le bon vous a été envoyé par e-mail.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 min-h-[48px] w-full touch-manipulation rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/35 transition hover:brightness-105 active:scale-[0.99]"
        >
          Continuer
        </button>
        <p className="mt-4 text-[11px] text-amber-800/50">
          Vous pouvez aussi toucher l’arrière-plan pour fermer.
        </p>
      </div>
    </div>
  );
}
