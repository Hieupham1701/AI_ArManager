"""
Strategy orchestration router.

Endpoints:
  POST /api/v1/strategy/update
  POST /api/v1/strategy/generate-reminder

All responses are deterministic mocks aligned with app.schemas.
"""

from datetime import datetime
from fastapi import APIRouter

from app.schemas import (
    StrategyUpdateRequest,
    StrategyUpdateResponse,
    GenerateReminderRequest,
    GenerateReminderResponse,
)
from app.services.strategy_service import evaluate_invoice
from app.services.reminder_service import generate_reminder

router = APIRouter(tags=["Strategy"])


@router.post("/strategy/update", response_model=StrategyUpdateResponse)
async def post_strategy_update(payload: StrategyUpdateRequest) -> StrategyUpdateResponse:
    """
    Evaluate an invoice and return strategy metadata.

    Computes days overdue, status, risk level, escalation tier, and next action
    using deterministic heuristics. Gemini will replace the heuristics later
    without changing the API contract.
    """
    # Parse due_date string — supports ISO and common human formats
    due_date = _parse_due_date(payload.due_date)

    result = evaluate_invoice(due_date, payload.amount)

    return StrategyUpdateResponse(
        days_overdue=result["days_overdue"],
        status=result["status"],
        risk_level=result["risk_level"],
        current_escalation_tier=result["current_escalation_tier"],
        next_action=result["next_action"],
    )


@router.post("/strategy/generate-reminder", response_model=GenerateReminderResponse)
async def post_generate_reminder(payload: GenerateReminderRequest) -> GenerateReminderResponse:
    """
    Generate a reminder preview for the given invoice.

    Currently returns deterministic mock text. Gemini (gemini-2.5-flash)
    will power this endpoint later without router changes.
    """
    reminder = generate_reminder(
        invoice_id=payload.invoice_id,
        client_name=payload.client_name,
        amount_due=payload.amount_due,
        days_overdue=payload.days_overdue,
        tone=payload.tone or "professional",
    )
    return GenerateReminderResponse(reminder=reminder)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_due_date(due_date_str: str) -> datetime:
    """Best-effort parse of due_date string into a datetime object."""
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S",
        "%b %d, %Y",
        "%B %d, %Y",
        "%m/%d/%Y",
        "%d/%m/%Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(due_date_str, fmt)
        except ValueError:
            continue
    # Fallback: try ISO format with fromisoformat
    try:
        return datetime.fromisoformat(due_date_str)
    except ValueError:
        pass
    # Ultimate fallback — deterministic mock date so the endpoint never 500s
    return datetime(2026, 6, 15)
