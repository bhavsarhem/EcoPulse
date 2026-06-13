"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const trailRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trailEl = trailRef.current;
    const dotEl = dotRef.current;
    const glowEl = glowRef.current;

    if (!trailEl || !dotEl || !glowEl) return;

    let mouseX = -100;
    let mouseY = -100;
    let trailX = -100;
    let trailY = -100;
    let currentAngle = 0;
    let isMoving = false;
    let moveTimeout: NodeJS.Timeout;

    // Set initial styles for hiding
    trailEl.style.opacity = "0";
    dotEl.style.opacity = "0";
    glowEl.style.opacity = "0";

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Make visible on move
      trailEl.style.opacity = "1";
      dotEl.style.opacity = "1";
      glowEl.style.opacity = "1";

      isMoving = true;

      // Position the core dot immediately
      dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 150);
    };

    const handleMouseLeave = () => {
      trailEl.style.opacity = "0";
      dotEl.style.opacity = "0";
      glowEl.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    let animationFrameId: number;

    const tick = () => {
      const dx = mouseX - trailX;
      const dy = mouseY - trailY;

      // Smoothly interpolate trail coordinates
      trailX += dx * 0.12;
      trailY += dy * 0.12;

      // Position the ambient glow and the leaf trail
      glowEl.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        // Target angle based on direction, aligned offset 45 deg
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;

        // Interpolate angle smoothly
        let diff = targetAngle - currentAngle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        currentAngle += diff * 0.12;
      }

      const scale = isMoving ? 1.15 : 0.95;
      trailEl.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%) rotate(${currentAngle}deg) scale(${scale})`;

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(moveTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Trailing floating leaf vector */}
      <div
        ref={trailRef}
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-opacity duration-300 ease-out"
        style={{ willChange: "transform, opacity" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-accent-secondary drop-shadow-[0_2px_8px_rgba(82,183,136,0.35)]"
        >
          {/* Curved Leaf Blade */}
          <path
            d="M2 22C2 22 10 21 17 14C21 10 22 4 22 2C20 2 14 3 10 7C3 14 2 22 2 22Z"
            fill="var(--color-accent-secondary)"
            fillOpacity="0.2"
            stroke="var(--color-accent-secondary)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Midrib stem */}
          <path
            d="M2 22C4 19 8 13 14 10"
            stroke="var(--color-accent-primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Core pointer pointer dot */}
      <div
        ref={dotRef}
        className="fixed w-2 h-2 bg-accent-primary rounded-full pointer-events-none z-[9999] top-0 left-0 transition-opacity duration-300 ease-out shadow-inner"
        style={{ willChange: "transform, opacity" }}
      />

      {/* Ambient background blur backing */}
      <div
        ref={glowRef}
        className="fixed w-60 h-60 bg-accent-glow/5 rounded-full blur-[80px] pointer-events-none z-0 top-0 left-0 transition-opacity duration-500 ease-out"
        style={{ willChange: "transform, opacity" }}
      />
    </>
  );
}
