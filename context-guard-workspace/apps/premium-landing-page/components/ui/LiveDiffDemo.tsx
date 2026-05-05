'use client';

import { useState, useEffect } from 'react';

const DEMO_ORIGINAL = 'You are all a bunch of idiots and I hope this sub gets shut down permanently.';
const DEMO_EDITED = 'Great discussion everyone, thanks for the input!';

type DiffPart = { value: string; type: 'equal' | 'added' | 'removed' };

function simpleDiff(oldStr: string, newStr: string): DiffPart[] {
  const oldW = oldStr.split(' ');
  const newW = newStr.split(' ');
  const result: DiffPart[] = [];
  const maxLen = Math.max(oldW.length, newW.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= oldW.length) result.push({ value: newW[i] + ' ', type: 'added' });
    else if (i >= newW.length) result.push({ value: oldW[i] + ' ', type: 'removed' });
    else if (oldW[i] === newW[i]) result.push({ value: oldW[i] + ' ', type: 'equal' });
    else {
      result.push({ value: oldW[i] + ' ', type: 'removed' });
      result.push({ value: newW[i] + ' ', type: 'added' });
    }
  }
  return result;
}

/**
 * LiveDiffDemo – An interactive component that shows the diff animation live.
 * Used on the Features page to demonstrate ContextGuard's core capability.
 */
export function LiveDiffDemo() {
  const [revealed, setRevealed] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const diff = simpleDiff(DEMO_ORIGINAL, DEMO_EDITED);

  useEffect(() => {
    if (!revealed) return;
    setAnimStep(0);
    const timer = setInterval(() => {
      setAnimStep((s) => {
        if (s >= diff.length) { clearInterval(timer); return s; }
        return s + 1;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [revealed]);

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/8">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-white/30 text-xs ml-2 font-mono">ContextGuard · Diff Viewer</span>
      </div>

      {/* Alert badge */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[rgba(255,69,0,0.12)] border border-[rgba(255,69,0,0.25)]">
        <span className="text-[#ff4500] text-xs">🚨</span>
        <span className="text-[#ff4500] text-xs font-bold">ERASURE EDIT DETECTED · u/sneaky_troll42 · 97% changed</span>
      </div>

      {/* Original */}
      <div className="mb-3">
        <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Original (Archived)</p>
        <div className="bg-[rgba(248,81,73,0.07)] border border-[rgba(248,81,73,0.2)] rounded-lg p-3 font-mono text-sm leading-relaxed">
          <span className="text-red-400 text-xs mr-2 select-none">−</span>
          <span className="line-through text-red-400 opacity-80">{DEMO_ORIGINAL}</span>
        </div>
      </div>

      {/* Edited */}
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Edited To</p>
        <div className="bg-[rgba(63,185,80,0.07)] border border-[rgba(63,185,80,0.2)] rounded-lg p-3 font-mono text-sm leading-relaxed">
          <span className="text-green-400 text-xs mr-2 select-none">+</span>
          <span className="text-green-400">{DEMO_EDITED}</span>
        </div>
      </div>

      {/* Inline diff */}
      {revealed && (
        <div className="mb-5 p-3 border border-white/8 rounded-lg bg-white/3 font-mono text-sm leading-relaxed">
          <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Inline Diff</p>
          {diff.slice(0, animStep).map((part, i) =>
            part.type === 'removed' ? (
              <span key={i} className="diff-removed">{part.value}</span>
            ) : part.type === 'added' ? (
              <span key={i} className="diff-added">{part.value}</span>
            ) : (
              <span key={i} className="text-white/60">{part.value}</span>
            )
          )}
          {animStep < diff.length && <span className="animate-pulse">▌</span>}
        </div>
      )}

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="btn-primary w-full justify-center text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Reveal Diff Animation
        </button>
      ) : (
        <button
          onClick={() => setRevealed(false)}
          className="btn-secondary w-full justify-center text-sm"
        >
          Reset Demo
        </button>
      )}
    </div>
  );
}
