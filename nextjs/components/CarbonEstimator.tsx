"use client";

import React, { useState, useEffect } from "react";
import { Leaf, ArrowRight, Activity, Smile, Info, Trees, Zap, Compass } from "lucide-react";

type DietType = "vegan" | "vegetarian" | "balanced" | "meat";
type TransportType = "active" | "electric" | "transit" | "petrol";

// Emission Factors (kg CO2e)
const DIET_FACTORS: Record<DietType, number> = {
  vegan: 2.0,
  vegetarian: 3.8,
  balanced: 6.5,
  meat: 12.0,
};

const TRANSPORT_FACTORS: Record<TransportType, number> = {
  active: 0.0,
  electric: 0.05,
  transit: 0.07,
  petrol: 0.18,
};

const ELECTRICITY_FACTOR = 0.4; // kg CO2e per kWh
const BENCHMARK_DAILY_CO2E = 13.0;

// Easing hook for fluid counter animations
function useAnimatedNumber(targetValue: number, duration: number = 350) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  
  useEffect(() => {
    let start: number | null = null;
    const startValue = currentValue;
    const diff = targetValue - startValue;
    
    if (diff === 0) return;
    
    let animationFrameId: number;
    
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const nextVal = startValue + diff * easeProgress;
      
      setCurrentValue(nextVal);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue]);
  
  return currentValue;
}

export default function CarbonEstimator() {
  // Estimator States
  const [diet, setDiet] = useState<DietType>("balanced");
  const [transport, setTransport] = useState<TransportType>("petrol");
  const [distance, setDistance] = useState<number>(25); // km per day
  const [electricity, setElectricity] = useState<number>(250); // kWh per month

  const [dailyFootprint, setDailyFootprint] = useState<number>(0);
  const [monthlyFootprint, setMonthlyFootprint] = useState<number>(0);
  const [comparison, setComparison] = useState<number>(0); // percent difference vs 13kg/day
  const [treesRequired, setTreesRequired] = useState<number>(0); // trees to offset per year

  // Animated counterparts for a polished user experience
  const animatedDaily = useAnimatedNumber(dailyFootprint, 350);
  const animatedMonthly = useAnimatedNumber(monthlyFootprint, 350);
  const animatedTrees = useAnimatedNumber(treesRequired, 350);
  const animatedComparison = useAnimatedNumber(comparison, 350);

  useEffect(() => {
    // Calculations
    const foodDaily = DIET_FACTORS[diet];
    const transitDaily = distance * TRANSPORT_FACTORS[transport];
    const energyDaily = (electricity / 30.0) * ELECTRICITY_FACTOR;

    const totalDaily = foodDaily + transitDaily + energyDaily;
    const totalMonthly = totalDaily * 30.5;

    // A tree absorbs ~22 kg CO2 per year
    const totalYearly = totalDaily * 365;
    const trees = Math.ceil(totalYearly / 22);

    const pctDiff = ((totalDaily - BENCHMARK_DAILY_CO2E) / BENCHMARK_DAILY_CO2E) * 100;

    setDailyFootprint(Number(totalDaily.toFixed(1)));
    setMonthlyFootprint(Number(totalMonthly.toFixed(0)));
    setComparison(Number(pctDiff.toFixed(0)));
    setTreesRequired(trees);
  }, [diet, transport, distance, electricity]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 p-1 z-10 space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
          Estimate Your Impact <span className="text-accent-secondary">Instantly</span>
        </h2>
        <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto font-body">
          Adjust the options below to calculate your estimated daily carbon footprint and see how you compare to standard benchmarks.
        </p>
      </div>

      {/* Estimator Equal-Height Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Inputs Card (7 columns) */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-[32px] flex flex-col justify-between border-accent-primary/10 h-full">
          <div className="space-y-8">
            
            {/* Step 1: Diet Type */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary dark:text-accent-secondary text-[10px]">1</span>
                Diet Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["vegan", "vegetarian", "balanced", "meat"] as DietType[]).map((type) => {
                  const icons = { vegan: "🌱", vegetarian: "🥦", balanced: "🍽️", meat: "🥩" };
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiet(type)}
                      className={`px-3 py-3.5 rounded-2xl border text-xs font-bold capitalize transition-all duration-200 flex flex-col items-center gap-1.5 hover:scale-[1.03] active:scale-[0.97] ${
                        diet === type
                          ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                          : "border-border hover:border-accent-primary/30 hover:bg-bg-tertiary/20 text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="text-lg">{icons[type]}</span>
                      <span>{type === "balanced" ? "Balanced" : type === "meat" ? "Meat Lover" : type}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-secondary italic font-body pl-6">
                {diet === "vegan" && "Purely plant-based diet. Leaves the lowest possible agricultural footprint."}
                {diet === "vegetarian" && "No meat, but includes dairy and vegetables. Moderate environmental impact."}
                {diet === "balanced" && "Average poultry, fish, and red meat intake. Typical diet metrics."}
                {diet === "meat" && "High consumption of beef and lamb. High agricultural methane footprint."}
              </p>
            </div>

            {/* Step 2: Commuting & Transport */}
            <div className="space-y-4">
              <label className="text-xs uppercase font-mono tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary dark:text-accent-secondary text-[10px]">2</span>
                Daily Commute
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["active", "electric", "transit", "petrol"] as TransportType[]).map((type) => {
                  const labels = { active: "Walk / Bike", electric: "Electric Car", transit: "Bus / Train", petrol: "Petrol Car" };
                  const icons = { active: "🚶", electric: "⚡", transit: "🚌", petrol: "🚗" };
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransport(type)}
                      className={`px-3 py-3.5 rounded-2xl border text-xs font-bold capitalize transition-all duration-200 flex flex-col items-center gap-1.5 hover:scale-[1.03] active:scale-[0.97] ${
                        transport === type
                          ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                          : "border-border hover:border-accent-primary/30 hover:bg-bg-tertiary/20 text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span className="text-lg">{icons[type]}</span>
                      <span>{labels[type]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slider */}
              <div className="pt-2 px-1">
                <div className="flex justify-between text-xs font-bold font-mono text-text-secondary mb-1">
                  <span>Distance Traveled</span>
                  <span className="text-accent-primary dark:text-accent-secondary">{distance} km / day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-[9px] font-mono text-text-secondary px-0.5 mt-1">
                  <span>0 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                  <span>75 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </div>

            {/* Step 3: Electricity */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary dark:text-accent-secondary text-[10px]">3</span>
                Monthly Household Electricity
              </label>
              <div className="px-1">
                <div className="flex justify-between text-xs font-bold font-mono text-text-secondary mb-1">
                  <span>Power Usage</span>
                  <span className="text-accent-primary dark:text-accent-secondary">{electricity} kWh / month</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={electricity}
                  onChange={(e) => setElectricity(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-[9px] font-mono text-text-secondary px-0.5 mt-1">
                  <span>0 kWh</span>
                  <span>250 kWh</span>
                  <span>500 kWh</span>
                  <span>750 kWh</span>
                  <span>1000 kWh</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-1 text-[10px] text-text-secondary font-body">
                <Info className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                <span>Electricity grids generate emissions based on regional fossil coal/gas fuel shares.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Output Results Card (5 columns) */}
        <div className="lg:col-span-5 glass-card p-6 md:p-8 rounded-[32px] border-accent-secondary/20 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-bg-secondary to-accent-primary/[0.02] h-full">
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-secondary/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent-primary/5 rounded-full blur-xl pointer-events-none" />

          <div className="space-y-6">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary font-bold block">
              Your Est. Carbon Footprint
            </span>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-6xl font-extrabold tracking-tight text-accent-primary dark:text-accent-secondary">
                {animatedDaily.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-text-secondary font-mono">kg CO₂e / day</span>
            </div>

            {/* Benchmark bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold font-mono text-text-secondary mb-1.5">
                <span>Standard Benchmark: {BENCHMARK_DAILY_CO2E} kg</span>
                <span className={comparison <= 0 ? "text-success" : "text-danger"}>
                  {comparison <= 0 ? `${Math.abs(Math.round(animatedComparison))}% Lower` : `+${Math.round(animatedComparison)}% Higher`}
                </span>
              </div>

              <div className="h-3 w-full bg-bg-tertiary rounded-full overflow-hidden relative border border-border/20">
                <div className="absolute left-[65%] top-0 bottom-0 w-0.5 bg-text-secondary/30 z-10" title="Daily Average Benchmark" />
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    comparison <= 0 ? "bg-success" : "bg-danger"
                  }`}
                  style={{ width: `${Math.min((animatedDaily / 20.0) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats & Swaps */}
          <div className="space-y-4 my-6 pt-6 border-t border-border/50">
            <div className="flex items-start gap-3.5 text-xs">
              <div className="p-1.5 bg-accent-primary/10 text-accent-primary dark:text-accent-secondary rounded-lg shrink-0">
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary">Offset Requirements</h4>
                <p className="text-text-secondary mt-0.5 leading-relaxed font-body">
                  Requires planting <span className="font-mono font-bold text-accent-primary dark:text-accent-secondary">{Math.round(animatedTrees)} mature trees</span> annually to offset your usage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-xs">
              <div className="p-1.5 bg-accent-primary/10 text-accent-primary dark:text-accent-secondary rounded-lg shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary">Monthly Total</h4>
                <p className="text-text-secondary mt-0.5 leading-relaxed font-body">
                  Accumulates to approximately <span className="font-mono font-bold text-text-primary">{Math.round(animatedMonthly)} kg CO₂e</span> per month.
                </p>
              </div>
            </div>
          </div>

          {/* Tip / Swap recommendation */}
          <div className="p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 text-xs flex gap-2">
            <Compass className="w-4.5 h-4.5 text-accent-secondary shrink-0 mt-0.5" />
            <div className="font-body text-text-secondary leading-normal">
              {comparison <= 0 ? (
                <span><strong className="text-success font-semibold">Excellent footprint!</strong> Your adjustments keep you well below national averages. Maintain local sourcing habits.</span>
              ) : (
                <span><strong className="text-warning font-semibold">Green Switch:</strong> {diet === "meat" ? "Try meat-free options or grain bowls to reduce agricultural emissions by 5kg." : "Swapping to a train or bus commute drops transit footprint significantly."}</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Full Width Call to Action Banner (aligned underneath) */}
      <div className="w-full p-6 md:p-8 rounded-[32px] bg-gradient-to-r from-accent-primary to-accent-secondary text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-accent-primary/10">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-extrabold text-lg md:text-xl tracking-tight">Ready to Track Dynamically?</h3>
          <p className="text-xs text-white/80 font-body">Simply capture meals, packages, or store receipts for real-time precise calculations.</p>
        </div>
        <a
          href="/login"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-accent-primary hover:bg-bg-primary text-xs font-bold shadow-md transition-all shrink-0 active:scale-95"
        >
          Start Carbon Tracking
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
