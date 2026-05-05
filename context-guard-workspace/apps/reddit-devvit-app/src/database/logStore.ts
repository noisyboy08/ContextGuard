/**
 * logStore.ts – Manages persistence of flagged edit events in Devvit's Redis.
 *
 * Data Model:
 *   Redis Key: "contextguard:logs:{subredditName}"
 *   Redis Type: List (RPUSH / LTRIM / LRANGE)
 *
 * Each log entry is a JSON string of type FlaggedEdit.
 */

import { RedisClient } from '@devvit/public-api';

export interface FlaggedEdit {
  id: string;             // Unique log ID (timestamp-based)
  commentId: string;      // Reddit comment ID (no "t1_" prefix)
  commentUrl: string;     // Direct link to the comment
  author: string;         // Reddit username of the editor
  subreddit: string;      // Subreddit name
  originalText: string;   // The archived original text
  editedText: string;     // The new post-edit text
  changePct: number;      // Calculated % of content changed
  isErasure: boolean;     // True if edited to near-empty ("." edits)
  detectedAt: number;     // Unix timestamp of detection (Date.now())
}

const REDIS_KEY_PREFIX = 'contextguard:logs';

function getKey(subreddit: string): string {
  return `${REDIS_KEY_PREFIX}:${subreddit.toLowerCase()}`;
}

/**
 * saveLog – Stores a new flagged edit entry in Redis.
 * Automatically trims the list to maxEntries to avoid unbounded growth.
 */
export async function saveLog(
  redis: RedisClient,
  entry: FlaggedEdit,
  maxEntries: number = 50
): Promise<void> {
  const key = getKey(entry.subreddit);
  const serialized = JSON.stringify(entry);

  // Append to the right of the list (newest last)
  await redis.rpush(key, serialized);

  // Trim to keep only the last `maxEntries` items
  const total = await redis.llen(key);
  if (total > maxEntries) {
    await redis.ltrim(key, total - maxEntries, -1);
  }
}

/**
 * getLogs – Retrieves the most recent flagged edits, newest first.
 */
export async function getLogs(
  redis: RedisClient,
  subreddit: string,
  limit: number = 20
): Promise<FlaggedEdit[]> {
  const key = getKey(subreddit);
  const total = await redis.llen(key);
  if (total === 0) return [];

  const start = Math.max(0, total - limit);
  const raw = await redis.lrange(key, start, -1);

  return raw
    .map((s) => {
      try { return JSON.parse(s) as FlaggedEdit; } catch { return null; }
    })
    .filter(Boolean)
    .reverse() as FlaggedEdit[];
}

/**
 * clearLogs – Removes all stored logs for a subreddit.
 */
export async function clearLogs(
  redis: RedisClient,
  subreddit: string
): Promise<void> {
  await redis.del(getKey(subreddit));
}
