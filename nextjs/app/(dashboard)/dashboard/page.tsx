"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Leaf,
  Sparkles,
  TrendingDown,
  TrendingUp,
  History,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [report, setReport] = useState<any | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch report
        const reportRes = await fetch("/api/report");
        if (!reportRes.ok) throw new Error("Failed to load carbon stats.");
        const reportData = await reportRes.json();
        setReport(reportData);

        // Fetch history
        const scansRes = await fetch("/api/history");
        if (!scansRes.ok) throw new Error("Failed to load scan history.");
        const scansData = await scansRes.json();
        setScans(scansData.slice(0, 5)); // Get top 5 recent scans
        
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-tertiary rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-bg-tertiary rounded-3xl" />
          <div className="h-32 bg-bg-tertiary rounded-3xl" />
          <div className="h-32 bg-bg-tertiary rounded-3xl" />
        </div>
        <div className="h-80 bg-bg-tertiary rounded-3xl w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-4 bg-danger/10 text-danger rounded-full mb-4">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">Something went wrong</h3>
        <p className="text-text-secondary text-sm max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-accent-primary text-white font-semibold rounded-full shadow-sm text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const userFirstName = session?.user?.name?.split(" ")[0] || "Eco Tracker";
  const comparisonPct = report?.comparison_vs_average_pct || 0;
  const totalCo2 = report?.total_co2e_kg || 0;
  const scanCount = report?.scan_count || 0;
  const savings = report?.savings_co2e_kg || 0;

  // Format Recharts data
  const chartData = report?.daily_history?.map((point: any) => ({
    name: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "CO₂e (kg)": point.co2e_kg,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Prompt to Scan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Hi, {userFirstName} 👋
          </h1>
          <p className="text-text-secondary text-sm md:text-base mt-1 font-body">
            Here is your carbon footprint breakdown for this month.
          </p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-accent-primary text-white font-semibold text-sm hover:bg-accent-primary/95 transition-all shadow-md shadow-accent-primary/10"
        >
          <PlusCircle className="w-4 h-4" />
          Scan Food or Receipt
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Footprint */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-text-secondary font-semibold">
              Total CO₂e (This Month)
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-extrabold tracking-tight text-accent-primary dark:text-accent-secondary">
                {totalCo2}
              </span>
              <span className="text-sm font-semibold text-text-secondary">kg</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border/50 text-xs text-text-secondary font-body">
            Based on <span className="font-bold text-text-primary">{scanCount} scans</span> registered.
          </div>
        </div>

        {/* Comparison vs Average */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-text-secondary font-semibold">
              Vs. Standard Footprint
            </span>
            <div className="mt-2 flex items-center gap-2">
              {comparisonPct <= 0 ? (
                <div className="flex items-baseline gap-1.5 text-success">
                  <span className="font-mono text-4xl font-extrabold tracking-tight">
                    {Math.abs(comparisonPct)}%
                  </span>
                  <span className="text-xs font-semibold uppercase font-mono">Lower</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5 text-danger">
                  <span className="font-mono text-4xl font-extrabold tracking-tight">
                    +{comparisonPct}%
                  </span>
                  <span className="text-xs font-semibold uppercase font-mono">Higher</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border/50 text-xs text-text-secondary flex items-center gap-1.5 font-body">
            {comparisonPct <= 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-success" />
                <span className="text-success font-semibold">Great job!</span> You are beat-matching average metrics.
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-danger" />
                <span className="text-danger font-semibold">Insight:</span> Meat intake & single goods increase emissions.
              </>
            )}
          </div>
        </div>

        {/* Offsets / Savings */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-text-secondary font-semibold">
              Potential Swap Savings
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-extrabold tracking-tight text-accent-primary dark:text-accent-secondary">
                {savings}
              </span>
              <span className="text-sm font-semibold text-text-secondary">kg CO₂e</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border/50 text-xs text-text-secondary flex items-center gap-1.5 font-body">
            <Leaf className="w-4 h-4 text-accent-secondary" />
            Emissions you can prevent by making simple changes.
          </div>
        </div>
      </div>

      {/* Recharts Area Trend Chart */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
          Daily Emissions Trend
          <span className="text-xs bg-accent-primary/10 text-accent-primary dark:text-accent-secondary px-2.5 py-0.5 rounded-full font-mono font-semibold">
            30 Days
          </span>
        </h3>
        
        <div className="w-full h-80 font-mono text-xs">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent-secondary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-accent-secondary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)"/>
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} />
                <YAxis stroke="var(--color-text-secondary)" tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: "var(--color-bg-secondary)", 
                    border: "1px solid var(--color-border)",
                    borderRadius: "16px",
                    fontFamily: "var(--font-dm-sans)" 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="CO₂e (kg)" 
                  stroke="var(--color-accent-secondary)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCo2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary">
              No scans logged this month.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Categories Breakdown & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-display font-bold text-lg mb-6">Emissions by Category</h3>
          <div className="space-y-4 font-body">
            {Object.entries(report?.category_breakdown || {}).map(([cat, val]: any) => {
              const totalVal = Math.max(Object.values(report?.category_breakdown || {}).reduce((a: any, b: any) => a + b, 0) as number, 1);
              const percentage = Math.round((val / totalVal) * 100);
              
              const colors: Record<string, string> = {
                food: "bg-orange-500 dark:bg-orange-600",
                transport: "bg-blue-500 dark:bg-blue-600",
                goods: "bg-accent-primary dark:bg-accent-secondary",
                energy: "bg-yellow-500 dark:bg-yellow-600"
              };
              
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-semibold">{cat}</span>
                    <span className="font-mono text-text-secondary">{val} kg ({percentage}%)</span>
                  </div>
                  <div className="h-3 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${colors[cat] || "bg-accent-primary"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Scans Feed */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Recent Activities</h3>
              <Link
                href="/history"
                className="text-xs font-semibold text-accent-primary dark:text-accent-secondary flex items-center gap-1 hover:underline"
              >
                View timeline
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {scans.length > 0 ? (
              <div className="space-y-4 font-body">
                {scans.map((scan) => (
                  <div 
                    key={scan.scan_id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-bg-primary/60 border border-border/40 hover:border-accent-primary/20 transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold capitalize">{scan.items[0]?.name || "Scan Record"}</div>
                      <div className="text-xs text-text-secondary mt-0.5 capitalize">
                        {scan.scan_type.replace("_", " ")} &bull; {new Date(scan.scan_timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        scan.carbon_tier === "low" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                        scan.carbon_tier === "medium" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                        "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}>
                        {scan.carbon_tier}
                      </span>
                      <span className="font-mono text-sm font-bold">
                        {scan.total_co2e_kg} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-text-secondary text-sm">
                No scans recorded yet. Capture something to populate.
              </div>
            )}
          </div>

          <Link
            href="/scan"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary rounded-2xl text-xs font-semibold transition-all"
          >
            <History className="w-4 h-4 text-text-secondary" />
            Analyze a new footprint
          </Link>
        </div>
      </div>
    </div>
  );
}
