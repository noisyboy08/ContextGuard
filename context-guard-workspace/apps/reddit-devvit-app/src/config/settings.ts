import { Devvit, SettingScope } from '@devvit/public-api';

/**
 * ContextGuard – Moderator configuration settings.
 * These appear in the "App Settings" menu when a mod installs ContextGuard.
 */
export const contextGuardSettings = [
  {
    type: 'number' as const,
    name: 'minChangePct',
    label: '⚠️ Minimum Change % to Trigger Alert',
    helpText:
      'Only flag edits where this % of content was altered. 30 means "flag if 30% or more of words changed." Default: 30.',
    defaultValue: 30,
    scope: SettingScope.Installation,
  },
  {
    type: 'boolean' as const,
    name: 'alertOnDeleteToEmpty',
    label: '🚨 Flag "Erasure Edits" (edited to "." or empty)',
    helpText:
      'Always flag when a comment is edited to a single character or empty. These are almost always evasion attempts.',
    defaultValue: true,
    scope: SettingScope.Installation,
  },
  {
    type: 'boolean' as const,
    name: 'sendModMail',
    label: '📬 Send ModMail alert when flagged',
    helpText:
      'Send a ModMail notification to the mod team when ContextGuard catches a suspicious edit.',
    defaultValue: false,
    scope: SettingScope.Installation,
  },
  {
    type: 'number' as const,
    name: 'maxLogEntries',
    label: '🗃️ Max Entries in Dashboard',
    helpText:
      'Maximum number of flagged edits stored in the dashboard. Oldest entries are removed first. Default: 50.',
    defaultValue: 50,
    scope: SettingScope.Installation,
  },
];
