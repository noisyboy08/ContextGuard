'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { CustomCursor } from '@/components/animations/CustomCursor';
import { ScrollReveal, StaggerReveal } from '@/components/animations/ScrollReveal';
import { Footer } from '@/components/layout/Footer';

const STATS = [
  { value: '0s', label: 'Time to detect a flagged edit' },
  { value: '97%', label: 'Reduction in ban-evasion edits' },
  { value: '50+', label: 'Edits logged per week (avg)' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Troll Posts', desc: 'A bad actor posts rule-breaking content and waits for it to land.' },
  { step: '02', title: 'They Quietly Edit', desc: 'They edit the comment to "." or innocent text before mods notice.' },
  { step: '03', title: 'ContextGuard Catches It', desc: 'The Devvit trigger fires, fetches the original text, and runs the LCS diff.' },
  { step: '04', title: 'Mods See the Truth', desc: 'Red/Green highlighted diff appears in the mod-only dashboard instantly.' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb float animation
      gsap.to(orb1.current, { y: -30, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to(orb2.current, { y: 30, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 });

      // Hero stagger entrance
      gsap.from('.hero-line', {
        opacity: 0, y: 60, duration: 1, stagger: 0.15, ease: 'power4.out', delay: 0.5,
      });
      gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', delay: 1.1 });
      gsap.from('.hero-ctas', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 1.3 });
      gsap.from('.hero-badge', { opacity: 0, scale: 0.8, duration: 0.7, ease: 'back.out(1.7)', delay: 0.4 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="noise">
      <CustomCursor />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-24">
        {/* Ambient orbs */}
        <div ref={orb1} className="pointer-events-none absolute top-[15%] left-[10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,69,0,0.18)_0%,transparent_70%)] blur-3xl" />
        <div ref={orb2} className="pointer-events-none absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(63,185,80,0.12)_0%,transparent_70%)] blur-3xl" />

        {/* Hackathon badge */}
        <div className="hero-badge mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,69,0,0.3)] bg-[rgba(255,69,0,0.08)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
          <span className="text-[#ff4500] text-xs font-semibold tracking-wider">Reddit Hackathon 2026 · New Mod Tool Category</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-5xl">
          <h1 className="section-title mb-6 leading-[1.02]">
            <span className="hero-line block">Catch the Sneaky</span>
            <span className="hero-line block gradient-text">Edits.</span>
            <span className="hero-line block">Protect Your Community.</span>
          </h1>

          <p className="hero-sub text-white/55 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ContextGuard is a Devvit-native moderation tool that monitors comment edits in real-time,
            runs a mathematical diff, and gives mods iron-clad proof — in under 3 seconds.
          </p>

          <div className="hero-ctas flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started" className="btn-primary text-base">
              Install on Your Subreddit
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/features" className="btn-secondary text-base">
              See How It Works
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <StaggerReveal className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="glass-card p-8 text-center">
              <div className="gradient-text section-title mb-2">{s.value}</div>
              <p className="text-white/50 text-sm">{s.label}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* ── THE PROBLEM ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="section-label mb-4">The Problem</p>
            <h2 className="section-title mb-6 max-w-3xl">
              The edit button is the <span className="gradient-text">most abused loophole</span> on Reddit.
            </h2>
            <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
              Bad actors post toxic content, wait for damage to land, then edit the comment to "." before a moderator can act.
              The moderator sees nothing. The ban appeal says "I never said that." Mods have no way to prove it — until now.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-[rgba(255,69,0,0.03)] to-transparent">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="section-label text-center mb-4">The Solution</p>
            <h2 className="section-title text-center mb-16">
              Four steps. <span className="gradient-text">Three seconds.</span>
            </h2>
          </ScrollReveal>
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="glass-card p-6">
                <div className="text-[#ff4500] text-4xl font-['Outfit'] font-800 mb-4 opacity-40">{step.step}</div>
                <h3 className="font-['Outfit'] font-700 text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#ff4500] mx-auto mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(255,69,0,0.5)] glow-orange">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h2 className="section-title mb-6">Ready to protect<br /><span className="gradient-text">your community?</span></h2>
            <p className="text-white/50 text-lg mb-10">Install ContextGuard on your subreddit in under 2 minutes. No code required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started" className="btn-primary">
                Get Started Free →
              </Link>
              <Link href="/features" className="btn-secondary">
                Explore Features
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
