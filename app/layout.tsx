import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecAI - American Crypto Tax Estimator',
  description: 'Estimate your crypto taxes from Solana wallet PNL. Federal and state tax estimates for American traders.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Top stripe */}
          <div className="h-2 bg-gradient-to-r from-usa-red via-white to-usa-blue" />
          
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SecAI Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-2xl font-display font-bold text-usa-navy">SecAI</h1>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Tax Estimator</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-2xl">
                <span>🇺🇸</span>
              </div>
            </div>
          </header>

          {children}

          {/* Footer */}
          <footer className="mt-auto bg-usa-navy text-white">
            <div className="h-1 bg-gradient-to-r from-usa-red via-usa-gold to-usa-blue" />
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  © 2026 SecAI · Made in America 🇺🇸
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
