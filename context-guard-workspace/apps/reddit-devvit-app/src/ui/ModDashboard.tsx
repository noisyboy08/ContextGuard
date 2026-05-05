/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

/**
 * ModDashboard.tsx – The private moderator-only dashboard.
 *
 * Rendered as a Devvit Custom Post inside the subreddit.
 * Only visible to moderators (enforced by `isModerator` check).
 * Displays a real-time feed of flagged edits with Red/Green diff rendering.
 */

import { Devvit, useState, useAsync, Context } from '@devvit/public-api';
import { getLogs, clearLogs, FlaggedEdit } from '../database/logStore.js';
import { diffWords } from '../utils/diffEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: DiffLine
// Renders a single diff line in the Devvit text block.
// In Devvit Blocks, we cannot render inline colored text,
// so we render removed lines and added lines in separate blocks.
// ─────────────────────────────────────────────────────────────────────────────
function DiffLine({ original, edited }: { original: string; edited: string }) {
  const diff = diffWords(original, edited);

  const removedWords = diff
    .filter((d) => d.type === 'removed')
    .map((d) => d.value)
    .join(' ');

  const addedWords = diff
    .filter((d) => d.type === 'added')
    .map((d) => d.value)
    .join(' ');

  return (
    <vstack gap="xsmall" border="thin" borderColor="neutral-border-weak" cornerRadius="small" padding="small">
      {removedWords ? (
        <hstack gap="small" alignment="start middle">
          <text size="small" weight="bold" color="red">−</text>
          <text size="small" color="red" wrap overflow="ellipsis">
            {removedWords}
          </text>
        </hstack>
      ) : null}
      {addedWords ? (
        <hstack gap="small" alignment="start middle">
          <text size="small" weight="bold" color="green">+</text>
          <text size="small" color="green" wrap overflow="ellipsis">
            {addedWords}
          </text>
        </hstack>
      ) : null}
    </vstack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: EditCard
// Displays one flagged edit as a card in the dashboard feed.
// ─────────────────────────────────────────────────────────────────────────────
function EditCard({ entry, onSelect }: { entry: FlaggedEdit; onSelect: (e: FlaggedEdit) => void }) {
  const timeAgo = Math.round((Date.now() - entry.detectedAt) / 60000);
  const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;

  return (
    <vstack
      gap="xsmall"
      padding="medium"
      border="thin"
      borderColor={entry.isErasure ? 'red' : 'neutral-border-weak'}
      cornerRadius="medium"
      onPress={() => onSelect(entry)}
    >
      <hstack alignment="start middle" gap="small">
        <text size="small" weight="bold" color={entry.isErasure ? 'red' : 'orange'}>
          {entry.isErasure ? '🚨 ERASURE' : `⚠️ ${entry.changePct}% changed`}
        </text>
        <spacer />
        <text size="xsmall" color="secondary-plain">{timeLabel}</text>
      </hstack>

      <text size="small" weight="bold">u/{entry.author} in r/{entry.subreddit}</text>
      <text size="xsmall" color="secondary-plain" wrap overflow="ellipsis">
        Original: "{entry.originalText.slice(0, 80)}…"
      </text>
      <text size="xsmall" color="secondary-plain" wrap overflow="ellipsis">
        Edited to: "{entry.editedText.slice(0, 80)}…"
      </text>
    </vstack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: DetailView
// Full detail view for a single flagged edit with the Red/Green diff.
// ─────────────────────────────────────────────────────────────────────────────
function DetailView({ entry, onBack }: { entry: FlaggedEdit; onBack: () => void }) {
  return (
    <vstack grow gap="small" padding="medium">
      <hstack alignment="start middle" gap="small">
        <button size="small" appearance="secondary" onPress={onBack}>← Back</button>
        <text size="large" weight="bold">Edit Detail</text>
      </hstack>

      <text size="small">
        <text weight="bold">Author: </text>
        <text>u/{entry.author}</text>
      </text>
      <text size="small">
        <text weight="bold">Change: </text>
        <text color={entry.isErasure ? 'red' : 'orange'}>
          {entry.isErasure ? 'ERASURE EDIT' : `${entry.changePct}% of content altered`}
        </text>
      </text>

      <text size="small" weight="bold">Diff View (Original → Edited)</text>
      <DiffLine original={entry.originalText} edited={entry.editedText} />

      <hstack gap="small">
        <button
          size="small"
          appearance="destructive"
          onPress={async () => {
            // Opens the comment URL — moderators can then ban from the native interface.
            Devvit.context?.ui.navigateTo(entry.commentUrl);
          }}
        >
          Open Comment
        </button>
      </hstack>
    </vstack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Component: ModDashboard
// ─────────────────────────────────────────────────────────────────────────────
export function ModDashboard({ context }: { context: Context }) {
  const [selectedEntry, setSelectedEntry] = useState<FlaggedEdit | null>(null);
  const [cleared, setCleared] = useState(false);

  const { data: logs, loading, error } = useAsync(async () => {
    if (!context.subredditName) return [];
    return getLogs(context.redis, context.subredditName, 20);
  }, { depends: [cleared] });

  if (loading) {
    return (
      <vstack grow alignment="center middle">
        <text>Loading ContextGuard dashboard…</text>
      </vstack>
    );
  }

  if (error) {
    return (
      <vstack grow alignment="center middle">
        <text color="red">Error loading dashboard: {String(error)}</text>
      </vstack>
    );
  }

  if (selectedEntry) {
    return <DetailView entry={selectedEntry} onBack={() => setSelectedEntry(null)} />;
  }

  const entries = logs ?? [];

  return (
    <vstack grow gap="small" padding="medium">
      {/* Header */}
      <hstack alignment="start middle" gap="small">
        <image
          url="https://i.imgur.com/placeholder-shield.png"
          imageWidth={24}
          imageHeight={24}
          description="Shield"
        />
        <text size="xlarge" weight="bold">ContextGuard Dashboard</text>
        <spacer />
        {entries.length > 0 && (
          <button
            size="small"
            appearance="secondary"
            onPress={async () => {
              if (context.subredditName) {
                await clearLogs(context.redis, context.subredditName);
                setCleared(!cleared);
              }
            }}
          >
            Clear All
          </button>
        )}
      </hstack>

      <text size="small" color="secondary-plain">
        {entries.length === 0
          ? 'No suspicious edits flagged yet. ContextGuard is watching…'
          : `${entries.length} suspicious edit${entries.length !== 1 ? 's' : ''} flagged. Tap any entry for full diff.`}
      </text>

      {/* Feed */}
      <vstack gap="small" grow>
        {entries.length === 0 ? (
          <vstack grow alignment="center middle" gap="small">
            <text size="xxlarge">🛡️</text>
            <text size="medium" color="secondary-plain">All clear. No edits flagged.</text>
          </vstack>
        ) : (
          entries.map((entry) => (
            <EditCard key={entry.id} entry={entry} onSelect={setSelectedEntry} />
          ))
        )}
      </vstack>
    </vstack>
  );
}
