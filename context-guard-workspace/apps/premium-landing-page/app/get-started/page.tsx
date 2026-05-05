import type { Metadata } from 'next';
import { ScrollReveal, StaggerReveal } from '@/components/animations/ScrollReveal';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Get Started — ContextGuard',
  description: 'Install ContextGuard on your Reddit subreddit in under 2 minutes. No code required.',
};

const STEPS = [
  {
    step: '1',
    title: 'Visit the App Directory',
    desc: 'Go to developers.reddit.com and search for "ContextGuard", or click the button below.',
    action: { label: 'Open App Directory', href: 'https://developers.reddit.com', external: true },
  },
  {
    step: '2',
    title: 'Click "Add to Community"',
    desc: 'Select your subreddit from the dropdown. You must be a moderator of the subreddit to install.',
    action: null,
  },
  {
    step: '3',
    title: 'Configure the Settings',
    desc: 'Open the ContextGuard settings panel and set your alert threshold (default: 30% content change). Enable ModMail alerts if desired.',
    action: null,
  },
  {
    step: '4',
    title: 'Open the Dashboard',
    desc: 'Click "🛡️ Open ContextGuard Dashboard" in your subreddit\'s mod menu. ContextGuard will create a private mod dashboard post.',
    action: null,
  },
];

const FAQ = [
  {
    q: 'Does ContextGuard work on all subreddits?',
    a: 'Yes. Any subreddit can install ContextGuard from the App Directory. You must be a moderator to install and configure it.',
  },
  {
    q: 'Does it catch every edit?',
    a: 'ContextGuard catches edits on comments that were indexed by the archive API. Very new comments (< 1 minute old) may not be archived yet.',
  },
  {
    q: 'Can regular users see the dashboard?',
    a: 'No. The dashboard is a private Devvit post. It is only visible to users with moderator permissions on that subreddit.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. ContextGuard is 100% free and open source. There is no premium tier, no subscription, no data selling.',
  },
];

export default function GetStartedPage() {
  return (
    <div>
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse,rgba(255,69,0,0.14)_0%,transparent_70%)] blur-3xl" />
        <ScrollReveal>
          <p className="section-label mb-4">Get Started</p>
          <h1 className="section-title max-w-3xl mx-auto mb-6">
            Up and running <span className="gradient-text">in 2 minutes.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            No code. No setup. Just click install and ContextGuard starts watching immediately.
          </p>
          <Link
            href="https://developers.reddit.com"
            target="_blank"
            className="btn-primary text-base inline-flex"
          >
            Install ContextGuard Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </ScrollReveal>
      </section>

      {/* Steps */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <StaggerReveal className="space-y-5">
            {STEPS.map((s) => (
              <div key={s.step} className="glass-card p-7 flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-[#ff4500] flex items-center justify-center flex-shrink-0 font-['Outfit'] font-800 text-sm shadow-[0_0_20px_rgba(255,69,0,0.4)]">
                  {s.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-['Outfit'] font-700 text-lg mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-3">{s.desc}</p>
                  {s.action && (
                    <Link
                      href={s.action.href}
                      target={s.action.external ? '_blank' : undefined}
                      className="btn-secondary text-sm py-2 px-5 inline-flex"
                    >
                      {s.action.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-[rgba(255,69,0,0.04)] to-transparent">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <p className="section-label text-center mb-4">FAQ</p>
            <h2 className="section-title text-center mb-12">Common questions.</h2>
          </ScrollReveal>
          <StaggerReveal className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="glass-card p-6">
                <h4 className="font-['Outfit'] font-600 text-base mb-2">{item.q}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto glass-card p-16 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.08)_0%,transparent_70%)]" />
            <h2 className="section-title mb-4 relative z-10">
              Your community <span className="gradient-text">deserves the truth.</span>
            </h2>
            <p className="text-white/50 mb-8 relative z-10">Install ContextGuard and give your mod team the evidence they need.</p>
            <Link href="https://developers.reddit.com" target="_blank" className="btn-primary relative z-10">
              Install Now — It's Free
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
