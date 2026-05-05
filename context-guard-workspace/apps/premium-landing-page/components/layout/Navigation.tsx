'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/security', label: 'Security' },
  { href: '/get-started', label: 'Get Started' },
];

export function Navigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.from(navRef.current, { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-500 ${
        scrolled ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-white/5' : ''
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-full bg-[#ff4500] flex items-center justify-center shadow-[0_0_20px_rgba(255,69,0,0.5)] group-hover:shadow-[0_0_30px_rgba(255,69,0,0.7)] transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
          </svg>
        </div>
        <span className="font-['Outfit'] font-700 text-[17px] tracking-tight">
          Context<span className="text-[#ff4500]">Guard</span>
        </span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/8 rounded-full px-2 py-1.5 backdrop-blur-md">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === l.href
                ? 'bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="https://developers.reddit.com"
        target="_blank"
        className="btn-primary text-sm py-2.5 px-5"
      >
        Install on Reddit
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </nav>
  );
}
