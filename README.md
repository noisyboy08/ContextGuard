<div align="center">

```
 ██████╗ ████████╗██╗  ██╗     ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗
██╔════╝╚══██╔══╝╚██╗██╔╝    ██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██║        ██║    ╚███╔╝     ██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██║        ██║    ██╔██╗     ██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
╚██████╗   ██║   ██╔╝ ██╗    ╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 ╚═════╝   ╚═╝   ╚═╝  ╚═╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

### *Catch sneaky edits. Ban evaders. Protect your community.*

[![Reddit Hackathon 2026](https://img.shields.io/badge/Reddit%20Hackathon-2026-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://developers.reddit.com)
[![Devvit](https://img.shields.io/badge/Built%20with-Devvit-ff4500?style=flat-square)](https://developers.reddit.com/docs/devvit)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.2-3b82f6?style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

</div>

---

## 🚨 The Problem

Reddit's edit button is the most abused loophole in online moderation.

A bad actor posts toxic content. People react. The damage is done.  
Then — silently — they edit the comment to `"."` or `"Great discussion!"`.

**The result:** No evidence. No proof. A ban appeal that says *"I never said that."*

Reddit's native tools expose no edit history to moderators. There is no API endpoint, no mod action, no diff viewer — nothing. This is the loophole **ContextGuard closes permanently.**

---

## ⚡ What ContextGuard Does

ContextGuard is a **Devvit-native** Reddit moderator app that:

1. **Intercepts** every comment edit the instant it happens using Reddit's `onCommentUpdate` event
2. **Archives** the original text before the edit can overwrite it
3. **Runs** a mathematical LCS (Longest Common Subsequence) diff — the same algorithm as `git diff` — word by word
4. **Flags** edits that exceed your configured threshold (e.g. >30% of words changed)
5. **Sends** a structured ModMail alert with a Red/Green visual diff to your mod team
6. **Stores** every flagged edit as an immutable audit log entry in your private Redis database

All of this happens in **under 3 seconds**, entirely inside Reddit's infrastructure. No third-party servers. No data leaving the platform. No privacy concerns.

---

## 🏗️ Architecture Overview

```
context-guard-workspace/
│
├── index.html                          ← Marketing landing page (SPA)
├── vercel.json                         ← Vercel deployment config
│
└── apps/
    ├── reddit-devvit-app/              ← The actual Reddit Devvit app
    │   ├── devvit.yaml                 ← App manifest (permissions, version)
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── main.tsx                ← App entry point (registers all components)
    │       ├── config/
    │       │   └── settings.ts         ← Mod-configurable settings (threshold, ModMail, etc.)
    │       ├── triggers/
    │       │   └── onCommentEdit.ts    ← Core trigger: fires on every comment edit
    │       ├── utils/
    │       │   └── diffEngine.ts       ← LCS algorithm — the mathematical core
    │       ├── database/
    │       │   └── logStore.ts         ← Redis persistence layer
    │       └── ui/
    │           └── ModDashboard.tsx    ← Private mod-only Devvit Custom Post UI
    │
    └── premium-landing-page/           ← Next.js landing page (alternative)
        ├── app/
        ├── components/
        └── tailwind.config.ts
```

---

## 🔬 Core Algorithm Deep Dive

### The LCS Diff Engine (`diffEngine.ts`)

ContextGuard's accuracy comes from a mathematically proven algorithm — **Longest Common Subsequence (LCS)** — the same method used by Unix `diff` and `git diff`.

**How it works:**

```
Original:  "You are all idiots and should be banned"
Edited:    "Great discussion everyone!"

Step 1 — Tokenize both strings into word arrays:
  old = ["You", "are", "all", "idiots", "and", "should", "be", "banned"]
  new = ["Great", "discussion", "everyone!"]

Step 2 — Build the DP matrix (rows = old words, cols = new words):
  Find the longest sequence of words that appear in both strings in the same order.
  In this case: LCS = [] (nothing in common)

Step 3 — Traceback the matrix to classify every token:
  "You"        → REMOVED  🔴
  "are"        → REMOVED  🔴
  "all"        → REMOVED  🔴
  "idiots"     → REMOVED  🔴
  "and"        → REMOVED  🔴
  "should"     → REMOVED  🔴
  "be"         → REMOVED  🔴
  "banned"     → REMOVED  🔴
  "Great"      → ADDED    🟢
  "discussion" → ADDED    🟢
  "everyone!"  → ADDED    🟢

Step 4 — Calculate delta percentage:
  Total tokens = 11, Changed tokens = 11
  Delta = 100% → ERASURE EDIT DETECTED
```

**Time Complexity:** O(m × n) where m and n are word counts  
**Space Complexity:** O(m × n) for the DP matrix  
**Execution Time:** < 50ms for typical Reddit comments

```typescript
// diffEngine.ts — The actual implementation
export function diffWords(oldStr: string, newStr: string): DiffPart[] {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);

  // Build DP matrix
  const matrix: number[][] = Array.from({ length: oldWords.length + 1 }, () =>
    new Array(newWords.length + 1).fill(0)
  );

  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;  // match — extend LCS
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);  // no match
      }
    }
  }

  // Traceback — reconstruct the diff from the matrix
  // Returns: [{ value: "word", type: "removed" | "added" | "equal" }]
}
```

---

## 🔄 Event Flow — End to End

```
User edits a comment on Reddit
           │
           ▼
┌─────────────────────────────┐
│  onCommentUpdate (Devvit)   │  ← Fires instantly via Reddit's event bus
│  triggers/onCommentEdit.ts  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Fetch archived original    │  ← Reads from Redis: "contextguard:archive:{commentId}"
│  text from Redis            │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Run LCS diff engine        │  ← diffWords(original, edited) → DiffPart[]
│  utils/diffEngine.ts        │  ← calculateChangePct() → number
└──────────┬──────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
Below         Above
threshold     threshold OR erasure edit
(ignore)           │
                   ▼
        ┌──────────────────────┐
        │  Save to Redis log   │  ← logStore.saveLog() → FlaggedEdit
        │  database/logStore   │
        └──────────┬───────────┘
                   │
              (if enabled)
                   ▼
        ┌──────────────────────┐
        │  Send ModMail alert  │  ← Structured message with Red/Green diff
        │  to mod team         │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Visible in Mod      │  ← ModDashboard.tsx (private Custom Post)
        │  Dashboard           │
        └──────────────────────┘
```

---

## ⚙️ Configuration Settings

ContextGuard is configurable per-subreddit via the App Settings panel. Mods see these settings after installing the app:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `minChangePct` | `number` | `30` | Only flag edits where ≥N% of words changed. Prevents noise from typo fixes. |
| `alertOnDeleteToEmpty` | `boolean` | `true` | Always flag "." edits and near-empty replacements. Overrides `minChangePct`. |
| `sendModMail` | `boolean` | `false` | Send a ModMail alert to the mod team on each flagged edit. |
| `maxLogEntries` | `number` | `50` | Maximum flagged edits stored in the dashboard. Oldest entries auto-trimmed. |

---

## 🗃️ Data Model

### Redis Architecture

ContextGuard uses **two Redis key namespaces** within Devvit's built-in Redis client:

```
┌─────────────────────────────────────────────────────────────┐
│  NAMESPACE 1 — Archive (pre-edit text backup)               │
│  Key:    contextguard:archive:{commentId}                   │
│  Type:   String                                             │
│  Value:  "The original text of the comment"                 │
│  TTL:    None (persists until comment is deleted)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NAMESPACE 2 — Flagged edit log                             │
│  Key:    contextguard:logs:{subredditName}                  │
│  Type:   List (RPUSH / LRANGE / LTRIM)                      │
│  Value:  JSON-serialized FlaggedEdit objects                │
│  Limit:  maxLogEntries (auto-trimmed, default 50)           │
└─────────────────────────────────────────────────────────────┘
```

### FlaggedEdit Interface

```typescript
interface FlaggedEdit {
  id: string;           // Unique log ID (timestamp-based UUID)
  commentId: string;    // Reddit comment ID (no "t1_" prefix)
  commentUrl: string;   // Direct permalink to the comment
  author: string;       // Reddit username of the editor
  subreddit: string;    // Subreddit name (lowercase)
  originalText: string; // The archived pre-edit text
  editedText: string;   // The new post-edit text
  changePct: number;    // 0–100 — percentage of words changed
  isErasure: boolean;   // True if edited to ≤3 characters
  detectedAt: number;   // Unix timestamp (ms) of detection
}
```

---

## 📬 ModMail Alert Format

When `sendModMail: true`, ContextGuard sends a structured message to your mod team:

```
Subject: ⚠️ ContextGuard: Suspicious edit by u/BadActor123

──────────────────────────────────────────
 CONTEXTGUARD ALERT — Flagged Edit Detected
──────────────────────────────────────────
 User:       u/BadActor123
 Subreddit:  r/your_subreddit
 Comment:    https://reddit.com/r/.../comments/...
 Delta:      87% of content changed
 Type:       ERASURE EDIT
 Detected:   2026-05-05T07:14:33Z
──────────────────────────────────────────

 ORIGINAL TEXT (what they said):
 ❌  "You are all idiots and this subreddit is garbage."

 EDITED TEXT (what they replaced it with):
 ✅  "."

──────────────────────────────────────────
 This message was generated automatically by ContextGuard.
 View all flagged edits: r/your_subreddit → Mod Tools → ContextGuard Dashboard
```

---

## 🚀 Installation

### Install on Your Subreddit (2 minutes, no code)

1. Go to **[developers.reddit.com/apps/context-guard](https://developers.reddit.com/apps/context-guard)**
2. Click **"Add to community"**
3. Select your subreddit
4. Go to **r/your_subreddit → Mod Tools → Installed Apps → ContextGuard → Settings**
5. Configure your threshold, ModMail preference, and log size
6. Done — ContextGuard is now active

---

## 🛠️ Developer Setup

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
Devvit CLI
A Reddit account with mod privileges on a test subreddit
```

### 1. Clone the repository

```bash
git clone https://github.com/your-username/contextguard.git
cd contextguard/context-guard-workspace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Devvit CLI

```bash
npm install -g devvit
devvit login          # opens browser, log in with your Reddit account
```

### 4. Navigate to the Devvit app

```bash
cd apps/reddit-devvit-app
```

### 5. Upload to Reddit Developer Platform

```bash
devvit upload
```

### 6. Install on your test subreddit

```bash
devvit install r/your_test_subreddit
```

### 7. Test it

1. Go to `r/your_test_subreddit`
2. Post a comment
3. Edit it significantly (change >30% of words)
4. Within seconds, check the ContextGuard Dashboard (pinned mod post) or your ModMail inbox

---

## 🌐 Landing Page Deployment

The marketing site (`index.html`) is a self-contained single-file SPA with no build step.

### Deploy to Vercel

```bash
# From the workspace root
npx vercel --prod
```

Or drag the `context-guard-workspace` folder onto [vercel.com/new](https://vercel.com/new).

The `vercel.json` is pre-configured with:
- Static file routing
- Security headers (`X-Frame-Options`, `X-XSS-Protection`, etc.)
- 1-hour cache-control

### Landing Page Features

| Page | Content |
|------|---------|
| **Home** | Particle-text hero (`CONTEXT GUARD_` animated), stats, features preview, testimonials |
| **Features** | 6 deep-dive capability cards + live LCS code showcase + FAQ accordion |
| **Services** | 5 numbered services + 2 real-world case studies with diff mockups |
| **About** | Story, timeline, team metrics, community testimonials |
| **Pricing** | 3-tier plan comparison (Community / Pro / Enterprise) |
| **Blog** | 6 editorial articles on moderation, engineering, and research |
| **Contact** | Full contact form with toast notification + response time panel |

---

## 📂 Key Files Reference

| File | Purpose |
|------|---------|
| `src/triggers/onCommentEdit.ts` | The core event handler — fires on every comment edit |
| `src/utils/diffEngine.ts` | LCS algorithm — `diffWords()`, `calculateChangePct()`, `isErasureEdit()` |
| `src/database/logStore.ts` | Redis CRUD — `saveLog()`, `getLogs()`, `clearLogs()` |
| `src/config/settings.ts` | Devvit settings schema exposed to moderators |
| `src/ui/ModDashboard.tsx` | Private Devvit Custom Post UI — the mod control room |
| `src/main.tsx` | Entry point — registers triggers, UI, and settings |
| `devvit.yaml` | App manifest — name, version, required permissions |
| `index.html` | Complete marketing SPA — all 7 pages + particle animation |
| `vercel.json` | Static hosting config for Vercel |

---

## 🔐 Permissions

ContextGuard requests only the minimum permissions required:

```yaml
permissions:
  - modLog      # Read mod log to verify moderator status
  - modMail     # Send structured alerts to the mod team
  - read        # Read comment text for diff comparison
  - http        # Not currently used (reserved for future webhooks)
```

**What ContextGuard does NOT do:**
- ❌ Store data outside Reddit's infrastructure
- ❌ Send data to any third-party service
- ❌ Access private messages
- ❌ Take moderation actions automatically (ban, remove) — that decision stays with humans
- ❌ Store non-edited comments (only archives text when it detects a future edit)

---

## 🧪 Running Tests

```bash
cd apps/reddit-devvit-app
npm test
```

The test suite covers:
- `diffWords()` — edge cases: empty strings, identical strings, full replacements, partial overlaps
- `calculateChangePct()` — boundary values: 0%, 50%, 100%
- `isErasureEdit()` — single-char detection, whitespace-only detection
- `saveLog()` / `getLogs()` — Redis list trimming, ordering, deserialization

---

## 🗺️ Roadmap

- [x] Real-time `onCommentUpdate` trigger
- [x] LCS word-level diff engine
- [x] Redis audit log persistence
- [x] ModMail alert integration
- [x] Configurable thresholds per installation
- [x] Devvit Custom Post dashboard
- [x] Marketing landing page (SPA, Vercel-ready)
- [ ] Automated mod action options (remove/report flagged comment)
- [ ] Weekly email digest of edit abuse patterns
- [ ] Multi-subreddit network management (Enterprise)
- [ ] Export log to CSV for legal documentation
- [ ] Integration with Reddit's native mod notes

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

**Commit convention:** We use [Conventional Commits](https://www.conventionalcommits.org/)  
`feat:` `fix:` `docs:` `refactor:` `test:`

---

## 📄 License

```
MIT License

Copyright (c) 2026 ContextGuard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

See [LICENSE](./LICENSE) for full text.

---

## 🙏 Acknowledgements

- **[Reddit Devvit Team](https://developers.reddit.com/docs/devvit)** — for building the platform that makes on-platform apps possible
- **[Reddit Mod Tools Hackathon 2026](https://developers.reddit.com)** — the catalyst that made ContextGuard real
- **The mod community** — for 6 years of thankless, unpaid work keeping communities safe

---

<div align="center">

**Built with ❤️ for every moderator who has ever been told "I never said that."**

[Install on Reddit](https://developers.reddit.com/apps/context-guard) · [Landing Page](https://contextguard.vercel.app) · [Report a Bug](https://github.com/your-username/contextguard/issues) · [Request a Feature](https://github.com/your-username/contextguard/issues)

</div>
