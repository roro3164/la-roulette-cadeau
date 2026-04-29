"use client";

/** Formes organiques type « blob » en arrière-plan (bleu / cyan). */
export function DecorBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
      <div
        className="absolute -left-[20%] -top-[10%] h-[55vmin] w-[55vmin] rounded-[45%_55%_60%_40%_/_55%_45%_55%_45%] bg-cyan-400/25 blur-[60px]"
        style={{ animation: "blob-float-a 14s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[15%] top-[30%] h-[48vmin] w-[48vmin] rounded-[55%_45%_40%_60%_/_50%_60%_40%_50%] bg-indigo-500/30 blur-[55px]"
        style={{ animation: "blob-float-b 18s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-15%] left-[25%] h-[42vmin] w-[50vmin] rounded-[48%_52%_55%_45%_/_48%_52%_48%_52%] bg-sky-300/35 blur-[50px]"
        style={{ animation: "blob-float-c 16s ease-in-out infinite 1s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.12),transparent_55%)]" />
    </div>
  );
}
