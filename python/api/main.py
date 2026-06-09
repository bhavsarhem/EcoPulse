import os
import sys

# Add the parent directory of this file to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
from fastapi import FastAPI

# Load environmental variables
load_dotenv()

from api.routes import health, scan, report
from api.middleware.cors import setup_cors

app = FastAPI(
    title="EcoPulse API Backend",
    description="Backend AI Scanning & Data Analytics Service for EcoPulse",
    version="1.0.0"
)

# Setup CORS
setup_cors(app)

# Include API Routers
app.include_router(health.router, tags=["Health"])
app.include_router(scan.router, prefix="/api", tags=["Scanning & History"])
app.include_router(report.router, prefix="/api", tags=["Reports"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to EcoPulse API Services",
        "docs_url": "/docs",
        "health_check": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
