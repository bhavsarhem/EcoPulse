"use client";
import Swal from "sweetalert2";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Leaf,
  Utensils,
  FileText,
  Package,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Filter
} from "lucide-react";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Expanded items state: {scan_id: boolean}
  const [expandedScans, setExpandedScans] = useState<Record<string, boolean>>({});

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to retrieve scan history.");
      const data = await res.json();
      setScans(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const toggleExpand = (scanId: string) => {
    setExpandedScans((prev) => ({
      ...prev,
      [scanId]: !prev[scanId],
    }));
  };

  const handleDelete = async (scanId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to permanently delete this scan record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const res = await fetch(`/api/history?scanId=${scanId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete record.");
      
      // Update local state
      setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
      
      Swal.fire({
        title: "Deleted!",
        text: "Scan record has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: "Error deleting record: " + err.message,
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-tertiary rounded-xl" />
        <div className="h-14 bg-bg-tertiary rounded-2xl w-full" />
        <div className="space-y-4">
          <div className="h-20 bg-bg-tertiary rounded-2xl w-full" />
          <div className="h-20 bg-bg-tertiary rounded-2xl w-full" />
          <div className="h-20 bg-bg-tertiary rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-4 bg-danger/10 text-danger rounded-full mb-4">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">Failed to load history</h3>
        <p className="text-text-secondary text-sm max-w-md mb-6">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-6 py-2.5 bg-accent-primary text-white font-semibold rounded-full shadow-sm text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter logic
  const filteredScans = scans.filter((scan) => {
    const matchesType = typeFilter === "all" || scan.scan_type === typeFilter;
    const matchesTier = tierFilter === "all" || scan.carbon_tier === tierFilter;
    return matchesType && matchesTier;
  });

  const getScanIcon = (type: string) => {
    switch (type) {
      case "meal":
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case "receipt":
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Package className="w-4 h-4 text-accent-secondary" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Activity History</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Review and manage your past carbon footprints and alternatives.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row gap-4 items-center justify-between font-body">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          {/* Scan Type */}
          <div className="flex flex-col gap-1 w-full sm:w-40">
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-secondary font-bold">
              Activity Type
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-bg-primary border border-border rounded-xl focus:outline-none focus:border-accent-primary font-semibold text-text-primary"
            >
              <option value="all">All Types</option>
              <option value="meal">Meals Only</option>
              <option value="receipt">Receipts Only</option>
              <option value="product_label">Product Labels</option>
            </select>
          </div>

          {/* Carbon Tier */}
          <div className="flex flex-col gap-1 w-full sm:w-40">
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-secondary font-bold">
              Impact Level
            </span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-bg-primary border border-border rounded-xl focus:outline-none focus:border-accent-primary font-semibold text-text-primary"
            >
              <option value="all">All Levels</option>
              <option value="low">Low Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="high">High Impact</option>
              <option value="very_high">Very High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scans Timeline list */}
      {filteredScans.length > 0 ? (
        <div className="space-y-4 font-body">
          {filteredScans.map((scan) => {
            const isExpanded = !!expandedScans[scan.scan_id];
            
            return (
              <div 
                key={scan.scan_id}
                className="glass-card rounded-3xl overflow-hidden transition-all duration-200 border-border/80"
              >
                {/* Header Row (Summary) */}
                <div 
                  onClick={() => toggleExpand(scan.scan_id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-bg-tertiary/20 transition-all gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-bg-tertiary rounded-2xl shadow-sm shrink-0">
                      {getScanIcon(scan.scan_type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-base capitalize truncate">
                        {scan.items[0]?.name || "Scan Result"}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(scan.scan_timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm md:text-base text-text-primary">
                        {scan.total_co2e_kg} kg
                      </div>
                      <span className={`inline-block text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border mt-1 ${
                        scan.carbon_tier === "low" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                        scan.carbon_tier === "medium" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                        "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}>
                        {scan.carbon_tier}
                      </span>
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <div className="p-6 border-t border-border/50 bg-bg-primary/20 space-y-6">
                    {/* Explanation */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary font-bold">
                        Analysis details
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {scan.explanation}
                      </p>
                    </div>

                    {/* Items Breakdown list */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary font-bold">
                        Items
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scan.items.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-bg-secondary border border-border/40 rounded-2xl text-xs">
                            <div className="flex justify-between font-bold">
                              <span>{item.name} ({item.estimated_quantity})</span>
                              <span className="font-mono text-text-secondary">{item.co2e_kg} kg</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-text-secondary mt-1.5 font-mono">
                              <span>Confidence: {item.confidence}</span>
                              <span>Source: {item.data_source}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Swaps */}
                    {scan.green_alternatives.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary font-bold flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5 text-accent-secondary" />
                          Recommended Eco Swaps
                        </span>
                        <div className="space-y-2.5">
                          {scan.green_alternatives.map((alt: any, idx: number) => (
                            <div key={idx} className="p-3.5 border border-success/20 bg-success/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                              <div>
                                <span className="text-xs font-bold text-success">{alt.swap}</span>
                                <p className="text-[10px] text-text-secondary mt-0.5 leading-normal">{alt.reason}</p>
                              </div>
                              <span className="font-mono text-xs font-bold text-success bg-success/15 px-2.5 py-1 rounded-full shrink-0">
                                Save -{alt.savings_co2e_kg} kg
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Controls */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleDelete(scan.scan_id)}
                        className="flex items-center gap-1.5 text-xs text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 px-4 py-2 rounded-xl font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Scan Record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card py-20 text-center flex flex-col items-center justify-center gap-4 rounded-3xl font-body">
          <div className="p-4 bg-bg-tertiary text-text-secondary rounded-full">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-md">No scans match filters</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-[240px] leading-relaxed">
              We couldn't find any activities matching your selections. Try modifying your filter criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
