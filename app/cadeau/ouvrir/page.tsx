import Link from "next/link";
import { GiftOpenAnimation } from "@/components/GiftOpenAnimation";
import { GIFT_LINK_MAX_AGE_MS } from "@/lib/gift-config";
import { verifyGiftToken } from "@/lib/gift-token";

type SearchParams = { token?: string | string[] };

export default async function OuvrirCadeauPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.token;
  const tokenStr = Array.isArray(raw) ? raw[0] : raw;

  if (!tokenStr) {
    return (
      <InvalidToken message="Ce lien semble incomplet. Demandez de l’aide au comptoir." />
    );
  }

  const payload = verifyGiftToken(tokenStr, GIFT_LINK_MAX_AGE_MS);
  if (!payload) {
    return <InvalidToken message="Ce lien n’est plus valide. Nouvelle tentative depuis la page d’accueil." />;
  }

  return (
    <div className="flex min-h-mobile-screen w-full flex-1 flex-col bg-gradient-to-b from-amber-50 to-orange-100/70 text-amber-950">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <GiftOpenAnimation prizeLabel={payload.prize} trackingToken={tokenStr} />
      </main>
    </div>
  );
}

function InvalidToken({ message }: { message: string }) {
  return (
    <div className="flex min-h-mobile-screen w-full flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50 to-orange-100/70 px-6 text-center text-amber-950">
      <p className="text-lg text-amber-950">{message}</p>
      <Link
        href="/"
        className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/35"
      >
        Retour à la roulette
      </Link>
    </div>
  );
}
