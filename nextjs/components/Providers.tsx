"use client";

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Generate/retrieve persistent device ID
    let deviceId = localStorage.getItem("ecopulse_device_id");
    
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    
    const cookieDeviceId = getCookie("device_id");
    if (!deviceId && cookieDeviceId) {
      deviceId = cookieDeviceId;
      localStorage.setItem("ecopulse_device_id", deviceId);
    } else if (deviceId && !cookieDeviceId) {
      // Restore cookie from localStorage
      document.cookie = `device_id=${deviceId}; path=/; max-age=315360000; SameSite=Lax; Secure`;
    } else if (!deviceId && !cookieDeviceId) {
      // Create new device ID
      deviceId = "dev-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
      localStorage.setItem("ecopulse_device_id", deviceId);
      document.cookie = `device_id=${deviceId}; path=/; max-age=315360000; SameSite=Lax; Secure`;
    }

    // 2. DevTools / Inspect Mode blocker (Active in production to protect app integrity)
    if (process.env.NODE_ENV === "production") {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener("contextmenu", handleContextMenu);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) ||
          (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
          (e.metaKey && e.altKey && (e.key === "I" || e.key === "i"))
        ) {
          e.preventDefault();
        }
      };
      document.addEventListener("keydown", handleKeyDown);

      const checkDevTools = () => {
        const t1 = performance.now();
        debugger;
        const t2 = performance.now();
        if (t2 - t1 > 100) {
          document.body.innerHTML = `
            <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#0D1117;color:#E74C3C;font-family:sans-serif;text-align:center;padding:20px;">
              <h1 style="font-size:28px;margin-bottom:10px;">Security Warning</h1>
              <p style="font-size:18px;color:#8B949E;">Developer tools/Inspect Mode is disabled on EcoPulse to protect the integrity of the application.</p>
            </div>
          `;
        }
      };
      const interval = setInterval(checkDevTools, 1000);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
        clearInterval(interval);
      };
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
