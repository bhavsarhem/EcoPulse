"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Leaf, Sparkles, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("dev@ecopulse.org");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary overflow-hidden px-4">
      {/* Background decoration blur blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-glow/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent-secondary/15 rounded-full blur-[150px]" />

      {/* Floating leaves */}
      <div className="leaf-particle w-5 h-8 left-[10%] top-[20%]" style={{ animationDelay: "1s" }} />
      <div className="leaf-particle w-7 h-11 left-[35%] top-[60%]" style={{ animationDelay: "3s" }} />
      <div className="leaf-particle w-6 h-9 left-[70%] top-[15%]" style={{ animationDelay: "5s" }} />
      <div className="leaf-particle w-8 h-12 left-[85%] top-[50%]" style={{ animationDelay: "7s" }} />

      {/* Login Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl relative z-10 transition-all">
        {/* Logo and header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 bg-accent-primary text-bg-secondary rounded-2xl shadow-lg shadow-accent-primary/20 mb-4">
            <Leaf className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-text-primary">
            EcoPulse
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Your footprint. Simplified.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs mb-6 text-center">
            {error}
          </div>
        )}

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-border bg-bg-secondary text-text-primary font-semibold text-sm hover:bg-bg-tertiary hover:border-text-primary/30 transition-all shadow-sm mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.6 7.7l3.9 3C6.4 7.7 9 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.28c0-.8-.1-1.6-.3-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.8 3c2.2-2 3.6-5 3.6-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.5 14.3C5.3 13.6 5.2 12.8 5.2 12s.1-1.6.3-2.3l-3.9-3C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.3l3.9-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1 8-2.9l-3.8-3c-1.1.7-2.6 1.2-4.2 1.2-3 0-5.6-2.6-6.5-5.6l-3.9 3c1.8 4 5.7 7.3 10.4 7.3z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-[1px] bg-border/50 flex-grow" />
          <span className="text-xs text-text-secondary uppercase tracking-widest font-mono">
            Or Dev Mode
          </span>
          <div className="h-[1px] bg-border/50 flex-grow" />
        </div>

        {/* Developer Login Mode */}
        <form onSubmit={handleDevLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider font-mono mb-2">
              Developer Profile Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-full border border-border bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-all font-body"
              required
              placeholder="e.g. dev-user@ecopulse.org"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-accent-primary text-white hover:bg-accent-primary/95 font-semibold text-sm transition-all disabled:opacity-55 shadow-md shadow-accent-primary/10"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Launch Developer Mode
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-text-secondary font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
          Offline Sandboxed Mode Active
        </div>
      </div>
    </div>
  );
}
