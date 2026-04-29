import Link from "next/link";
import { GiftOpenAnimation } from "@/components/GiftOpenAnimation";
import { GIFT_LINK_MAX_AGE_MS } from "@/lib/gift-config";
import {
  normalizeGiftTokenFromQuery,
  verifyGiftTokenResult,
  type GiftTokenFailure,
} from "@/lib/gift-token";

type SearchParams = { token?: string | string[] };

function messageEtenduPourEchec(failure: GiftTokenFailure): string {
  switch (failure) {
    case "expired":
      return "Ce lien a dépassé la durée prévue depuis l’envoi du mail. Une nouvelle participation depuis la roulette est nécessaire.";
    case "format":
      return "Le lien semble incomplet ou modifié. Ouvrez le bouton « Dévoiler le lot » directement depuis l’e-mail, sans recopier une longue adresse.";
    case "bad_signature":
      return "Ce lien ne correspond pas à cette version du site ou a été envoyé depuis un autre environnement : rejouez sur le site officiel et ouvrez le nouveau mail depuis son bouton.";
    default:
      return "Ce lien n’est pas reconnu. Réessayez depuis la page d’accueil ou demandez au comptoir.";
  }
}

export default async function OuvrirCadeauPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.token;
  const brut = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const tokenStr = brut ? normalizeGiftTokenFromQuery(brut) : "";

  if (!tokenStr) {
    return (
      <InvalidToken message="Ce lien semble incomplet. Demandez de l’aide au comptoir." />
    );
  }

  const result = verifyGiftTokenResult(tokenStr, GIFT_LINK_MAX_AGE_MS);
  if (!result.ok) {
    const hint =
      result.failure === "bad_signature"
        ? " (cause fréquente : secret GIFT_TOKEN_SECRET différent entre envoi du mail et ce site)"
        : "";
    console.error(`[cadeau/ouvrir] jeton refusé: ${result.failure}${hint}`);
    return (
      <InvalidToken message={messageEtenduPourEchec(result.failure)} />
    );
  }

  return (
    <div className="flex min-h-mobile-screen w-full flex-1 flex-col bg-gradient-to-b from-amber-50 to-orange-100/70 text-amber-950">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <GiftOpenAnimation prizeLabel={result.payload.prize} trackingToken={tokenStr} />
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
