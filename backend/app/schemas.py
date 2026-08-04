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
