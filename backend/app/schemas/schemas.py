"""
Shared Pydantic models and enums for the Strategy Orchestration Engine.

These schemas define the API contract consumed by the frontend.
They are intentionally aligned with frontend/src/types/invoice.ts.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class InvoiceStatus(str, Enum):
    """Lifecycle states of an invoice."""
    OVERDUE = "Overdue"
    IN_PROGRESS = "In Progress"
    ESCALATED = "Escalated"
    CRITICAL = "Critical"
    PAID = "Paid"
    PENDING = "Pending"


class RiskLevel(str, Enum):
    """Customer risk classification."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CollectionStepStatus(str, Enum):
    """Status of an individual collection timeline step."""
    COMPLETED = "completed"
    ACTIVE = "active"
    PENDING = "pending"


class CommunicationType(str, Enum):
    """Channel used for a communication entry."""
    EMAIL = "email"
    SMS = "sms"
    PHONE = "phone"
    INVOICE_DELIVERY = "invoice_delivery"


class CommunicationStatus(str, Enum):
    """Delivery status of a communication entry."""
    DELIVERED = "delivered"
    SENT = "sent"
    FAILED = "failed"
    PENDING = "pending"


class ReminderStatus(str, Enum):
    """Lifecycle state of a generated reminder."""
    GENERATED = "generated"
    PENDING_APPROVAL = "pending_approval"
    SENT = "sent"


class Priority(str, Enum):
    """Priority level for scheduled actions."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DebtorIntentType(str, Enum):
    """Classification of debtor's response intent."""
    PROMISE_TO_PAY = "promise_to_pay"
    BILLING_DISPUTE = "billing_dispute"
    FINANCIAL_HARDSHIP = "financial_hardship"
    PARTIAL_PAYMENT = "partial_payment"
    NO_RESPONSE = "no_response"
    REQUEST_EXTENSION = "request_extension"


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class CollectionProgress(BaseModel):
    """Aggregated progress through the collection workflow."""
    currentStep: int
    totalSteps: int
    percentComplete: int
    currentStage: str


class InvoiceDetail(BaseModel):
    """Complete invoice summary returned by the detail endpoint."""
    id: str
    client: str
    amountDue: float
    dueDate: str
    daysOverdue: int
    status: InvoiceStatus
    riskLevel: RiskLevel
    strategy: str
    collectionProgress: CollectionProgress


class CollectionStep(BaseModel):
    """A single step on the collection timeline."""
    day: int
    title: str
    description: str
    date: str
    status: CollectionStepStatus
    icon: str = Field(
        ...,
        pattern="^(check|message|alert|clock|phone)$",
        description="Lucide icon name used by the frontend",
    )


class Contact(BaseModel):
    """Primary billing contact for a client."""
    name: str
    role: str
    email: str
    phone: str
    lastContact: str
    responseRate: int = Field(..., ge=0, le=100)


class CommunicationLog(BaseModel):
    """Historical communication record."""
    id: str
    type: CommunicationType
    title: str
    date: str
    time: str
    status: CommunicationStatus
    content: str


class ReminderPreview(BaseModel):
    """AI-generated reminder preview before approval / send."""
    sender: str = Field(..., alias="from")
    recipient: str = Field(..., alias="to")
    subject: str
    body: str
    generatedAt: str
    status: ReminderStatus

    class Config:
        populate_by_name = True


class NextAction(BaseModel):
    """Recommended next step in the collection workflow."""
    action: str
    scheduledDate: str
    scheduledTime: str
    workflow: str
    priority: Priority


class AIInsight(BaseModel):
    """Optional AI-generated strategic insight."""
    summary: str
    recommendedAction: str
    optimalContactTime: Optional[str] = None


# ---------------------------------------------------------------------------
# Strategy Request / Response Models
# ---------------------------------------------------------------------------

class StrategyUpdateRequest(BaseModel):
    """Payload accepted by POST /api/v1/strategy/update."""
    invoice_id: str
    due_date: str
    amount: float
    client_name: str
    payment_status: Optional[InvoiceStatus] = None


class StrategyUpdateResponse(BaseModel):
    """Payload returned by POST /api/v1/strategy/update."""
    days_overdue: int
    status: InvoiceStatus
    risk_level: RiskLevel
    current_escalation_tier: int
    next_action: str


class GenerateReminderRequest(BaseModel):
    """Payload accepted by POST /api/v1/strategy/generate-reminder."""
    invoice_id: str
    client_name: str
    amount_due: float
    days_overdue: int
    tone: Optional[str] = "professional"


class GenerateReminderResponse(BaseModel):
    """Payload returned by POST /api/v1/strategy/generate-reminder."""
    reminder: ReminderPreview

class InvoiceStatusAggregate(BaseModel):
    """Aggregate metrics for a specific invoice status."""
    status: InvoiceStatus
    totalAmount: float
    count: int
    averageAmount: float
class AnalyticsResponse(BaseModel):
    """Aggregated invoice metrics grouped by status."""
    byStatus: List[InvoiceStatusAggregate]
    totalAmount: float
    totalInvoices: int
    generatedAt: str


class CollectionTrendData(BaseModel):
    """Collection trend data for a single month."""
    month: str  # Format: "YYYY-MM"
    collected: float  # Total amount paid in this month
    outstanding: float  # Total unpaid invoice amounts (not including paid)


class CollectionTrendResponse(BaseModel):
    """Collection trend data grouped by month (6 months)."""
    trend: List[CollectionTrendData]
    generatedAt: str


# ---------------------------------------------------------------------------
# Debtor Response Classification Models
# ---------------------------------------------------------------------------

class DebtorResponseClassification(BaseModel):
    """Classification result from Gemini analysis of debtor response."""
    intent: DebtorIntentType
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    extracted_date: Optional[str] = None  # ISO format or natural language date
    reasoning: str  # Brief explanation of why this intent was chosen


class DebtorResponseRequest(BaseModel):
    """Payload accepted by POST /api/v1/debtor-response/submit."""
    payment_id: str  # Links to payment record
    token: str  # Token-based auth (no account required)
    response_text: str
    channel: str = "text"  # "text" or "voice"


class SuggestedNextActionResponse(BaseModel):
    """Suggested next action based on debtor's response - for owner approval."""
    classification: DebtorResponseClassification
    suggested_action: str
    suggested_priority: Priority
    reasoning: str
    requires_approval: bool = True  # Owner must approve before applying


class DebtorResponseSubmitResponse(BaseModel):
    """Payload returned by POST /api/v1/debtor-response/submit."""
    success: bool
    payment_id: str
    classification: DebtorResponseClassification
    suggested_strategy: SuggestedNextActionResponse
    message: str

