"use client";

import { useState } from "react";
import { giftEmailPrefill } from "@/lib/config";
import { NEXT_VISIT_PRIZE_NOTE } from "@/lib/wheel-segments";
import { EMAIL_FORM } from "@/lib/user-messages";

type Props = {
  prizeLabel: string;
  onBack: () => void;
  /** Appelé uniquement lorsque l’API confirme l’envoi réel du message. */
  onSuccess: () => void;
};

export function EmailStep({ prizeLabel, onBack, onSuccess }: Props) {
  const [email, setEmail] = useState(giftEmailPrefill);
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/send-gift", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          prizeLabel,
          acceptedTerms: accepted,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        emailSent?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? EMAIL_FORM.genericError);
        return;
      }
      if (data.emailSent !== true) {
        setError(EMAIL_FORM.notConfirmed);
        return;
      }
      onSuccess();
    } catch {
      setError(EMAIL_FORM.network);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-2 w-full rounded-2xl border-2 border-amber-100 bg-white px-4 py-2.5 text-[16px] text-amber-950 outline-none transition placeholder:text-amber-900/40 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 sm:text-sm";

  return (
    <div
      className="fixed inset-0 z-[12000] flex min-h-mobile-screen flex-col bg-orange-950/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-title"
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] [-webkit-overflow-scrolling:touch]"
      >
        <div className="mx-auto flex w-full flex-1 flex-col justify-center py-6 min-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)]">
          <form
            onSubmit={submit}
            className="mx-auto flex w-full min-w-0 max-w-[min(100%,26.25rem)] shrink-0 flex-col rounded-[1.75rem] border-2 border-amber-100 bg-white p-5 shadow-[0_28px_48px_-18px_rgba(194,65,12,0.18)] sm:p-6"
          >
          <div className="text-center">
            <span className="text-3xl" aria-hidden>
              🎊
            </span>
            <h2
              id="email-title"
              className="mt-1 text-xl font-extrabold tracking-tight text-amber-950"
            >
              Bravo&nbsp;!
            </h2>
            <p className="mt-2 text-[15px] font-medium leading-snug text-amber-900/90">
              Vous avez gagné
            </p>
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <p className="inline-flex min-h-[44px] min-w-[8rem] max-w-full items-center justify-center rounded-full border-2 border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-2.5 text-center text-base font-bold text-orange-950 shadow-inner">
                {prizeLabel}
              </p>
              <p className="text-center text-[11px] leading-snug text-amber-800/70">
                {NEXT_VISIT_PRIZE_NOTE}
              </p>
            </div>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-amber-900/78">
            Indiquez votre e-mail — vous recevrez le bon à montrer au comptoir.
          </p>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-amber-800/70">
            E-mail <span className="normal-case opacity-75">*</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              value={email}
              placeholder="vous@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-amber-800/70">
            Prénom ou nom <span className="opacity-75">(facultatif)</span>
            <input
              type="text"
              autoComplete="name"
              enterKeyHint="done"
              value={name}
              placeholder="ex. Marie"
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-3 text-xs leading-snug text-amber-950/85">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-amber-300 text-orange-600"
            />
            <span>J’ai lu et j’accepte le règlement du jeu.</span>
          </label>
          {error ? (
            <p
              className="mt-3 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2 text-sm leading-snug text-amber-950"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onBack}
              className="order-2 min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold text-amber-800/65 touch-manipulation transition hover:text-amber-950 sm:order-1"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="order-1 min-h-[48px] w-full touch-manipulation rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/35 transition hover:brightness-105 enabled:active:scale-[0.99] disabled:opacity-60 sm:order-2 sm:w-auto"
            >
              {loading ? "Envoi en cours…" : "Recevoir mon bon par e-mail"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
