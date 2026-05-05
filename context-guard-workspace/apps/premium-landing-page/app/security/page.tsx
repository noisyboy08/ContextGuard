import type { Metadata } from 'next';
import { ScrollReveal, StaggerReveal } from '@/components/animations/ScrollReveal';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security & Privacy — ContextGuard',
  description: 'ContextGuard is mod-only. No user data is stored. Everything is private, encrypted, and compliant.',
};

const PILLARS = [
  {
    title: 'Mods Only. Always.',
    desc: 'The ContextGuard dashboard is a Devvit Custom Post visible only to users with moderator privileges. Regular users cannot access it, period.',
    icon: '🔒',
  },
  {
    title: 'No Data Sold. Ever.',
    desc: 'ContextGuard stores flagged edit diffs in Devvit\'s own Redis — tied to your subreddit, not our servers. We have zero access to your data.',
    icon: '🛡️',
  },
  {
    title: 'Archive API, Not Reddit\'s Servers',
    desc: 'Original comment text is fetched from a public archive API (arctic-shift), not from private Reddit infrastructure. No special permissions required.',
    icon: '📡',
  },
  {
    title: 'Open Source',
    desc: 'ContextGuard\'s full source code is available on GitHub. Audit every line. Trust nothing you can\'t read.',
    icon: '🔍',
  },
];

const COMPLIANCE = [
  { label: 'Devvit Rules', status: 'Compliant ✓' },
  { label: 'Reddit Content Policy', status: 'Compliant ✓' },
  { label: 'GDPR (No PII stored)', status: 'Compliant ✓' },
  { label: 'Mod Log Transparency', status: 'Compliant ✓' },
];

export default function SecurityPage() {
  return (
    <div>
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse,rgba(63,185,80,0.1)_0%,transparent_70%)] blur-3xl" />
        <ScrollReveal>
          <p className="section-label mb-4">Security & Privacy</p>
          <h1 className="section-title max-w-3xl mx-auto mb-6">
            Built with <span className="gradient-text-green">mod trust</span> at the core.
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            ContextGuard sees what it needs to catch bad actors and nothing more. Here is how we protect your community's privacy.
          </p>
        </ScrollReveal>
      </section>

      {/* Pillars */}
      <section className="pb-24 px-6">
        <StaggerReveal className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p) => (
            <div key={p.title} className="glass-card p-8 flex gap-5">
              <div className="text-4xl flex-shrink-0">{p.icon}</div>
              <div>
                <h3 className="font-['Outfit'] font-700 text-lg mb-2">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* Compliance Table */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-[rgba(63,185,80,0.04)] to-transparent">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="section-label mb-4 text-center">Compliance</p>
            <h2 className="section-title text-center mb-12">Fully compliant. <span className="gradient-text-green">Fully transparent.</span></h2>
          </ScrollReveal>
          <StaggerReveal className="space-y-3">
            {COMPLIANCE.map((c) => (
              <div key={c.label} className="glass-card p-5 flex items-center justify-between">
                <span className="text-white/80 font-medium">{c.label}</span>
                <span className="text-[#3fb950] text-sm font-bold">{c.status}</span>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <ScrollReveal>
          <h2 className="section-title mb-6">Questions? Read the source.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://github.com" target="_blank" className="btn-primary">View on GitHub →</Link>
            <Link href="/get-started" className="btn-secondary">Install ContextGuard</Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
