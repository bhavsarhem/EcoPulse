"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Color Theme"
      className="p-2.5 rounded-full border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all text-text-primary flex items-center justify-center shrink-0"
    >
      {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-accent-primary" />}
    </button>
  );
}

export function HeaderButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-20 bg-bg-tertiary rounded-full animate-pulse" />
    );
  }

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full bg-accent-primary text-white hover:bg-accent-primary/95 transition-all shadow-md shadow-accent-primary/10"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full border border-accent-primary/20 hover:border-accent-primary hover:bg-accent-primary/5 transition-all text-text-primary"
    >
      Sign In
    </Link>
  );
}

export function HeroButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-14 w-52 bg-bg-tertiary rounded-full animate-pulse" />
    );
  }

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold text-md shadow-lg shadow-accent-primary/20 transition-all transform hover:-translate-y-0.5"
      >
        Go to Dashboard
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold text-md shadow-lg shadow-accent-primary/20 transition-all transform hover:-translate-y-0.5"
    >
      Start Carbon Tracking
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
