import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { GIFT_LINK_MAX_AGE_MS } from "@/lib/gift-config";
import { getGiftRedis } from "@/lib/gift-redis";

const DATA_REV = ["data", "gift-revisit-peeks.json"] as const;
const REV_REDIS_PREFIX = "lrc:gifrev:";

/** TTL Redis aligné avec la validité du lien cadeau. */
const TTL_SEC = Math.ceil(GIFT_LINK_MAX_AGE_MS / 1000);

function revDataPath(): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...DATA_REV);
}

function ensureDataDirSync(): void {
  const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadRevFile(): Record<string, number> {
  const p = revDataPath();
  try {
    if (!existsSync(p)) return {};
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function saveRevFile(map: Record<string, number>): void {
  ensureDataDirSync();
  writeFileSync(revDataPath(), JSON.stringify(map), "utf8");
}

/**
 * Incrémente le nombre de « retours » sur le lien une fois le cadeau déjà ouvert (appels peek).
 * À appeler uniquement quand une première ouverture est déjà enregistrée.
 */
export async function incrementRevisitPeekCount(
  stableKey: string,
): Promise<number> {
  const r = getGiftRedis();
  if (r) {
    const k = `${REV_REDIS_PREFIX}${stableKey}`;
    const n = await r.incr(k);
    await r.expire(k, TTL_SEC);
    return n;
  }
  const data = loadRevFile();
  const prev = data[stableKey] ?? 0;
  const next = prev + 1;
  data[stableKey] = next;
  saveRevFile(data);
  return next;
}
