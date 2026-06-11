"use client";

import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [angle, setAngle] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let moveTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
      setIsMoving(true);

      // Stop scaling/tilting when mouse stops moving
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(moveTimeout);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;

        // Calculate direction angle when the mouse is moving
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          // Add 45 deg to align the diagonal SVG leaf graphic along the movement vector
          const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;
          
          setAngle((prevAngle) => {
            // Normalize angle boundary transitions
            let diff = targetAngle - prevAngle;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            return prevAngle + diff * 0.12; // smooth interpolation rate
          });
        }

        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      animationFrameId = requestAnimationFrame(updateTrail);
    };

    animationFrameId = requestAnimationFrame(updateTrail);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [position]);

  if (!visible) return null;

  return (
    <>
      {/* Trailing floating leaf vector */}
      <div
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${isMoving ? 1.15 : 0.95})`,
          transition: "transform 0.150s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
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
        className="fixed w-2 h-2 bg-accent-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-inner"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />

      {/* Ambient background blur backing */}
      <div
        className="fixed w-60 h-60 bg-accent-glow/5 rounded-full blur-[80px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
        }}
      />
    </>
  );
}
