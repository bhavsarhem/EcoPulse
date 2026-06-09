"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import {
  Settings,
  Sun,
  Moon,
  Camera,
  Download,
  Trash2,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme, isDark } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Export GDPR user data
  const handleExportData = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch export data");
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ecopulse-export-${session?.user?.email?.split("@")[0] || "user"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setLoadingExport(false);
    }
  };

  // Delete all user scans (simulate account deletion)
  const handleDeleteAccount = async () => {
    const confirmation1 = confirm("WARNING: This will permanently delete your entire scan history from EcoPulse. Are you sure?");
    if (!confirmation1) return;
    
    const confirmation2 = confirm("Please confirm one more time. This action is IRREVERSIBLE.");
    if (!confirmation2) return;

    setLoadingDelete(true);
    try {
      // Fetch all user scans to delete them one by one
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to read scans history");
      const scans = await res.json();
      
      for (const scan of scans) {
        await fetch(`/api/history?scanId=${scan.scan_id}`, { method: "DELETE" });
      }

      alert("Your scan history has been successfully purged. Signing you out.");
      signOut({ callbackUrl: "/login" });
    } catch (err: any) {
      alert("Purge failed: " + err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Customize themes, manage WebRTC camera states, and export personal data records.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-border/50 font-body">
        {/* Toggle Theme */}
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-accent-secondary" /> : <Sun className="w-4 h-4 text-warning" />}
              Appearance Mode
            </h3>
            <p className="text-xs text-text-secondary">Toggle between light and dark modes.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-5 py-2.5 rounded-full border border-border bg-bg-primary hover:bg-bg-tertiary transition-all text-xs font-semibold"
          >
            Switch to {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Notifications */}
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-primary dark:text-accent-secondary" />
              Monthly Aggregations
            </h3>
            <p className="text-xs text-text-secondary">Simulate email alerts when monthly summaries are calculated.</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              notifications
                ? "bg-accent-primary text-white"
                : "border border-border bg-bg-primary text-text-secondary"
            }`}
          >
            {notifications ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Camera permission helper */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent-primary dark:text-accent-secondary" />
              Camera Permissions
            </h3>
            <p className="text-xs text-text-secondary max-w-md">
              Need to reset browser permissions? Follow these steps to grant camera access.
            </p>
          </div>
          <a
            href="https://support.google.com/chrome/answer/2693767"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center px-5 py-2.5 rounded-full border border-border bg-bg-primary hover:bg-bg-tertiary transition-all text-xs font-semibold font-mono"
          >
            Permissions Guide
          </a>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-border/50 font-body">
        {/* GDPR Export */}
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Download className="w-4 h-4 text-success" />
              Export Personal Data (GDPR)
            </h3>
            <p className="text-xs text-text-secondary">Download a complete JSON file containing all your carbon scan items.</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={loadingExport}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-success text-white hover:bg-success/90 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {loadingExport ? "Exporting..." : "Download JSON"}
          </button>
        </div>

        {/* Deletion of account */}
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2 text-danger">
              <Trash2 className="w-4 h-4" />
              Purge Scan History
            </h3>
            <p className="text-xs text-text-secondary">Permanently delete all your carbon items and activities from storage.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={loadingDelete}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-danger text-white hover:bg-danger/90 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loadingDelete ? "Purging..." : "Purge All"}
          </button>
        </div>
      </div>

      {/* Info Badge */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-text-secondary font-mono">
        <ShieldCheck className="w-4 h-4 text-success" />
        Zero-Trust Session: user-isolated sandbox storage active.
      </div>
    </div>
  );
}
