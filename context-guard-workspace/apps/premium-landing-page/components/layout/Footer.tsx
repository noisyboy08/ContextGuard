import Link from 'next/link';

const LINKS = [
  { section: 'Product', items: [
    { label: 'Features', href: '/features' },
    { label: 'Security', href: '/security' },
    { label: 'Get Started', href: '/get-started' },
  ]},
  { section: 'Resources', items: [
    { label: 'Devvit Docs', href: 'https://developers.reddit.com/docs' },
    { label: 'GitHub', href: '#' },
    { label: 'Hackathon', href: 'https://mod-tools-migration.devpost.com' },
  ]},
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-32 px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#ff4500] flex items-center justify-center shadow-[0_0_20px_rgba(255,69,0,0.4)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className="font-['Outfit'] font-700 text-[17px]">
                Context<span className="text-[#ff4500]">Guard</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Built for the Reddit Mod Tools & Migrated Apps Hackathon 2026.<br />
              Empowering moderators with mathematical proof.
            </p>
          </div>

          {/* Link groups */}
          {LINKS.map((group) => (
            <div key={group.section}>
              <p className="section-label mb-4">{group.section}</p>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-white/50 hover:text-white text-sm transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/25 text-xs">© 2026 ContextGuard. Built with Devvit on Reddit Developer Platform.</p>
          <p className="text-white/25 text-xs">MIT License · Open Source</p>
        </div>
      </div>
    </footer>
  );
}
