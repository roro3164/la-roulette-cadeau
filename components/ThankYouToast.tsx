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
    const t = window.setTimeout(onDismiss, 6000);
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
        className="max-w-sm cursor-default rounded-[1.75rem] border-2 border-amber-200/90 bg-white px-8 py-10 text-center shadow-[0_28px_48px_-18px_rgba(194,65,12,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-3xl leading-none" aria-hidden>
          ✅
        </p>
        <p
          id="toast-merci"
          className="mt-4 text-xl font-extrabold leading-snug text-amber-950"
        >
          Bon envoyé !
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-amber-900/78">
          Vous recevrez le lien du bon dans vos e-mails sous peu. Pensez aussi aux indésirables.
        </p>
        <p className="mt-6 text-xs font-medium text-amber-800/55">
          Toucher en dehors ferme · fermeture automatique
        </p>
      </div>
    </div>
  );
}
