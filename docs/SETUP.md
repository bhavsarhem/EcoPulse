# EcoPulse Local Setup Guide

Follow these steps to run EcoPulse locally for evaluation.

---

## 🐍 1. Python API Backend Service

The backend utilizes FastAPI to handle image preprocessing, rate limiting, and carbon estimation.

### Prerequisites
- Python 3.10+
- pip

### Installation & Run
1. Navigate to the `python/` directory:
   ```bash
   cd python
   ```
2. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the uvicorn API server:
   ```bash
   python api/main.py
   ```
   The backend API will start at `http://localhost:8000`. You can access the API interactive documentation at `http://localhost:8000/docs`.

---

## ⚡ 2. Next.js Frontend App

The frontend is built with React 19, TypeScript, and Tailwind CSS.

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm

### Installation & Run
1. Navigate to the `nextjs/` directory:
   ```bash
   cd nextjs
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 🧪 3. Evaluation Walkthrough

1. Open `http://localhost:3000` in your web browser.
2. Click **Start Carbon Tracking** or **Sign In** to navigate to the login page.
3. In **Developer Mode**, enter any email (e.g. `dev@ecopulse.org`) and click **Launch Developer Mode**. This will bypass OAuth setups and log you in.
4. On the **Scan Photo** tab, you can open your webcam or drag-and-drop sample pictures of foods, store receipts, or product packaging.
5. Watch the real-time breakdown, green alternatives recommendations, and see how your monthly stats dashboard graphs instantly update.
