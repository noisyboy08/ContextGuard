/**
 * onCommentEdit.ts – The core Devvit event trigger.
 *
 * This fires on EVERY comment edit in any subreddit where ContextGuard is installed.
 * It orchestrates the diff pipeline:
 *   1. Get the new (edited) text from the event.
 *   2. Fetch the original text from the archive.
 *   3. Run the LCS diff.
 *   4. If suspicious, save to Redis + optionally send ModMail.
 */

import { CommentUpdate, Context } from '@devvit/public-api';
import { fetchArchivedComment } from '../utils/archiveFetcher.js';
import { diffWords, calculateChangePct, isErasureEdit } from '../utils/diffEngine.js';
import { saveLog, FlaggedEdit } from '../database/logStore.js';

export async function handleCommentEdit(
  event: CommentUpdate,
  context: Context
): Promise<void> {
  const { comment, subreddit } = event;
  if (!comment || !subreddit) return;

  // --- Read settings configured by the mod ---
  const minChangePct = (await context.settings.get<number>('minChangePct')) ?? 30;
  const alertOnErasure = (await context.settings.get<boolean>('alertOnDeleteToEmpty')) ?? true;
  const sendModMail = (await context.settings.get<boolean>('sendModMail')) ?? false;
  const maxLogEntries = (await context.settings.get<number>('maxLogEntries')) ?? 50;

  const commentId = comment.id.replace('t1_', '');
  const editedText = comment.body ?? '';

  // --- Fast path: Erasure edits (edited to ".") ---
  const erasure = isErasureEdit(editedText);
  if (!alertOnErasure && erasure) return;

  // --- Fetch original from archive ---
  const archived = await fetchArchivedComment(commentId, context.fetch);
  if (!archived) {
    // Comment not in archive yet (too new) — skip silently
    return;
  }

  const originalText = archived.body ?? '';

  // --- Run the diff ---
  const diff = diffWords(originalText, editedText);
  const changePct = erasure ? 100 : calculateChangePct(diff);

  // --- Apply threshold check ---
  const shouldFlag = erasure || changePct >= minChangePct;
  if (!shouldFlag) return;

  // --- Build the log entry ---
  const entry: FlaggedEdit = {
    id: `${Date.now()}-${commentId}`,
    commentId,
    commentUrl: `https://reddit.com${comment.permalink}`,
    author: comment.authorName ?? '[unknown]',
    subreddit: subreddit.name,
    originalText,
    editedText,
    changePct,
    isErasure: erasure,
    detectedAt: Date.now(),
  };

  // --- Persist to Redis ---
  await saveLog(context.redis, entry, maxLogEntries);

  console.log(
    `[ContextGuard] Flagged edit by u/${entry.author} in r/${entry.subreddit} — ${changePct}% changed`
  );

  // --- Optional: Send ModMail ---
  if (sendModMail) {
    const subject = erasure
      ? `🚨 ContextGuard: Erasure edit detected by u/${entry.author}`
      : `⚠️ ContextGuard: Suspicious edit (${changePct}% changed) by u/${entry.author}`;

    const body = [
      `**ContextGuard Alert**`,
      `User: u/${entry.author}`,
      `Comment: ${entry.commentUrl}`,
      ``,
      `**Original Text:**`,
      `> ${originalText.slice(0, 400)}`,
      ``,
      `**Edited To:**`,
      `> ${editedText.slice(0, 400)}`,
      ``,
      `*${changePct}% of content was changed.*`,
      `Open the ContextGuard Dashboard to take action.`,
    ].join('\n');

    try {
      await context.reddit.sendPrivateMessage({
        to: `r/${subreddit.name}`,
        subject,
        text: body,
      });
    } catch (e) {
      console.error('[ContextGuard] ModMail send failed:', e);
    }
  }
}
