import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextJsonComponent — Render UI from JSON',
  description:
    'A secure, RSC-native JSON rendering engine for Next.js. Render dynamic UIs from JSON AST with full type safety, Server Actions support, and zero eval().',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-logo">
              <span className="navbar-logo-dot" />
              NextJsonComponent
            </Link>
            <div className="navbar-links">
              <Link href="/#features" className="navbar-link">功能特色</Link>
              <Link href="/#how-it-works" className="navbar-link">運作原理</Link>
              <Link href="/demo" className="navbar-link">Demo</Link>
            </div>
            <Link href="/demo" className="navbar-cta">開始使用 →</Link>
          </div>
        </nav>

        {children}

        <footer className="footer">
          <div className="footer-links">
            <a href="/demo" className="footer-link">Demo</a>
            <a href="/#features" className="footer-link">Features</a>
            <a href="/#how-it-works" className="footer-link">Architecture</a>
          </div>
          <p>NextJsonComponent · Built with Next.js 16 + React 19 + Zustand</p>
        </footer>
      </body>
    </html>
  );
}
