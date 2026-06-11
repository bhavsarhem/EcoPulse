"use client";

import { signIn } from "next-auth/react";
import { Leaf, Sparkles } from "lucide-react";

export default function LoginPage() {
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
        <div className="flex flex-col items-center text-center mb-10">
          <div className="p-3.5 bg-accent-primary text-bg-secondary rounded-2xl shadow-lg shadow-accent-primary/20 mb-4">
            <Leaf className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-text-primary">
            EcoPulse
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Your footprint. Simplified.
          </p>
        </div>

        <p className="text-center text-text-secondary text-sm mb-6">
          Sign in to track your environmental impact and receive personalised eco-insights.
        </p>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          id="google-signin-btn"
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-border bg-bg-secondary text-text-primary font-semibold text-sm hover:bg-bg-tertiary hover:border-text-primary/30 transition-all shadow-sm"
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

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-text-secondary font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
          Secured with Google OAuth 2.0
        </div>
      </div>
    </div>
  );
}
