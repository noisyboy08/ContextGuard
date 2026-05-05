import type { Metadata } from 'next';
import { ScrollReveal, StaggerReveal } from '@/components/animations/ScrollReveal';
import { LiveDiffDemo } from '@/components/ui/LiveDiffDemo';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features — ContextGuard',
  description: 'Explore ContextGuard\'s real-time diffing, mod dashboard, ModMail alerts, and configurable thresholds.',
};

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-Time Detection',
    desc: 'The Devvit CommentUpdate trigger fires the moment any comment is edited. Zero polling. Zero delay.',
    color: 'rgba(255,215,0,0.15)',
    border: 'rgba(255,215,0,0.25)',
  },
  {
    icon: '🧮',
    title: 'LCS Diff Algorithm',
    desc: 'A Longest Common Subsequence algorithm calculates the exact words added or removed, word-by-word.',
    color: 'rgba(255,69,0,0.12)',
    border: 'rgba(255,69,0,0.3)',
  },
  {
    icon: '📊',
    title: 'Private Mod Dashboard',
    desc: 'A Devvit Custom Post shows a live feed of suspicious edits. Invisible to regular users. Mods only.',
    color: 'rgba(63,185,80,0.1)',
    border: 'rgba(63,185,80,0.25)',
  },
  {
    icon: '🚨',
    title: 'Erasure Edit Detection',
    desc: 'Automatically flags comments edited to "." or near-empty — the #1 ban-evasion technique on Reddit.',
    color: 'rgba(248,81,73,0.1)',
    border: 'rgba(248,81,73,0.25)',
  },
  {
    icon: '📬',
    title: 'ModMail Alerts',
    desc: 'Optional: send a structured ModMail notification when a suspicious edit is caught, with the full diff included.',
    color: 'rgba(88,166,255,0.1)',
    border: 'rgba(88,166,255,0.25)',
  },
  {
    icon: '🎛️',
    title: 'Configurable Thresholds',
    desc: 'Set the minimum % of content changed to trigger an alert. Prevent false positives from minor typo corrections.',
    color: 'rgba(180,100,255,0.1)',
    border: 'rgba(180,100,255,0.25)',
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,69,0,0.12)_0%,transparent_70%)] blur-3xl" />

        <ScrollReveal>
          <p className="section-label mb-4">Features</p>
          <h1 className="section-title max-w-3xl mx-auto mb-6">
            Everything a moderator needs to <span className="gradient-text">catch the truth.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            ContextGuard combines mathematical precision with an intuitive mod interface — built natively on Devvit.
          </p>
        </ScrollReveal>
      </section>

      {/* Feature Cards */}
      <section className="pb-24 px-6">
        <StaggerReveal className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card p-7"
              style={{ '--hover-border': f.border } as React.CSSProperties}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{ background: f.color, border: `1px solid ${f.border}` }}
              >
                {f.icon}
              </div>
              <h3 className="font-['Outfit'] font-700 text-lg mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* Live Demo */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-[rgba(255,69,0,0.04)] to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="section-label mb-4">Live Demo</p>
            <h2 className="section-title mb-4">See the diff in action.</h2>
            <p className="text-white/50 text-base mb-12">
              This is the exact same LCS algorithm running inside ContextGuard on Reddit's servers.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <LiveDiffDemo />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <ScrollReveal>
          <h2 className="section-title mb-6">Convinced?</h2>
          <Link href="/get-started" className="btn-primary">
            Install ContextGuard →
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
