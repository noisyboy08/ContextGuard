/**
 * diffEngine.ts – Longest Common Subsequence (LCS) word-by-word diff algorithm.
 *
 * This is the core mathematical engine powering ContextGuard.
 * It takes two strings (original archived text vs. current edited text)
 * and produces a token-by-token array marking each word as:
 *  - 'equal'   → unchanged
 *  - 'removed' → was in the original, now deleted (shown in RED)
 *  - 'added'   → was not in the original, now present (shown in GREEN)
 */

export type DiffPart = {
  value: string;
  type: 'equal' | 'added' | 'removed';
};

/**
 * diffWords – Produces a rich diff of two strings at the word level.
 * @param oldStr - The original archived text
 * @param newStr - The current live text
 * @returns Array of DiffPart tokens
 */
export function diffWords(oldStr: string, newStr: string): DiffPart[] {
  // Split on whitespace while preserving the whitespace tokens for clean re-assembly
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);

  // Build LCS dynamic programming matrix
  const rows = oldWords.length + 1;
  const cols = newWords.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  // Traceback to reconstruct the diff
  let i = oldWords.length;
  let j = newWords.length;
  const result: DiffPart[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ value: oldWords[i - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result.unshift({ value: newWords[j - 1], type: 'added' });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result.unshift({ value: oldWords[i - 1], type: 'removed' });
      i--;
    }
  }

  return result;
}

/**
 * calculateChangePct – Calculates the percentage of content that was changed.
 * Used to check against the mod's configured threshold.
 * @param diff - Output from diffWords
 * @returns A number from 0–100 representing percentage changed
 */
export function calculateChangePct(diff: DiffPart[]): number {
  const total = diff.filter((d) => d.type !== 'equal').length + diff.filter((d) => d.type === 'equal').length;
  if (total === 0) return 0;
  const changed = diff.filter((d) => d.type !== 'equal').length;
  return Math.round((changed / total) * 100);
}

/**
 * isErasureEdit – Returns true if a comment was edited to near-empty.
 * These "." edits are the most common ban-evasion technique.
 */
export function isErasureEdit(newText: string): boolean {
  return newText.trim().length <= 3;
}
