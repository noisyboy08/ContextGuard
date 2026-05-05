import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { SmoothScrollProvider } from '@/utils/SmoothScrollProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'ContextGuard — Catch the Sneaky Edits',
  description:
    'The first Devvit-native mod tool that detects and diffs malicious comment edits on Reddit in real time. Built for the Reddit Mod Tools Hackathon 2026.',
  openGraph: {
    title: 'ContextGuard — Catch the Sneaky Edits',
    description: 'Real-time comment edit diffing for Reddit moderators. Built on Devvit.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-[#0a0a0f] text-white overflow-x-hidden">
        <SmoothScrollProvider>
          <Navigation />
          <main>{children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
