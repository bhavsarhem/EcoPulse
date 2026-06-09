"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Calendar,
  Leaf,
  TrendingDown,
  TrendingUp,
  Download,
  Award,
  AlertCircle
} from "lucide-react";

export default function ReportPage() {
  const { data: session } = useSession();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch("/api/report");
        if (!res.ok) throw new Error("Failed to load report data");
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchReport();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-tertiary rounded-xl" />
        <div className="h-40 bg-bg-tertiary rounded-3xl w-full" />
        <div className="h-60 bg-bg-tertiary rounded-3xl w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 text-danger border border-danger/20 rounded-3xl text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <h3 className="font-bold text-sm">Failed to generate report</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const totalCo2 = report?.total_co2e_kg || 0;
  const comparisonPct = report?.comparison_vs_average_pct || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Environmental Report</h1>
          <p className="text-text-secondary text-sm font-body mt-1">
            Custom carbon footprint overview for the period of {currentMonthName}.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-primary text-white font-semibold text-xs transition-all shadow-md shadow-accent-primary/10 hover:bg-accent-primary/95"
        >
          <Download className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {/* Hero Badge card */}
      <div className="glass-card p-8 rounded-3xl bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border-accent-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary dark:text-accent-secondary text-xs font-semibold font-mono">
            <Award className="w-3.5 h-3.5" />
            Active Green Badge
          </div>
          <h2 className="font-display text-2xl font-extrabold">
            {comparisonPct <= 0 ? "Outstanding Footprint Control!" : "Room for Improvement"}
          </h2>
          <p className="text-xs text-text-secondary max-w-md leading-relaxed font-body">
            {comparisonPct <= 0
              ? "Your average carbon emissions are below regional benchmarks. Keep opting for local food sources and sustainable options."
              : "Your carbon footprint exceeds recommended benchmarks. Focus on swapping high-carbon beef meals for poultry or plant options."}
          </p>
        </div>
        
        <div className="p-6 bg-bg-secondary border border-border rounded-2xl flex flex-col items-center justify-center shrink-0 w-44">
          <span className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">Emissions</span>
          <span className="font-mono text-3xl font-extrabold mt-1 text-accent-primary dark:text-accent-secondary">
            {totalCo2}
          </span>
          <span className="text-[10px] font-semibold text-text-secondary mt-0.5">kg CO₂e Total</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category stats */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="font-display font-bold text-lg">Category Distribution</h3>
          <div className="space-y-4 font-body">
            {Object.entries(report?.category_breakdown || {}).map(([cat, val]: any) => {
              const totalVal = Math.max(Object.values(report?.category_breakdown || {}).reduce((a: any, b: any) => a + b, 0) as number, 1);
              const percentage = Math.round((val / totalVal) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize">{cat}</span>
                    <span className="text-text-secondary">{val} kg ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-secondary rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Climate Insights */}
        <div className="glass-card p-6 rounded-3xl space-y-4 font-body">
          <h3 className="font-display font-bold text-lg">Personalized Eco Swaps</h3>
          <div className="space-y-3">
            <div className="p-3.5 bg-bg-primary/50 border border-border/60 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-accent-primary dark:text-accent-secondary">1. Meat Substitutes</span>
              <p className="text-text-secondary leading-relaxed">
                Swapping lamb/beef for poultry or legumes once a week can save up to 45kg CO₂e per month.
              </p>
            </div>
            <div className="p-3.5 bg-bg-primary/50 border border-border/60 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-accent-primary dark:text-accent-secondary">2. Avoid Glass Packaging</span>
              <p className="text-text-secondary leading-relaxed">
                Choose aluminum cans or paperboards over glass bottles. Glass has high logistics transport weight.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
