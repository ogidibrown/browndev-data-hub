import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "./config";

/**
 * Simple in-memory rate limiter keyed by IP address.
 *
 * Works within a single Vercel serverless instance. Under high traffic Vercel
 * may spin up multiple instances — each has its own counter. For strict
 * multi-instance rate limiting, swap the Map for Upstash Redis.
 */
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  return { allowed: entry.count <= RATE_LIMIT_MAX_REQUESTS, remaining, resetAt: entry.resetAt };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
