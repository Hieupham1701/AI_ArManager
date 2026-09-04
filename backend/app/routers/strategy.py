"""
Strategy orchestration router.

Endpoints:
  POST /api/v1/strategy/update
  POST /api/v1/strategy/generate-reminder

All responses are deterministic mocks aligned with app.schemas.
"""

from datetime import datetime
from fastapi import APIRouter, Body, HTTPException

from app.schemas import (
    StrategyUpdateRequest,
    StrategyResult,
    GenerateReminderRequest,
    GenerateReminderResponse,
    DebtorResponse,
    Decision,
)
from app.services.strategy_service import evaluate_invoice, store_debtor_response, set_approval
from app.services.reminder_service import generate_reminder

router = APIRouter(tags=["Strategy"])


@router.post("/strategy/update", response_model=StrategyResult)
async def post_strategy_update(payload: StrategyUpdateRequest) -> StrategyResult:
    """Evaluate an invoice and return the full strategy result.

    The response includes action, channel, tone, schedule, tier, risk, etc.
    """
    # Parse due_date string — supports ISO and common human formats
    due_date = _parse_due_date(payload.due_date)

    result = evaluate_invoice(
        invoice_id=payload.invoice_id,
        due_date=due_date,
        amount=payload.amount,
    )

    return StrategyResult(**result)


@router.post("/strategy/generate-reminder", response_model=GenerateReminderResponse)
async def post_generate_reminder(payload: GenerateReminderRequest) -> GenerateReminderResponse:
    """Generate a reminder preview for the given invoice.

    This remains a deterministic preview – it does **not** send anything.
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
# New endpoints for debtor response and owner approval
# ---------------------------------------------------------------------------

@router.post("/strategy/respond", status_code=200)
async def post_debtor_response(resp: DebtorResponse) -> dict:
    """Receive structured response data from Hiếu's intelligence layer."""
    store_debtor_response(resp)
    return {"status": "ok"}

@router.post("/strategy/approve", status_code=200)
async def post_strategy_approval(
    payload: dict = Body(...),
) -> dict:
    """Owner records an approval or rejection for a given invoice strategy."""
    invoice_id = payload.get("invoice_id")
    decision_str = payload.get("decision")
    if not invoice_id or not decision_str:
        raise HTTPException(status_code=400, detail="invoice_id and decision required")
    try:
        decision = Decision(decision_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid decision value")
    set_approval(invoice_id, decision)
    return {"status": "ok"}


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
