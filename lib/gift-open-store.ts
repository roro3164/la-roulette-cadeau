import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { GIFT_LINK_MAX_AGE_MS } from "@/lib/gift-config";
import { getGiftRedis } from "@/lib/gift-redis";

/** Clé stable pour un lien cadeau (après vérif JWT). Évite collisions entre deux envois. */
export function giftOpenStableKey(part: {
  email: string;
  prize: string;
  t: number;
}): string {
  const normEmail = part.email.trim().toLowerCase();
  return createHash("sha256")
    .update(`${normEmail}|${part.prize}|${part.t}`)
    .digest("hex");
}

type StoreShape = Record<string, number>;

const DATA_REL = ["data", "gift-opens.json"] as const;
const REDIS_KEY_PREFIX = "lrc:gifopen:";

function dataPath(): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...DATA_REL);
}

function ensureDirSync(): void {
  const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadFileUnsafe(): StoreShape {
  const p = dataPath();
  try {
    if (!existsSync(p)) return {};
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object") return {};
    return parsed as StoreShape;
  } catch {
    return {};
  }
}

function saveFile(entries: StoreShape): void {
  ensureDirSync();
  writeFileSync(dataPath(), JSON.stringify(entries), "utf8");
}

function peekOpenedAtMsFile(stableKey: string): number | undefined {
  return loadFileUnsafe()[stableKey];
}

function touchFirstOpenMsFile(stableKey: string): {
  openedAtMs: number;
  wasFirstOpen: boolean;
} {
  const data = loadFileUnsafe();
  const existing = data[stableKey];
  if (existing !== undefined) {
    return { openedAtMs: existing, wasFirstOpen: false };
  }
  const now = Date.now();
  data[stableKey] = now;
  saveFile(data);
  return { openedAtMs: now, wasFirstOpen: true };
}

/** Durée de rétention des clés (alignée sur validité lien cadeau). */
const REDIS_OPEN_TTL_SEC = Math.ceil(GIFT_LINK_MAX_AGE_MS / 1000);

function parseMsStored(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

async function peekOpenedAtMsRedis(
  stableKey: string,
): Promise<number | undefined> {
  const r = getGiftRedis();
  if (!r) return undefined;
  const raw = await r.get<string | number>(`${REDIS_KEY_PREFIX}${stableKey}`);
  return raw === undefined || raw === null
    ? undefined
    : parseMsStored(raw);
}

async function touchFirstOpenMsRedis(stableKey: string): Promise<{
  openedAtMs: number;
  wasFirstOpen: boolean;
}> {
  const r = getGiftRedis()!;
  const redisKey = `${REDIS_KEY_PREFIX}${stableKey}`;
  const existing = parseMsStored(await r.get(`${redisKey}`));
  if (existing !== undefined) {
    return { openedAtMs: existing, wasFirstOpen: false };
  }
  const now = Date.now();
  const created = await r.set(redisKey, now, {
    ex: REDIS_OPEN_TTL_SEC,
    nx: true,
  });
  if (!created) {
    const latest = parseMsStored(await r.get(`${redisKey}`));
    return {
      openedAtMs: latest ?? now,
      wasFirstOpen: false,
    };
  }
  return { openedAtMs: now, wasFirstOpen: true };
}

/**
 * Date de première ouverture connue pour ce lien ; `undefined` si jamais ouvert (ou fichier absent).
 */
export async function peekOpenedAtMs(
  stableKey: string,
): Promise<number | undefined> {
  if (getGiftRedis()) {
    try {
      return await peekOpenedAtMsRedis(stableKey);
    } catch (err) {
      console.error(
        "[gift-open-store] Redis indisponible ou identifiants erronés (peek) :",
        err,
      );
      return peekOpenedAtMsFile(stableKey);
    }
  }
  return peekOpenedAtMsFile(stableKey);
}

/** Enregistre la première ouverture ou renvoie l’instant déjà stocké (idempotent). */
export async function touchFirstOpenMs(stableKey: string): Promise<{
  openedAtMs: number;
  wasFirstOpen: boolean;
}> {
  if (getGiftRedis()) {
    try {
      return await touchFirstOpenMsRedis(stableKey);
    } catch (err) {
      console.error(
        "[gift-open-store] Redis indisponible ou identifiants erronés (touch) :",
        err,
      );
    }
  }
  return touchFirstOpenMsFile(stableKey);
}
