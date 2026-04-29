import { HomeWithFlow } from "@/components/HomeWithFlow";

/** Fond en dégradé doux blanc → crème / jaune → orange pêche. */
export default function Home() {
  return (
    <div
      className="relative isolate flex min-h-mobile-screen flex-1 flex-col text-amber-950"
      style={{
        background:
          "linear-gradient(168deg,#ffffff 0%,#fffbeb 18%,#fef9c3 42%,#fde68a 68%,#fdba74 88%,#fb923c 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 playful-dots opacity-[0.28]" aria-hidden />

      <HomeWithFlow />
    </div>
  );
}
