"use client";

import { BistrotLogo } from "@/components/BistrotLogo";

type Props = {
  onDismiss: () => void;
};

/**
 * Pop après envoi confirmé du bon — fermeture uniquement via le bouton (reste lisible jusqu’à action explicite).
 */
export function ThankYouToast({ onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="toast-merci"
      className="fixed inset-0 z-[14000] flex cursor-default items-center justify-center overflow-y-auto overscroll-contain bg-orange-950/32 p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]"
    >
      <div
        className="max-w-sm cursor-default rounded-[1.75rem] border-2 border-amber-200/90 bg-white px-8 py-9 text-center shadow-[0_28px_48px_-18px_rgba(194,65,12,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <BistrotLogo className="mx-auto mb-4 w-auto max-h-28 max-w-[min(340px,_92%)] object-contain object-center sm:max-h-32" />
        <p
          id="toast-merci"
          className="text-xl font-extrabold leading-snug text-amber-950 sm:text-2xl"
        >
          Merci pour votre participation&nbsp;!
        </p>
        <p className="mt-3 text-[14px] leading-snug text-amber-900/85">
          Vous allez recevoir votre cadeau par e-mail.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 w-full min-h-[48px] rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 active:scale-[0.99]"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
