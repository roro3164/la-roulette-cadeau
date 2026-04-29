import { HomeWithFlow } from "@/components/HomeWithFlow";

/** Fond blanc ; texte orange / ambre lisible dessus. */
export default function Home() {
  return (
    <div className="relative isolate flex min-h-mobile-screen flex-col bg-white text-amber-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: "linear-gradient(180deg,#ffffff 0%,#fefefe 100%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 playful-dots opacity-40" aria-hidden />

      <HomeWithFlow />
    </div>
  );
}
