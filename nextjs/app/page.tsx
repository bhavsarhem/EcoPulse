import Link from "next/link";
import { Leaf, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { HeaderButton, HeroButton } from "@/components/HeaderActions";
import CarbonEstimator from "@/components/CarbonEstimator";
import CursorGlow from "@/components/CursorGlow";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col bg-bg-primary text-text-primary px-4 md:px-8 py-6">
      {/* Interactive Cursor Glow & Spring Trail */}
      <CursorGlow />

      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-glow/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] bg-accent-secondary/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating leaves (CSS animation) */}
      <div className="leaf-particle w-6 h-10 left-[12%] top-[8%]" style={{ animationDelay: "0s" }} />
      <div className="leaf-particle w-8 h-12 left-[48%] top-[4%]" style={{ animationDelay: "2.5s" }} />
      <div className="leaf-particle w-5 h-8 left-[72%] top-[10%]" style={{ animationDelay: "5s" }} />
      <div className="leaf-particle w-7 h-11 left-[88%] top-[22%]" style={{ animationDelay: "7.5s" }} />

      {/* Header Navigation */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 border-b border-border/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-accent-primary text-bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/25">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-accent-primary dark:text-accent-secondary">
            EcoPulse
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#estimator" className="text-xs font-semibold text-text-secondary hover:text-text-primary hover:underline transition-all">
            Estimator
          </a>
          <HeaderButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto z-10 pt-10 md:pt-16 pb-20 flex-grow">
        <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          
          {/* Main Hero Card: Heading and Description */}
          <div className="space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/15 text-accent-primary dark:text-accent-secondary font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider mx-auto">
              <Sparkles className="w-4 h-4 text-accent-secondary animate-pulse" />
              Gemini 2.0 Flash Multimodal AI Enabled
            </div>
            
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-text-primary tracking-tight leading-none">
              Your footprint. <br />
              <span className="text-accent-primary dark:text-accent-secondary bg-clip-text">Simplified.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-body">
              Reduce friction. Simply snap photos of your meals, receipts, or products and receive real-time carbon weights and eco-friendly swap recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HeroButton />
              <a
                href="#estimator"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all font-semibold shadow-sm text-md text-text-primary"
              >
                Quick Estimate
              </a>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-8 pt-6 w-full max-w-xl mx-auto border-t border-border/30 justify-center">
              <div className="text-center">
                <div className="font-mono text-xl md:text-2xl font-extrabold text-accent-primary dark:text-accent-secondary">~5x</div>
                <div className="text-[10px] text-text-secondary font-body uppercase font-bold tracking-wider mt-0.5">Salmon vs Beef</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-xl md:text-2xl font-extrabold text-accent-primary dark:text-accent-secondary">100%</div>
                <div className="text-[10px] text-text-secondary font-body uppercase font-bold tracking-wider mt-0.5">Secure OCR</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-xl md:text-2xl font-extrabold text-accent-primary dark:text-accent-secondary">22 kg</div>
                <div className="text-[10px] text-text-secondary font-body uppercase font-bold tracking-wider mt-0.5">Annual Tree absorption</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Carbon Estimator */}
        <section id="estimator" className="pt-20 scroll-mt-6">
          <CarbonEstimator />
        </section>
      </main>

      {/* Rich Footer */}
      <footer className="w-full mt-24 border-t border-border/30 pt-16 pb-8 z-10 bg-bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 font-body">
          {/* Column 1: Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent-primary text-bg-secondary rounded-lg">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-accent-primary dark:text-accent-secondary">
                EcoPulse
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Empowering individuals to understand, track, and reduce their carbon footprint through smart Gemini AI vision scans and personalized swap recommendations.
            </p>
            <div className="flex items-center gap-3 pt-2 text-text-secondary">
              <a href="#" className="hover:text-accent-primary transition-colors" aria-label="EcoPulse GitHub">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <span className="text-[10px] bg-accent-primary/10 text-accent-primary dark:text-accent-secondary px-2.5 py-0.5 rounded-full font-mono font-semibold">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Column 2: Tools */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Platform</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link href="/login" className="hover:text-accent-primary hover:underline">
                  AI Image Scanner
                </Link>
              </li>
              <li>
                <a href="#estimator" className="hover:text-accent-primary hover:underline">
                  Carbon Estimator
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-accent-primary hover:underline">
                  Personal Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-accent-primary hover:underline">
                  Scan History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Resources</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <a href="https://www.ipcc.ch/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary hover:underline">
                  IPCC Databases
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-primary hover:underline">
                  Emissions Methodology
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-primary hover:underline">
                  Green Alternatives
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent-primary hover:underline">
                  Support Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Weekly Insights</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Subscribe to get seasonal eco-swap summaries, carbon stats, and updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="green@ecopulse.org"
                required
                className="px-3.5 py-2 w-full text-xs bg-bg-primary border border-border rounded-xl focus:outline-none focus:border-accent-primary font-semibold text-text-primary"
              />
              <button
                type="button"
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shrink-0 active:scale-95"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-border/30 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-text-secondary px-4 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <span>&copy; 2026 EcoPulse. Engineered with <Heart className="w-3 h-3 text-danger inline animate-pulse" /> for sustainable habits.</span>
            <span className="hidden md:inline text-border">|</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Zero-Trust Privacy</span>
            </div>
          </div>
          <div className="flex gap-4 font-mono text-[10px] items-center">
            <span className="text-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              API Connected
            </span>
            <span className="text-text-secondary">Vertex AI Regionalized (asia-south1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
