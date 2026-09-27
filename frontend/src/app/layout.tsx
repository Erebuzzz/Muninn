import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";

export const metadata: Metadata = {
  title: "Muninn | Living Memory for Engineering & Work",
  description: "Captures conversations you choose, connects decisions, tasks, and people, and resurfaces unfinished work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0d12] text-[#e6edf3] antialiased flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
        <AuthProvider>
          <AuthModal />
          <header className="border-b border-[#1c2330] bg-[#0e1219]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Muninn Raven Geometric Icon */}
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base tracking-tight text-white">Muninn</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1c2330] text-amber-400/90 border border-amber-500/20">
                    LIVING MEMORY
                  </span>
                </div>
                <p className="text-[11px] text-[#8b9bb4] hidden sm:block">
                  Capturing thought, tracking provenance, resurfacing unfinished work
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-[#8b9bb4]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] hidden md:inline">AssemblyAI Gateway</span>
              </div>
              <div className="h-4 w-[1px] bg-[#1c2330]" />
              <AuthHeaderButton />
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          <footer className="border-t border-[#1c2330] bg-[#0c0f15] py-4 px-6 text-xs text-[#8b9bb4]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span>
                  Muninn: <em className="text-white/80">You decide what gets heard. We decide what is worth remembering.</em>
                </span>
                <span className="text-[#3b4758] hidden sm:inline">•</span>
                <span className="text-[11px] text-[#5a6a84]">
                  Engineered by <a href="https://github.com/Erebuzzz" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Kshitiz Kumar</a>
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#5a6a84]">
                <span>kshitiz23kumar@gmail.com</span>
                <span>•</span>
                <span className="text-emerald-400/90">Privacy Promise: Consent First</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
