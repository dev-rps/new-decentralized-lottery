import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Lottery | On-Chain Fortune",
  description: "A permissionless, mathematically fair lottery on the Stellar network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <body className="min-h-screen flex flex-col selection:bg-brand-500/30">
        <header className="fixed top-0 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5V3"/><path d="M7 5V3"/><path d="M21 12h-2"/><path d="M5 12H3"/><path d="M17 19v2"/><path d="M7 19v2"/></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white/90 hidden sm:block">
                Nexus<span className="text-white/40">Lottery</span>
              </span>
            </div>
            
            <nav className="flex items-center gap-6">
              <a href="https://stellar.org" target="_blank" rel="noreferrer" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Stellar</a>
              <a href="https://github.com/dev-rps/new-decentralized-lottery" target="_blank" rel="noreferrer" className="text-sm font-medium text-white/50 hover:text-white transition-colors">GitHub</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 mt-20 flex flex-col items-center py-10 w-full">
          <div className="max-w-7xl w-full px-6">
            {children}
          </div>
        </main>

        <footer className="border-t border-white/5 py-8 mt-auto relative z-10 bg-background">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} Decentralized Lottery. Open Source.</p>
            <p>Powered by Soroban Smart Contracts</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
