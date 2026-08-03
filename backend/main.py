"""Entrypoint for running the backend with uvicorn: `uvicorn main:app --reload`."""
from api.auth import app

__all__ = ["app"]
