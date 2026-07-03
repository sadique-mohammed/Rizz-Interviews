import 'server-only';

import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client singleton.
 *
 * Used exclusively for active interview runtime state.
 * Redis is NOT the final source of truth — Postgres is.
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
