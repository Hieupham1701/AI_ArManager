from datetime import datetime, timezone
import logging
from typing import Any, Literal, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from api.auth import get_current_user, supabase
from app.services.communication_sender import DeliveryError, send_outbound
from app.services.message_generator import generate_message_draft
from app.services.message_validator import MessageValidationError, validate_outbound_message


router = APIRouter(tags=["communications"])
logger = logging.getLogger(__name__)


class CommunicationResponse(BaseModel):
    id: str
    clientId: str
    invoiceId: str
    direction: str
    channel: str
    timestamp: str
    sender: str
    senderType: str
    senderInitials: str
    senderLabel: str
    subject: Optional[str] = None
    body: str
    intent: Optional[str] = None
    status: Optional[str] = None
    isRead: bool


class CommunicationClientResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    initials: str
    invoice: str
    invoiceId: str
    amount: float
    daysOverdue: int


class CommunicationPayload(BaseModel):
    clientId: str
    invoiceId: str
    channel: Literal["email", "sms"]
    body: str
    subject: Optional[str] = None
    intent: Optional[str] = None
    senderType: Literal["client", "AI", "human"] = "human"
    senderName: Optional[str] = None
    senderInitials: Optional[str] = None
    senderLabel: Optional[str] = None


class DraftReplyContext(BaseModel):
    sender: Optional[str] = None
    body: Optional[str] = None
    intent: Optional[str] = None


class CommunicationDraftPayload(BaseModel):
    """Input contract for message generation.

    Hùng's strategy output can provide ``action``, ``channel`` and ``tone``
    without changing the Communications send endpoint.
    """

    clientId: str
    invoiceId: str
    action: str = "send_reminder"
    channel: Literal["email", "sms"]
    tone: Literal["friendly", "professional", "firm"] = "friendly"
    replyTo: Optional[DraftReplyContext] = None


class CommunicationDraftResponse(BaseModel):
    channel: Literal["email", "sms"]
    tone: str
    action: str
    subject: Optional[str] = None
    body: str
    provider: str
    isCompliant: bool
    violations: list[str]


class CommunicationBootstrapResponse(BaseModel):
    clients: list[CommunicationClientResponse]
    messages: list[CommunicationResponse]


class MarkCommunicationsReadPayload(BaseModel):
    communicationIds: list[str] = Field(min_length=1, max_length=100)


def _database_for(current: dict):
    """Use the caller JWT so all queries remain protected by Supabase RLS."""
    return supabase.postgrest.auth(current["token"])


def _initials(value: str) -> str:
    words = [word for word in value.strip().split() if word]
    if not words:
        return ""
    if len(words) == 1:
        return words[0][:2].upper()
    return f"{words[0][0]}{words[-1][0]}".upper()


def _to_response(row: dict, client: dict, invoice_id: str) -> CommunicationResponse:
    sender_name = row.get("sender_name") or client.get("contact_person") or ""
    sender_type = str(row.get("sender_type") or "")

    return CommunicationResponse(
        id=str(row["communication_id"]),
        clientId=str(client["client_id"]),
        invoiceId=invoice_id,
        direction=str(row.get("direction") or ""),
        channel=str(row.get("channel") or ""),
        timestamp=str(row.get("created_at") or ""),
        sender=sender_name,
        senderType=sender_type,
        senderInitials=row.get("sender_initials") or _initials(sender_name),
        senderLabel=row.get("sender_label") or sender_type,
        subject=row.get("subject"),
        body=row.get("message") or "",
        intent=row.get("intent"),
        status=row.get("status"),
        isRead=bool(row.get("is_read", False)),
    )


def _current_user_sender(current: dict) -> str:
    user = current["user"]
    metadata = getattr(user, "user_metadata", None) or {}
    return str(metadata.get("business_name") or getattr(user, "email", None) or "")


def _load_client_and_invoice(payload: CommunicationDraftPayload, current: dict) -> tuple[dict[str, Any], dict[str, Any]]:
    """Load draft context through the caller JWT so RLS still applies."""
    owner_id = str(current["user"].id)
    database = _database_for(current)
    client_result = (
        database.table("clients")
        .select("client_id, company_name, contact_person, email, phone")
        .eq("client_id", payload.clientId)
        .eq("owner_id", owner_id)
        .execute()
    )
    if not client_result.data:
        raise HTTPException(status_code=404, detail="Client not found")

    invoice_result = (
        database.table("invoices")
        .select("invoice_id, client_id, invoice_number, amount, days_overdue, due_date")
        .eq("invoice_id", payload.invoiceId)
        .eq("client_id", payload.clientId)
        .execute()
    )
    if not invoice_result.data:
        raise HTTPException(status_code=404, detail="Invoice not found for this client")

    client = cast(dict[str, Any], client_result.data[0])
    invoice = cast(dict[str, Any], invoice_result.data[0])
    return client, invoice


def _build_client_summaries(
    client_by_id: dict[str, dict[str, Any]],
    invoices: list[dict[str, Any]],
) -> list[CommunicationClientResponse]:
    invoices_by_client: dict[str, list[dict[str, Any]]] = {}
    for invoice in invoices:
        invoices_by_client.setdefault(str(invoice["client_id"]), []).append(invoice)

    response: list[CommunicationClientResponse] = []
    for client_id, client in client_by_id.items():
        client_invoices = invoices_by_client.get(client_id, [])
        if not client_invoices:
            continue

        invoice = max(
            client_invoices,
            key=lambda item: (
                int(item.get("days_overdue") or 0),
                str(item.get("created_at") or ""),
            ),
        )
        company = client.get("company_name") or ""
        response.append(
            CommunicationClientResponse(
                id=client_id,
                name=company,
                email=client.get("email") or "",
                phone=client.get("phone") or "",
                initials=_initials(company),
                invoice=str(invoice.get("invoice_number") or ""),
                invoiceId=str(invoice["invoice_id"]),
                amount=float(invoice.get("amount") or 0),
                daysOverdue=int(invoice.get("days_overdue") or 0),
            )
        )
    return response


def _build_message_responses(
    client_by_id: dict[str, dict[str, Any]],
    invoice_by_id: dict[str, dict[str, Any]],
    rows: list[dict[str, Any]],
) -> list[CommunicationResponse]:
    response: list[CommunicationResponse] = []
    for row in rows:
        invoice_id = str(row["invoice_id"])
        invoice = invoice_by_id.get(invoice_id)
        if not invoice:
            continue
        client = client_by_id.get(str(invoice["client_id"]))
        if not client:
            continue
        response.append(_to_response(row, client, invoice_id))
    return response


def _load_communication_context(
    current: dict,
) -> tuple[Any, dict[str, dict[str, Any]], dict[str, dict[str, Any]], list[dict[str, Any]]]:
    """Load the client/invoice context with one joined Supabase query."""
    owner_id = str(current["user"].id)
    database = _database_for(current)
    invoices_result = (
        database.table("invoices")
        .select(
            "invoice_id, client_id, invoice_number, amount, days_overdue, due_date, created_at, "
            "clients!inner(client_id, company_name, contact_person, email, phone, owner_id)"
        )
        .eq("clients.owner_id", owner_id)
        .execute()
    )
    joined_invoices = cast(list[dict[str, Any]], invoices_result.data or [])
    invoices: list[dict[str, Any]] = []
    client_by_id: dict[str, dict[str, Any]] = {}
    for joined_invoice in joined_invoices:
        client = joined_invoice.get("clients")
        if not isinstance(client, dict):
            continue
        client_id = str(client["client_id"])
        client_by_id[client_id] = client
        invoices.append(
            {key: value for key, value in joined_invoice.items() if key != "clients"}
        )

    invoice_by_id = {str(invoice["invoice_id"]): invoice for invoice in invoices}
    return database, client_by_id, invoice_by_id, invoices


@router.get("/clients", response_model=list[CommunicationClientResponse])
def list_communication_clients(
    current: dict = Depends(get_current_user),
) -> list[CommunicationClientResponse]:
    """Return the client/invoice summary required by the Communications UI."""
    owner_id = str(current["user"].id)
    database = _database_for(current)

    try:
        clients_result = (
            database.table("clients")
            .select("client_id, company_name, email, phone")
            .eq("owner_id", owner_id)
            .execute()
        )
        clients = cast(list[dict[str, Any]], clients_result.data or [])
        if not clients:
            return []

        client_by_id = {str(client["client_id"]): client for client in clients}
        invoices_result = (
            database.table("invoices")
            .select(
                "invoice_id, client_id, invoice_number, amount, days_overdue, due_date, created_at"
            )
            .in_("client_id", list(client_by_id))
            .execute()
        )
        invoices = cast(list[dict[str, Any]], invoices_result.data or [])
    except Exception as exc:
        logger.exception("Failed to load communication clients")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load communication clients",
        ) from exc

    invoices_by_client: dict[str, list[dict]] = {}
    for invoice in invoices:
        invoices_by_client.setdefault(str(invoice["client_id"]), []).append(invoice)

    response: list[CommunicationClientResponse] = []
    for client_id, client in client_by_id.items():
        client_invoices = invoices_by_client.get(client_id, [])
        if not client_invoices:
            continue

        # The current UI displays one invoice per client. Prefer the most overdue
        # invoice, then use the newest invoice as a stable tie-breaker.
        invoice = max(
            client_invoices,
            key=lambda item: (
                int(item.get("days_overdue") or 0),
                str(item.get("created_at") or ""),
            ),
        )
        company = client.get("company_name") or ""

        response.append(
            CommunicationClientResponse(
                id=client_id,
                name=company,
                email=client.get("email") or "",
                phone=client.get("phone") or "",
                initials=_initials(company),
                invoice=str(invoice.get("invoice_number") or ""),
                invoiceId=str(invoice["invoice_id"]),
                amount=float(invoice.get("amount") or 0),
                daysOverdue=int(invoice.get("days_overdue") or 0),
            )
        )

    return response


@router.get("/bootstrap", response_model=CommunicationBootstrapResponse)
def bootstrap_communications(
    current: dict = Depends(get_current_user),
) -> CommunicationBootstrapResponse:
    """Load the Communications screen data in one authenticated request."""
    try:
        database, client_by_id, invoice_by_id, invoices = _load_communication_context(current)
        if not invoice_by_id:
            return CommunicationBootstrapResponse(clients=[], messages=[])

        communications_result = (
            database.table("communications")
            .select("*")
            .in_("invoice_id", list(invoice_by_id))
            .order("created_at", desc=False)
            .limit(200)
            .execute()
        )
        rows = cast(list[dict[str, Any]], communications_result.data or [])
        return CommunicationBootstrapResponse(
            clients=_build_client_summaries(client_by_id, invoices),
            messages=_build_message_responses(client_by_id, invoice_by_id, rows),
        )
    except Exception as exc:
        logger.exception("Failed to bootstrap communications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load communications",
        ) from exc


@router.get("", response_model=list[CommunicationResponse])
def list_communications(
    client_id: Optional[str] = Query(default=None),
    current: dict = Depends(get_current_user),
) -> list[CommunicationResponse]:
    """List communications owned by the authenticated user."""
    try:
        database, client_by_id, invoice_by_id, _ = _load_communication_context(current)
        if client_id is not None:
            invoice_by_id = {
                invoice_id: invoice
                for invoice_id, invoice in invoice_by_id.items()
                if str(invoice.get("client_id")) == client_id
            }
        if not invoice_by_id:
            return []
        invoice_ids = list(invoice_by_id)

        communications_result = (
            database.table("communications")
            .select("*")
            .in_("invoice_id", invoice_ids)
            .order("created_at", desc=False)
            .limit(200)
            .execute()
        )
    except Exception as exc:
        logger.exception("Failed to load communications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load communications",
        ) from exc

    response: list[CommunicationResponse] = []
    communication_rows = cast(
        list[dict[str, Any]], communications_result.data or []
    )
    for row in communication_rows:
        invoice_id = str(row["invoice_id"])
        invoice = invoice_by_id.get(invoice_id)
        if not invoice:
            continue

        client = client_by_id.get(str(invoice["client_id"]))
        if not client:
            continue

        response.append(_to_response(row, client, invoice_id))

    return response


@router.patch("/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_communications_read(
    payload: MarkCommunicationsReadPayload,
    current: dict = Depends(get_current_user),
) -> None:
    """Persist read state for communications owned by the current user."""
    try:
        database, _, invoice_by_id, _ = _load_communication_context(current)
        invoice_ids = list(invoice_by_id)
        if not invoice_ids:
            return

        rows_result = (
            database.table("communications")
            .select("communication_id")
            .in_("communication_id", payload.communicationIds)
            .in_("invoice_id", invoice_ids)
            .execute()
        )
        owned_rows = cast(list[dict[str, Any]], rows_result.data or [])
        owned_ids = [str(row["communication_id"]) for row in owned_rows]
        if not owned_ids:
            return

        database.table("communications").update({"is_read": True}).in_(
            "communication_id", owned_ids
        ).execute()
    except Exception as exc:
        logger.exception("Failed to mark communications as read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark communications as read",
        ) from exc


@router.post("/draft", response_model=CommunicationDraftResponse)
def create_communication_draft(
    payload: CommunicationDraftPayload,
    current: dict = Depends(get_current_user),
) -> CommunicationDraftResponse:
    """Generate a preview without storing or sending a communication.

    This currently uses a local generator. Gemini can replace that service
    once the team supplies credentials and finalizes the shared contract.
    """
    try:
        client, invoice = _load_client_and_invoice(payload, current)
        reply_to = payload.replyTo.model_dump() if payload.replyTo else None
        draft = generate_message_draft(
            client=client,
            invoice=invoice,
            channel=payload.channel,
            tone=payload.tone,
            action=payload.action,
            reply_to=reply_to,
        )
        validate_outbound_message(
            channel=payload.channel,
            subject=draft.get("subject"),
            body=str(draft.get("body") or ""),
        )
        return CommunicationDraftResponse(
            channel=payload.channel,
            tone=str(draft["tone"]),
            action=str(draft["action"]),
            subject=draft.get("subject"),
            body=str(draft["body"]),
            provider=str(draft["provider"]),
            isCompliant=bool(draft["is_compliant"]),
            violations=list(draft["violations"]),
        )
    except HTTPException:
        raise
    except MessageValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to generate communication draft")
        raise HTTPException(status_code=500, detail="Failed to generate communication draft") from exc


@router.post("", response_model=CommunicationResponse, status_code=status.HTTP_201_CREATED)
def create_communication(
    payload: CommunicationPayload,
    current: dict = Depends(get_current_user),
) -> CommunicationResponse:
    """Create an outbound communication for an invoice owned by the user."""
    owner_id = str(current["user"].id)
    database = _database_for(current)

    try:
        try:
            validate_outbound_message(
                channel=payload.channel,
                subject=payload.subject,
                body=payload.body,
            )
        except MessageValidationError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        client_result = (
            database.table("clients")
            .select("client_id, contact_person, email, phone")
            .eq("client_id", payload.clientId)
            .eq("owner_id", owner_id)
            .execute()
        )
        if not client_result.data:
            raise HTTPException(status_code=404, detail="Client not found")

        client = cast(dict[str, Any], client_result.data[0])
        invoice_result = (
            database.table("invoices")
            .select("invoice_id, client_id")
            .eq("invoice_id", payload.invoiceId)
            .eq("client_id", payload.clientId)
            .execute()
        )
        if not invoice_result.data:
            raise HTTPException(status_code=404, detail="Invoice not found for this client")

        sender_name = (payload.senderName or _current_user_sender(current)).strip()
        sender_initials = payload.senderInitials or _initials(sender_name)
        sender_label = payload.senderLabel or payload.senderType
        now = datetime.now(timezone.utc).isoformat()

        result = (
            database.table("communications")
            .insert(
                {
                    "invoice_id": payload.invoiceId,
                    "channel": payload.channel,
                    "message": payload.body.strip(),
                    "intent": payload.intent,
                    "status": "pending",
                    "direction": "out",
                    "sender_type": payload.senderType,
                    "sender_name": sender_name,
                    "sender_initials": sender_initials,
                    "sender_label": sender_label,
                    "subject": payload.subject,
                    "is_read": True,
                }
            )
            .select("*")
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create communication")

        created_row = cast(dict[str, Any], result.data[0])
        communication_id = created_row["communication_id"]
        try:
            send_outbound(
                channel=payload.channel,
                recipient_email=client.get("email") or "",
                recipient_phone=client.get("phone") or "",
                subject=payload.subject,
                body=payload.body.strip(),
            )
        except DeliveryError as exc:
            logger.exception("Failed to deliver communication")
            try:
                failure_update = (
                    database.table("communications")
                    .update({"status": "failed"})
                    .eq("communication_id", communication_id)
                    .select("communication_id, status")
                    .execute()
                )
                if not failure_update.data:
                    logger.error(
                        "Communication %s could not be marked failed; "
                        "check the communications UPDATE RLS policy",
                        communication_id,
                    )
            except Exception:
                logger.exception(
                    "Failed to mark communication %s as failed; "
                    "check the communications UPDATE RLS policy",
                    communication_id,
                )
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        result = (
            database.table("communications")
            .update({"status": "sent", "sent_at": now})
            .eq("communication_id", communication_id)
            .select("*")
            .execute()
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create communication")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create communication",
        ) from exc

    if not result.data:
        logger.error(
            "Communication %s could not be marked sent; "
            "check the communications UPDATE RLS policy",
            communication_id,
        )
        raise HTTPException(status_code=400, detail="Failed to create communication")

    communication = cast(dict[str, Any], result.data[0])
    return _to_response(communication, client, payload.invoiceId)
