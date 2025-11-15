"""
Hi-Spectra FastAPI Application

Main entry point for the Hi-Spectra backend service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.models import HealthResponse

# Initialize FastAPI app
app = FastAPI(
    title="Hi-Spectra API",
    description="Continuous cognitive bridge for neurodivergent and trauma-affected minds",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check."""
    return HealthResponse(
        status="online",
        service="Hi-Spectra",
        version="0.1.0"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="Hi-Spectra API",
        version="0.1.0"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
