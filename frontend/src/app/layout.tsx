import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { ThemeProvider } from "@/lib/themeContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";
import { RavenLogo } from "@/components/brand/RavenLogo";
import { CelestialOrb } from "@/components/brand/CelestialOrb";
import { BackendStatusPill } from "@/components/common/BackendStatusPill";

import { MythicCursor } from "@/components/common/MythicCursor";
import { MythicIcon } from "@/components/common/MythicIcons";
import Link from "next/link";

export const viewport: Viewport = {
  themeColor: "#05070c",
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
    <html lang="en" className="nyx dark">
      <body className="min-h-screen antialiased flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
        <ThemeProvider>
          <AuthProvider>
            <MythicCursor />
            <AuthModal />
            <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <RavenLogo size={36} animated={true} glow={true} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">Muninn</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 dark:bg-slate-900 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                      LIVING MEMORY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block">
                    Odin&apos;s raven scouting thought, tracking provenance, resurfacing unfinished work
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2.5 sm:gap-4 text-xs">
                <Link
                  href="/docs"
                  className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-300 dark:border-slate-800 font-mono text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <MythicIcon.Book size={14} className="text-orange-500 dark:text-orange-400" />
                  <span className="hidden sm:inline">Codex Docs</span>
                </Link>
                <BackendStatusPill />
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 hidden sm:block" />
                <CelestialOrb size={34} />
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800" />
                <AuthHeaderButton />
              </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>

            <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90 py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span>
                    Muninn: <em className="text-slate-800 dark:text-slate-300">You decide what gets heard. We decide what is worth remembering.</em>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <Link href="/docs" className="hover:text-orange-600 dark:hover:text-orange-400 font-mono transition">
                    Documentation
                  </Link>
                  <span>•</span>
                  <a
                    href="https://github.com/Erebuzzz/Muninn"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-900 dark:hover:text-white transition"
                  >
                    GitHub
                  </a>
                  <span>•</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400/90">Privacy Promise</span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
