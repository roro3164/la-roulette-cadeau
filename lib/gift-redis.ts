import { Redis } from "@upstash/redis";

let singleton: Redis | null = null;

/**
 * Upstash ou Vercel KV (mêmes variables que le template KV sur Vercel).
 * Sans ça, le suivi des ouvertures cadeau retombe sur des fichiers locaux
 * (non persistants sur Vercel serverless).
 */
function urlAndToken(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

export function isGiftKvConfigured(): boolean {
  return urlAndToken() !== null;
}

export function getGiftRedis(): Redis | null {
  const pair = urlAndToken();
  if (!pair) return null;
  if (!singleton) {
    singleton = new Redis(pair);
  }
  return singleton;
}
