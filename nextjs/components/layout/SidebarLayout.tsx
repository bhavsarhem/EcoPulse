"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import {
  Leaf,
  LayoutDashboard,
  Camera,
  History,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
  session: any;
}

export default function SidebarLayout({ children, session }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scan Photo", href: "/scan", icon: Camera },
    { name: "Scan History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary text-text-primary">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-border z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent-primary text-bg-secondary rounded-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-lg text-accent-primary dark:text-accent-secondary">
            EcoPulse
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 border border-border rounded-xl text-text-primary"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-bg-primary/95 z-30 flex flex-col justify-between p-6 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent-primary text-bg-secondary rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="font-display font-extrabold text-lg text-accent-primary dark:text-accent-secondary">
                  EcoPulse
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 border border-border rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                        : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Theme Toggle in Mobile */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-border bg-bg-secondary"
            >
              <span className="text-sm font-semibold">Color Mode</span>
              {isDark ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5 text-accent-primary" />}
            </button>

            {/* User details */}
            <div className="flex items-center gap-3 p-4 border border-border rounded-2xl bg-bg-secondary">
              <img
                src={session?.user?.image || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full border border-accent-secondary bg-bg-primary"
              />
              <div className="flex-grow overflow-hidden">
                <div className="text-sm font-bold truncate">{session?.user?.name}</div>
                <div className="text-xs text-text-secondary truncate">{session?.user?.email}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Sign Out"
                className="p-2.5 text-danger hover:bg-danger/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-bg-secondary border-r border-border p-6 min-h-screen sticky top-0 shrink-0">
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="p-2 bg-accent-primary text-bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-accent-primary dark:text-accent-secondary">
              EcoPulse
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Desktop Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                      : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme color mode"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/80 hover:bg-bg-tertiary transition-all text-xs font-semibold"
          >
            <span className="text-text-secondary uppercase tracking-widest font-mono text-[10px]">
              Theme: {theme}
            </span>
            {isDark ? (
              <Sun className="w-[16px] h-[16px] text-warning" />
            ) : (
              <Moon className="w-[16px] h-[16px] text-accent-primary" />
            )}
          </button>

          {/* Profile Section */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-bg-primary/50 overflow-hidden">
            <img
              src={session?.user?.image || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-accent-secondary/50 bg-bg-secondary"
            />
            <div className="flex-grow overflow-hidden">
              <div className="text-xs font-bold truncate leading-tight">{session?.user?.name}</div>
              <div className="text-[10px] text-text-secondary truncate leading-tight mt-0.5">
                {session?.user?.email}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign Out"
              className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-65px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
