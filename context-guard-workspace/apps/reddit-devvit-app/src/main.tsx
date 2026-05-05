/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

/**
 * main.ts – ContextGuard Devvit App Entry Point.
 *
 * Registers:
 *   1. App Settings   – Moderator configuration menu.
 *   2. onCommentUpdate Trigger – The real-time edit detection engine.
 *   3. Custom Post Type – The "ContextGuard Dashboard" mod panel.
 *   4. Menu Action – "Open ContextGuard Dashboard" button in subreddit menu.
 */

import { Devvit } from '@devvit/public-api';
import { contextGuardSettings } from './config/settings.js';
import { handleCommentEdit } from './triggers/onCommentEdit.js';
import { ModDashboard } from './ui/ModDashboard.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. App Settings
// ─────────────────────────────────────────────────────────────────────────────
Devvit.addSettings(contextGuardSettings);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Permissions Required
// ─────────────────────────────────────────────────────────────────────────────
Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Comment Edit Trigger
// ─────────────────────────────────────────────────────────────────────────────
Devvit.addTrigger({
  event: 'CommentUpdate',
  onEvent: async (event, context) => {
    await handleCommentEdit(event, context);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Custom Post Type: The Mod Dashboard
// ─────────────────────────────────────────────────────────────────────────────
Devvit.addCustomPostType({
  name: 'ContextGuard Dashboard',
  description: 'A private mod-only panel showing all suspicious comment edits.',
  height: 'tall',
  render: (context) => {
    return <ModDashboard context={context} />;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Subreddit Menu Action — "Open ContextGuard Dashboard"
// Moderators click this to create (or navigate to) their dashboard post.
// ─────────────────────────────────────────────────────────────────────────────
Devvit.addMenuItem({
  label: '🛡️ Open ContextGuard Dashboard',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();

    // Check if a dashboard post already exists (stored in Redis)
    const existingPostId = await context.redis.get(`contextguard:dashboardPostId:${subreddit.name}`);

    if (existingPostId) {
      context.ui.navigateTo(`https://reddit.com/r/${subreddit.name}/comments/${existingPostId}`);
      return;
    }

    // Create a new pinned dashboard post
    const post = await context.reddit.submitPost({
      title: '🛡️ ContextGuard — Mod Edit Monitor Dashboard',
      subredditName: subreddit.name,
      preview: (
        <vstack alignment="center middle" grow>
          <text>Loading ContextGuard Dashboard…</text>
        </vstack>
      ),
    });

    // Persist the post ID so we can navigate to it next time
    await context.redis.set(`contextguard:dashboardPostId:${subreddit.name}`, post.id);

    context.ui.showToast({ text: '🛡️ ContextGuard Dashboard created!', appearance: 'success' });
    context.ui.navigateTo(post.url);
  },
});

export default Devvit;
