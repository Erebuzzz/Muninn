import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";
import { RavenLogo } from "@/components/brand/RavenLogo";

export const viewport: Viewport = {
  themeColor: "#06080c",
};

export const metadata: Metadata = {
  title: "Muninn | Living Memory for Engineering & Work",
  description:
    "Mythic memory architecture for engineering and work. Captures conversations, tracks ground-truth provenance, and proactively resurfaces unfinished decisions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Muninn | Living Memory for Engineering & Work",
    description:
      "Captures conversations you choose, connects decisions, tasks, and people, and resurfaces unfinished work with verifiable provenance.",
    siteName: "Muninn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06080c] text-[#e6edf3] antialiased flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
        <AuthProvider>
          <AuthModal />
          <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RavenLogo size={36} animated={true} glow={true} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base tracking-tight text-white">Muninn</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                    LIVING MEMORY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Odin&apos;s raven scouting thought, tracking provenance, resurfacing unfinished work
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] hidden md:inline">Memory Vault: Active</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800" />
              <AuthHeaderButton />
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          <footer className="border-t border-slate-800/80 bg-slate-950/90 py-4 px-6 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span>
                  Muninn: <em className="text-slate-300">You decide what gets heard. We decide what is worth remembering.</em>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="font-mono text-emerald-400/90">Privacy Promise: Consent First</span>
                <span>•</span>
                <span className="font-mono">Verifiable Provenance</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
