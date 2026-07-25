"""
FastAPI application entry point for the Strategy Orchestration Engine.

Exposes mock endpoints under /api/v1 so the frontend can develop
independently of database and AI integrations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import invoices, strategy

app = FastAPI(
    title="AI Invoice Management Agent — Strategy Engine",
    description="Mock backend for invoice strategy orchestration, collection timelines, and reminder generation.",
    version="0.1.0",
)

# CORS — permissive for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(invoices.router, prefix="/api/v1")
app.include_router(strategy.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe."""
    return {"status": "ok"}
