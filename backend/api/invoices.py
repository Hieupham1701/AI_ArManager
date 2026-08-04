"""
Invoice resource router.

Endpoints:
  GET /api/v1/invoices/{id}/detail
  GET /api/v1/invoices/{id}/timeline
  GET /api/v1/invoices/{id}/communications
  GET /api/v1/invoices/{id}/contact
  GET /api/v1/invoices/{id}/reminder

All responses are deterministic mocks aligned with app.schemas.
"""

from fastapi import APIRouter
from typing import List

from app.schemas import (
    InvoiceDetail,
    CollectionProgress,
    CollectionStep,
    Contact,
    CommunicationLog,
    CommunicationType,
    CommunicationStatus,
    ReminderPreview,
    InvoiceStatus,
    RiskLevel,
)
from app.services.strategy_service import (
    evaluate_invoice,
    get_collection_timeline,
    MOCK_DUE_DATE,
    MOCK_CLIENT,
    MOCK_AMOUNT,
)
from app.services.reminder_service import generate_reminder

router = APIRouter(tags=["Invoices"])

# ---------------------------------------------------------------------------
# Deterministic mock data
# ---------------------------------------------------------------------------

_MOCK_INVOICE_ID = "INV-2024-0847"

_MOCK_COMMUNICATIONS: List[CommunicationLog] = [
    CommunicationLog(
        id="COMM-001",
        type=CommunicationType.INVOICE_DELIVERY,
        title="Invoice Delivered",
        date="Jun 15, 2026",
        time="09:00 AM",
        status=CommunicationStatus.DELIVERED,
        content="Invoice INV-2024-0847 delivered to billing contact via email.",
    ),
    CommunicationLog(
        id="COMM-002",
        type=CommunicationType.EMAIL,
        title="Friendly Reminder",
        date="Jun 18, 2026",
        time="10:30 AM",
        status=CommunicationStatus.SENT,
        content="Courtesy payment reminder sent to s.mitchell@northgatemedical.com",
    ),
    CommunicationLog(
        id="COMM-003",
        type=CommunicationType.SMS,
        title="SMS Notification",
        date="Jun 22, 2026",
        time="02:15 PM",
        status=CommunicationStatus.DELIVERED,
        content="Automated SMS sent to registered billing contact (+1-555-0147).",
    ),
]

_MOCK_CONTACT = Contact(
    name="Sarah Mitchell",
    role="Billing Manager",
    email="s.mitchell@northgatemedical.com",
    phone="(555) 0147",
    lastContact="Jun 22, 2026",
    responseRate=78,
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/invoices/{invoice_id}/detail", response_model=InvoiceDetail)
async def get_invoice_detail(invoice_id: str) -> InvoiceDetail:
    """Return complete invoice summary including strategy metadata."""
    # Deterministic evaluation using the mock due date
    result = evaluate_invoice(MOCK_DUE_DATE, MOCK_AMOUNT)

    progress = CollectionProgress(
        currentStep=2,
        totalSteps=5,
        percentComplete=40,
        currentStage="Reminder SMS",
    )

    return InvoiceDetail(
        id=invoice_id,
        client=MOCK_CLIENT,
        amountDue=MOCK_AMOUNT,
        dueDate=MOCK_DUE_DATE.strftime("%b %d, %Y"),
        daysOverdue=result["days_overdue"],
        status=result["status"],
        riskLevel=result["risk_level"],
        strategy="Auto-Collection v2",
        collectionProgress=progress,
    )


@router.get("/invoices/{invoice_id}/timeline", response_model=List[CollectionStep])
async def get_invoice_timeline(invoice_id: str) -> List[CollectionStep]:
    """Return chronological collection steps for the invoice."""
    return get_collection_timeline()


@router.get("/invoices/{invoice_id}/communications", response_model=List[CommunicationLog])
async def get_invoice_communications(invoice_id: str) -> List[CommunicationLog]:
    """Return communication history for the invoice."""
    return list(_MOCK_COMMUNICATIONS)


@router.get("/invoices/{invoice_id}/contact", response_model=Contact)
async def get_invoice_contact(invoice_id: str) -> Contact:
    """Return primary billing contact for the invoice."""
    return _MOCK_CONTACT


@router.get("/invoices/{invoice_id}/reminder", response_model=ReminderPreview)
async def get_invoice_reminder(invoice_id: str) -> ReminderPreview:
    """Return a reminder preview for the invoice."""
    result = evaluate_invoice(MOCK_DUE_DATE, MOCK_AMOUNT)
    return generate_reminder(
        invoice_id=invoice_id,
        client_name=MOCK_CLIENT,
        amount_due=MOCK_AMOUNT,
        days_overdue=result["days_overdue"],
    )
