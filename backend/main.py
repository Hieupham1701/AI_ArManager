"""
Unified entrypoint for running the backend with uvicorn: `uvicorn main:app --reload`

Consolidates all routers (auth, invoices, strategy) into one FastAPI app.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_URL
from api import auth, invoices, strategy

app = FastAPI(
    title="AI Invoice Management Agent",
    description="Unified backend for auth, invoice strategy orchestration, and collection timelines.",
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
# Register Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/auth")
app.include_router(invoices.router, prefix="/api/v1")
app.include_router(strategy.router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe."""
    return {"status": "ok"}


__all__ = ["app"]
