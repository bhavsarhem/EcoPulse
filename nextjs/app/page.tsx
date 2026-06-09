import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowRight, Sparkles, ShieldAlert, BarChart3 } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between bg-bg-primary text-text-primary px-4 md:px-8 py-6">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-glow/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-secondary/15 rounded-full blur-[150px]" />

      {/* Floating leaves (CSS only) */}
      <div className="leaf-particle w-6 h-10 left-[15%] top-[10%]" style={{ animationDelay: "0s" }} />
      <div className="leaf-particle w-8 h-12 left-[45%] top-[5%]" style={{ animationDelay: "2s" }} />
      <div className="leaf-particle w-5 h-8 left-[75%] top-[12%]" style={{ animationDelay: "4s" }} />
      <div className="leaf-particle w-7 h-11 left-[85%] top-[25%]" style={{ animationDelay: "6s" }} />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-primary text-bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-accent-primary dark:text-accent-secondary">
            EcoPulse
          </span>
        </div>
        <Link 
          href="/login" 
          className="text-sm font-semibold px-5 py-2.5 rounded-full border border-accent-primary/20 hover:border-accent-primary hover:bg-accent-primary/5 transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Body */}
      <main className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/10 mb-8 text-accent-primary font-mono text-xs font-semibold uppercase tracking-wider animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
          Gemini 2.0 Flash Multimodal AI Enabled
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight leading-none mb-6">
          Your footprint. <br/>
          <span className="text-accent-primary dark:text-accent-secondary bg-clip-text">Simplified.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed font-body">
          Eliminate friction. Simply snap photos of your meals, store receipts, or product labels, and receive real-time carbon breakdowns and eco-friendly swap recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold text-md shadow-lg shadow-accent-primary/20 transition-all transform hover:-translate-y-0.5"
          >
            Start Carbon Tracking
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all"
          >
            How it works
          </a>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24 text-left">
          <div className="glass-card p-6 rounded-3xl transition-all hover:border-accent-primary/30">
            <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Photo-Based Scanning</h3>
            <p className="text-text-secondary text-sm font-body">
              Take photos of meals, store bills, or packages. Gemini Vision instantly analyzes the carbon weights.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl transition-all hover:border-accent-primary/30">
            <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl w-fit mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Weekly & Monthly Trends</h3>
            <p className="text-text-secondary text-sm font-body">
              Monitor daily emission trends and view data breakdown by categories like Food, Transport, and Goods.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl transition-all hover:border-accent-primary/30">
            <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl w-fit mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Green Alternatives</h3>
            <p className="text-text-secondary text-sm font-body">
              Get customized swap options showing exact carbon savings (kg CO₂e) to build sustainable habits.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-text-secondary border-t border-border/50 pt-6 mt-12 z-10">
        <div>&copy; 2026 EcoPulse. Powered by Gemini & Vertex AI.</div>
        <div className="flex gap-4 mt-2 md:mt-0 font-mono">
          <span className="text-success">● API Online</span>
          <span>Security Guaranteed</span>
        </div>
      </footer>
    </div>
  );
}
