"""
Strategy Orchestration Engine — mock implementation.

Computes deterministic collection metadata from invoice inputs:
  - days overdue
  - invoice status
  - customer risk level
  - current escalation tier
  - next scheduled action

The module is intentionally structured so that the public API
(`evaluate_invoice`) remains unchanged when Gemini / Vertex AI
replaces the deterministic heuristics later.
"""

from datetime import datetime, timedelta
from typing import List

from app.schemas import (
    InvoiceStatus,
    RiskLevel,
    CollectionStep,
    CollectionStepStatus,
    NextAction,
    Priority,
)

# ---------------------------------------------------------------------------
# Deterministic mock data — aligned with frontend/src/lib/api.ts
# ---------------------------------------------------------------------------

MOCK_DUE_DATE = datetime(2026, 6, 15)
MOCK_INVOICE_ID = "INV-2024-0847"
MOCK_CLIENT = "Northgate Medical Group"
MOCK_AMOUNT = 24750.00

_COLLECTION_TIMELINE: List[CollectionStep] = [
    CollectionStep(
        day=0,
        title="Invoice Issued",
        description="Initial invoice delivered to client billing contact via email",
        date="Jun 15, 2026",
        status=CollectionStepStatus.COMPLETED,
        icon="check",
    ),
    CollectionStep(
        day=3,
        title="Friendly Email",
        description="Courtesy payment reminder dispatched automatically",
        date="Jun 18, 2026",
        status=CollectionStepStatus.COMPLETED,
        icon="check",
    ),
    CollectionStep(
        day=7,
        title="Reminder SMS",
        description="Automated SMS notification sent to registered billing contact",
        date="Jun 22, 2026",
        status=CollectionStepStatus.ACTIVE,
        icon="message",
    ),
    CollectionStep(
        day=14,
        title="Phone Call",
        description="Personal follow-up call from accounts receivable team",
        date="Jun 29, 2026",
        status=CollectionStepStatus.PENDING,
        icon="phone",
    ),
    CollectionStep(
        day=21,
        title="Escalation Email",
        description="Formal escalation notice to management",
        date="Jul 6, 2026",
        status=CollectionStepStatus.PENDING,
        icon="alert",
    ),
    CollectionStep(
        day=30,
        title="Collections Referral",
        description="Invoice referred to external collections agency",
        date="Jul 15, 2026",
        status=CollectionStepStatus.PENDING,
        icon="clock",
    ),
]

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _days_overdue(due_date: datetime, reference: datetime) -> int:
    """Return whole days between due_date and reference (floored at 0)."""
    delta = reference - due_date
    return max(delta.days, 0)


def _escalation_tier(days_overdue: int) -> int:
    """
    Map days overdue to an escalation tier.
    Tiers are 1-based and increase as the invoice ages.
    """
    if days_overdue <= 0:
        return 1
    if days_overdue <= 7:
        return 2
    if days_overdue <= 14:
        return 3
    if days_overdue <= 30:
        return 4
    return 5


def _invoice_status(days_overdue: int, amount: float) -> InvoiceStatus:
    """
    Derive invoice status from aging and amount.
    This is a deterministic heuristic; Gemini will replace it later.
    """
    if days_overdue <= 0:
        return InvoiceStatus.PENDING
    if days_overdue <= 7:
        return InvoiceStatus.OVERDUE
    if days_overdue <= 14:
        return InvoiceStatus.IN_PROGRESS
    if days_overdue <= 30:
        return InvoiceStatus.ESCALATED
    if amount > 50000:
        return InvoiceStatus.CRITICAL
    return InvoiceStatus.ESCALATED


def _risk_level(days_overdue: int, amount: float) -> RiskLevel:
    """
    Derive customer risk level from aging and exposure.
    """
    if days_overdue <= 0:
        return RiskLevel.LOW
    if days_overdue <= 7:
        return RiskLevel.LOW
    if days_overdue <= 14:
        return RiskLevel.MEDIUM
    if days_overdue <= 30:
        return RiskLevel.HIGH
    if amount > 50000:
        return RiskLevel.CRITICAL
    return RiskLevel.HIGH


def _next_action(days_overdue: int) -> str:
    """
    Return the human-readable next action based on aging.
    """
    if days_overdue <= 0:
        return "Awaiting due date"
    if days_overdue <= 3:
        return "Friendly Email"
    if days_overdue <= 7:
        return "Reminder SMS"
    if days_overdue <= 14:
        return "Phone Call"
    if days_overdue <= 21:
        return "Escalation Email"
    if days_overdue <= 30:
        return "Final Notice"
    return "Collections Referral"


def _next_action_detail(days_overdue: int) -> NextAction:
    """
    Build a fully populated NextAction object.
    """
    action_name = _next_action(days_overdue)
    # Deterministic scheduled date = today + 1 day for mock stability
    scheduled = datetime(2026, 6, 22) + timedelta(days=1)
    return NextAction(
        action=action_name,
        scheduledDate=scheduled.strftime("%b %d, %Y"),
        scheduledTime="10:30 AM",
        workflow="Auto-Collection v2",
        priority=Priority.HIGH if days_overdue > 14 else Priority.MEDIUM,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_invoice(
    due_date: datetime,
    amount: float,
    reference_date: datetime | None = None,
) -> dict:
    """
    Evaluate an invoice and return strategy metadata.

    Returns a plain dict so the router can wrap it in
    StrategyUpdateResponse without circular imports.
    """
    ref = reference_date or datetime(2026, 6, 22)
    days = _days_overdue(due_date, ref)
    tier = _escalation_tier(days)
    status = _invoice_status(days, amount)
    risk = _risk_level(days, amount)
    action = _next_action(days)

    return {
        "days_overdue": days,
        "status": status,
        "risk_level": risk,
        "current_escalation_tier": tier,
        "next_action": action,
    }


def get_collection_timeline() -> List[CollectionStep]:
    """Return the deterministic collection timeline."""
    return list(_COLLECTION_TIMELINE)


def get_next_action(days_overdue: int) -> NextAction:
    """Return the next scheduled action for a given aging profile."""
    return _next_action_detail(days_overdue)
