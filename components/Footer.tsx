"use client";

import { GitHubIcon, GamepadIcon } from "@/components/icons";
import { GITHUB_URL, APP_VERSION, APP_NAME } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
            <span className="text-xs text-[var(--text-muted)]">v{APP_VERSION}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-xs"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>mapa3m</span>
            </a>
            <span className="text-[var(--border)]">•</span>
            <span className="text-xs text-[var(--text-muted)]">© {currentYear}</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[var(--border)] text-center">
          <p className="text-[10px] text-[var(--text-muted)]">
            Not affiliated with RobTop Games. Geometry Dash © RobTop Games AB.
          </p>
        </div>
      </div>
    </footer>
  );
}
