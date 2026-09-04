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
    Channel,
    Tone,
    Decision,
    DebtorResponse,
    StrategyResult,
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


# ---------------------------------------------------------------------------
# Escalation tier deterministic mapping (single source of truth)
# ---------------------------------------------------------------------------

ESCALATION_TIERS = [
    {
        "tier": "day_0",
        "minimum_days_overdue": 0,
        "action": "invoice_issue",
        "channel": Channel.EMAIL,
        "tone": Tone.FRIENDLY,
        "schedule": "immediate",
    },
    {
        "tier": "day_3",
        "minimum_days_overdue": 3,
        "action": "payment_reminder",
        "channel": Channel.EMAIL,
        "tone": Tone.FRIENDLY,
        "schedule": "immediate",
    },
    {
        "tier": "day_7",
        "minimum_days_overdue": 7,
        "action": "payment_reminder",
        "channel": Channel.SMS,
        "tone": Tone.FIRM,
        "schedule": "immediate",
    },
    {
        "tier": "day_14",
        "minimum_days_overdue": 14,
        "action": "phone_call",
        "channel": Channel.PHONE,
        "tone": Tone.PROFESSIONAL,
        "schedule": "immediate",
    },
    {
        "tier": "day_21",
        "minimum_days_overdue": 21,
        "action": "escalation_email",
        "channel": Channel.EMAIL,
        "tone": Tone.PROTECTIVE,
        "schedule": "immediate",
    },
    {
        "tier": "day_30",
        "minimum_days_overdue": 30,
        "action": "collections_referral",
        "channel": Channel.EMAIL,
        "tone": Tone.LEGAL,
        "schedule": "immediate",
    },
]

def _lookup_tier(days_overdue: int) -> dict:
    """Return the tier dict for the given days overdue.

    The list is ordered by ``minimum_days_overdue``; we return the last tier
    where ``days_overdue >= minimum``.
    """
    selected = ESCALATION_TIERS[0]
    for tier in ESCALATION_TIERS:
        if days_overdue >= tier["minimum_days_overdue"]:
            selected = tier
        else:
            break
    return selected


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
# In‑memory stores for debtor responses and approval decisions
# ---------------------------------------------------------------------------

_DEBTOR_RESPONSES: dict[str, DebtorResponse] = {}
_APPROVALS: dict[str, Decision] = {}

def store_debtor_response(resp: DebtorResponse) -> None:
    """Save a debtor response for later strategy evaluation."""
    _DEBTOR_RESPONSES[resp.invoice_id] = resp

def get_debtor_response(invoice_id: str) -> DebtorResponse | None:
    return _DEBTOR_RESPONSES.get(invoice_id)

def set_approval(invoice_id: str, decision: Decision) -> None:
    _APPROVALS[invoice_id] = decision

def get_approval(invoice_id: str) -> Decision:
    return _APPROVALS.get(invoice_id, Decision.PENDING)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_invoice(
    invoice_id: str,
    due_date: datetime,
    amount: float,
    reference_date: datetime | None = None,
) -> dict:
    """Evaluate an invoice and return the full strategy metadata.

    The return dict matches the fields required by ``StrategyResult`` but is
    kept as a plain dict for the router to wrap without circular imports.
    """
    ref = reference_date or datetime(2026, 6, 22)
    days = _days_overdue(due_date, ref)
    tier_info = _lookup_tier(days)
    status = _invoice_status(days, amount)
    risk = _risk_level(days, amount)
    action = tier_info["action"]
    channel = tier_info["channel"]
    tone = tier_info["tone"]
    schedule = tier_info["schedule"]
    reasoning: str | None = None

    # Apply debtor response adjustments if present
    debtor = get_debtor_response(invoice_id)
    if debtor:
        if debtor.intent == "promise_to_pay" and debtor.promised_date:
            # ``promised_date`` may be a ``datetime``; we only need the date portion
            # in ``YYYY-MM-DD`` format to match the test expectation and UI usage.
            if isinstance(debtor.promised_date, datetime):
                schedule = debtor.promised_date.date().isoformat()
            else:
                schedule = debtor.promised_date.isoformat()
            tone = Tone.FRIENDLY
            reasoning = (
                f"Customer promise to pay on {debtor.promised_date.isoformat()}. "
                "Deferring escalation until that date."
            )
        elif debtor.intent == "financial_hardship":
            tone = Tone.PROTECTIVE
            reasoning = "Customer indicated financial hardship – using softer tone."
        elif debtor.intent == "dispute":
            action = "dispute_review"
            channel = Channel.EMAIL
            tone = Tone.PROFESSIONAL
            schedule = "immediate"
            reasoning = "Customer raised a dispute – prioritize review before escalation."
        else:
            reasoning = f"Received intent '{debtor.intent}'. No special handling defined."

    decision = get_approval(invoice_id)

    return {
        "invoice_id": invoice_id,
        "days_overdue": days,
        "status": status,
        "risk_level": risk,
        "tier": tier_info["tier"],
        "action": action,
        "channel": channel,
        "tone": tone,
        "schedule": schedule,
        "reasoning": reasoning,
        "decision": decision,
        "next_action_detail": _next_action_detail(days),  # kept for existing UI usage if needed
    }


def get_collection_timeline() -> List[CollectionStep]:
    """Return the deterministic collection timeline."""
    return list(_COLLECTION_TIMELINE)


def get_next_action(days_overdue: int) -> NextAction:
    """Return the next scheduled action for a given aging profile."""
    return _next_action_detail(days_overdue)
