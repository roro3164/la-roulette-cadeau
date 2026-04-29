"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { BistrotLogo } from "@/components/BistrotLogo";
import { NEXT_VISIT_PRIZE_NOTE, prizeSrcForLabel } from "@/lib/wheel-segments";

type Props = {
  prizeLabel: string;
  trackingToken: string;
};

function formatOpenedFrFromIso(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function GiftOpenAnimation({ prizeLabel, trackingToken }: Props) {
  const [opened, setOpened] = useState(false);
  /** True si au chargement l’API indiquait déjà une première ouverture (lien revisité). */
  const [revisitFromPeek, setRevisitFromPeek] = useState(false);
  /** Nombre de visites après enregistrement (appels peek successifs avec cadeau déjà ouvert). */
  const [revisitPeekCount, setRevisitPeekCount] = useState(0);
  const [openedLine, setOpenedLine] = useState<string | null>(null);
  const [peekBusy, setPeekBusy] = useState(true);
  const [openingBusy, setOpeningBusy] = useState(false);

  const prizeSrc = prizeSrcForLabel(prizeLabel) ?? "/wheel/cadeau.png";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gift/track-open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: trackingToken, intent: "peek" }),
        });
        const data = (await res.json()) as {
          openedAtISO?: string | null;
          revisitPeekCount?: number;
        };
        if (cancelled || !res.ok) return;

        const n =
          typeof data.revisitPeekCount === "number" &&
          Number.isFinite(data.revisitPeekCount)
            ? Math.max(0, Math.floor(data.revisitPeekCount))
            : 0;
        setRevisitPeekCount(n);

        const label = formatOpenedFrFromIso(String(data.openedAtISO ?? ""));
        if (label) {
          setOpenedLine(`Première ouverture : ${label}`);
          setOpened(true);
          setRevisitFromPeek(true);
        }
      } finally {
        if (!cancelled) setPeekBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackingToken]);

  const finalizeOpenFromClick = useCallback(async () => {
    setOpeningBusy(true);
    try {
      const res = await fetch("/api/gift/track-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trackingToken, intent: "open" }),
      });
      const data = (await res.json()) as { openedAtISO?: string | null };
      if (res.ok && data.openedAtISO) {
        const label = formatOpenedFrFromIso(String(data.openedAtISO));
        if (label) setOpenedLine(`Première ouverture : ${label}`);
      }
    } catch {
      /* enregistrement best-effort : on affiche quand même le lot */
    } finally {
      setOpened(true);
      setOpeningBusy(false);
    }
  }, [trackingToken]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-[max(2.5rem,env(safe-area-inset-top,0px))] sm:py-16">
      <BistrotLogo className="mb-8 max-h-20 w-auto max-w-[min(280px,_90vw)] object-contain sm:mb-10 sm:max-h-[5.5rem]" />

      {peekBusy && !opened ? (
        <p className="mb-6 text-sm text-amber-800/65">Chargement…</p>
      ) : null}

      {!opened ? (
        <motion.div
          className={`relative flex flex-col items-center gap-10 transition-opacity duration-300 ${peekBusy ? "pointer-events-none opacity-70" : "opacity-100"}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: peekBusy ? 0.6 : 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="relative cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="Ouvrir le cadeau devant le personnel"
            onClick={() => {
              if (peekBusy || openingBusy) return;
              void finalizeOpenFromClick();
            }}
            onKeyDown={(e) => {
              if (peekBusy || openingBusy) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void finalizeOpenFromClick();
              }
            }}
          >
            <motion.div
              className="relative rounded-[28px] bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 p-[5px] shadow-[0_28px_60px_-12px_rgba(234,88,12,0.45)]"
              animate={{
                y: [0, -10, 0],
                rotate: [0, -1.8, 1.8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              }}
            >
              <div className="relative h-52 w-52 overflow-hidden rounded-[24px] bg-amber-50 sm:h-56 sm:w-56 md:h-60 md:w-60">
                <Image
                  src="/wheel/cadeau.png"
                  alt=""
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 208px, 240px"
                  priority
                />
              </div>
              <motion.span
                className="pointer-events-none absolute -right-2 -top-2 text-2xl opacity-95"
                aria-hidden
                animate={{ scale: [1, 1.15, 1], rotate: [0, 15, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              >
                ✨
              </motion.span>
            </motion.div>
          </div>
          <motion.p
            className="max-w-[min(22rem,_92vw)] text-center text-[14px] font-medium leading-snug text-amber-950/85 sm:text-[15px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {openingBusy ? (
              "Enregistrement…"
            ) : (
              <>
                <span className="font-extrabold uppercase tracking-[0.06em] text-amber-950">
                  Attention
                </span>{" "}
                Cliquez sur le cadeau devant notre personnel pour bénéficier de votre cadeau.
              </>
            )}
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          className="flex max-w-lg flex-col items-center gap-7 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative"
          >
            <div className="relative h-[min(72vw,16rem)] w-[min(72vw,16rem)] sm:h-64 sm:w-64 md:h-72 md:w-72">
              <motion.div
                className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-[#fffbeb] to-orange-50 shadow-[0_24px_50px_-8px_rgba(194,65,12,0.25)] ring-4 ring-orange-400/25"
                animate={{
                  boxShadow: [
                    "0 24px 50px -8px rgba(194,65,12,0.25)",
                    "0 32px 56px -4px rgba(251,146,60,0.35)",
                    "0 24px 50px -8px rgba(194,65,12,0.25)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              >
                <Image
                  src={prizeSrc}
                  alt=""
                  fill
                  className="object-contain p-5"
                  sizes="(max-width: 768px) 72vw, 288px"
                  priority
                />
              </motion.div>
              <motion.span
                className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-4xl"
                aria-hidden
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
                transition={{
                  rotate: {
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  },
                  scale: {
                    type: "spring",
                    stiffness: 400,
                    damping: 14,
                  },
                }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>
          {revisitFromPeek ? (
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
            >
              <span className="rounded-full bg-orange-200/95 px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-orange-950 shadow-sm ring-2 ring-orange-400/40">
                Déjà ouvert
              </span>
              {openedLine ? (
                <p className="text-[15px] font-semibold leading-snug text-amber-950">{openedLine}</p>
              ) : null}
              {revisitPeekCount >= 2 ? (
                <p className="max-w-sm text-[12px] font-medium leading-snug text-amber-900/88">
                  Ce cadeau a été consulté plus d’une fois depuis la première ouverture (
                  {revisitPeekCount} visites enregistrées).
                </p>
              ) : null}
            </motion.div>
          ) : openedLine ? (
            <motion.p
              className="text-[14px] font-semibold leading-snug text-amber-950/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04 }}
            >
              {openedLine}
            </motion.p>
          ) : null}
          <motion.h1
            className="text-2xl font-bold tracking-tight text-amber-950 sm:text-3xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Voici votre gain
          </motion.h1>
          <motion.p
            className="rounded-2xl border border-amber-200/95 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 px-7 py-3.5 text-lg font-extrabold tracking-tight text-amber-950 shadow-inner sm:text-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
          >
            {prizeLabel}
          </motion.p>
          <motion.p
            className="max-w-sm text-[12px] font-medium leading-snug text-amber-900/76"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
          >
            {NEXT_VISIT_PRIZE_NOTE}
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
