import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

def setup_cors(app: FastAPI):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    # Split by comma if there are multiple origins in the future
    origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
