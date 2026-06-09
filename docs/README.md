# EcoPulse

> The pulse of your personal sustainability.

EcoPulse helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights. It eliminates manual input friction by letting users photograph their meals, receipts, or product labels and instantly receive a detailed carbon footprint analysis.

---

## 🏗️ Architecture Overview

The system consists of two primary services:
1. **Next.js Frontend & Gateway** (`nextjs/`): A React-based web application with NextAuth.js (supporting Google Sign-In and local Dev Bypass), Tailwind CSS styling, responsive layouts, WebRTC camera interface, and data proxy routes.
2. **Python API Services** (`python/`): A FastAPI application handling rate limiting, request validation, image preprocessing (EXIF stripping, resizing, compression), Gemini Vision analysis (via Vertex AI or local mock pipeline), and data pipeline management (BigQuery inserting or local persistent JSON database).

---

## 🎨 UI/UX Theme

EcoPulse uses a **"Clean Earth Tech"** design system tailored for a premium developer/consumer experience:
- Typography: Display titles in `Syne`, body text in `DM Sans`, and statistics/logs in `JetBrains Mono`.
- Harmonious color scheme: Sleek forest green accents, warm sand background colors, and a full dark mode interface.
- Glassmorphic card styling, count-up numbers, and leaf particle floating animations.

---

## 🔐 Security Standards

- **Zero-Trust Token Checks**: NextAuth handles user session identity. API proxies verify session state and propagate user scopes as authorization tokens to Python APIs.
- **Magic Bytes Validation**: File uploads enforce type constraints checking binary file signatures (JPEG, PNG, WEBP).
- **Metadata Protection**: Strips EXIF markers from uploaded photos on the server side prior to external API analysis.
- **Sliding-Window Rate Limiting**: Limiters restrict requests to 20 scans per hour and 200 scans per day per user profile.
