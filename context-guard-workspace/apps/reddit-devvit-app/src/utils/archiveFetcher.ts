/**
 * archiveFetcher.ts – Securely fetches the original unedited text of a comment
 * from the arctic-shift archive API.
 *
 * IMPORTANT: In Devvit, all external HTTP requests must be made through
 * context.fetch (not the global fetch) and the domain must be declared
 * in devvit.yaml under `permissions: http`.
 */

const ARCHIVE_BASE = 'https://arctic-shift.photon-reddit.com';

export interface ArchivedComment {
  id: string;
  author: string;
  body: string;
  body_html?: string;
  created_utc: number;
  score: number;
  subreddit: string;
  permalink: string;
}

/**
 * fetchArchivedComment – Fetches the oldest known version of a comment from the archive.
 * Returns null if the comment is not in the archive (too recent or not indexed).
 *
 * @param commentId – The Reddit comment ID (without the "t1_" prefix)
 * @param fetchFn   – The Devvit-provided context.fetch function
 */
export async function fetchArchivedComment(
  commentId: string,
  fetchFn: typeof fetch
): Promise<ArchivedComment | null> {
  try {
    const url = `${ARCHIVE_BASE}/api/comments/search?ids=t1_${commentId}&limit=1`;
    const response = await fetchFn(url, {
      headers: { 'User-Agent': 'ContextGuard-Devvit-App/1.0' },
    });

    if (!response.ok) {
      console.error(`[ContextGuard] Archive fetch failed: ${response.status}`);
      return null;
    }

    const json = await response.json() as { data?: ArchivedComment[] };
    const items: ArchivedComment[] = Array.isArray(json)
      ? json
      : json?.data ?? [];

    return items.length > 0 ? items[0] : null;
  } catch (err) {
    console.error('[ContextGuard] Archive fetch error:', err);
    return null;
  }
}
