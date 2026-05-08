"use client";

import Image from "next/image";
import { GitHubIcon, HeartIcon, BookIcon, AlertCircleIcon } from "@/components/icons";
import { GITHUB_URL, APP_VERSION } from "@/lib/constants";

interface FooterLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}

function FooterLink({ href, icon, label, external = true }: FooterLinkProps): React.ReactElement {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
    >
      <span className="w-3.5 h-3.5 inline-flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t-2 border-[var(--border)] bg-[var(--bg-secondary)]/40">
      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent"
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <Image
              src="/logo.svg"
              alt="GDEX Logo"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="gd-title text-sm text-[var(--text-primary)]">GDEX</div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Extract and export Geometry Dash levels in seconds.
              </p>
              <div className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
                v{APP_VERSION}
              </div>
            </div>
          </div>

          <div>
            <div className="gd-title text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Project
            </div>
            <div className="flex flex-col gap-2">
              <FooterLink
                href={GITHUB_URL}
                icon={<GitHubIcon className="w-3.5 h-3.5" />}
                label="Source on GitHub"
              />
              <FooterLink
                href={`${GITHUB_URL}/issues`}
                icon={<AlertCircleIcon className="w-3.5 h-3.5" />}
                label="Report an issue"
              />
              <FooterLink
                href={`${GITHUB_URL}#readme`}
                icon={<BookIcon className="w-3.5 h-3.5" />}
                label="Documentation"
              />
            </div>
          </div>

          <div>
            <div className="gd-title text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Support
            </div>
            <div className="flex flex-col gap-2">
              <FooterLink
                href="#boosty-placeholder"
                icon={<HeartIcon className="w-3.5 h-3.5 text-pink-500" />}
                label="Support on Boosty"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1">
                Hosting and bandwidth aren&apos;t free. Every contribution keeps GDEX online.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-[var(--text-muted)] text-center sm:text-left">
            Not affiliated with RobTop Games. Geometry Dash © RobTop Games AB.
          </p>
          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
            <span>© {currentYear} mapa3m</span>
            <span className="text-[var(--border)]">·</span>
            <span className="inline-flex items-center gap-1">
              Made with <HeartIcon className="w-3 h-3 text-pink-500" /> for the GD community
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
