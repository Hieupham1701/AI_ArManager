import re
import logging
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from api.auth import get_current_user, supabase


router = APIRouter(prefix="/api/clients", tags=["clients"])
logger = logging.getLogger(__name__)

ReminderChannel = Literal["email", "sms", "phone"]
AITone = Literal["friendly", "professional", "firm"]
ClientStatus = Literal["active", "archived"]


class ClientResponse(BaseModel):
    id: str
    company: str
    contact: str
    email: str
    phone: str
    channel: ReminderChannel
    tone: AITone
    paymentTerms: str
    notes: str | None = None
    status: ClientStatus = "active"
    createdAt: str | None = None
    updatedAt: str | None = None


class ClientPayload(BaseModel):
    company: str = Field(min_length=1)
    contact: str = Field(min_length=1)
    email: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    channel: ReminderChannel = "email"
    tone: AITone = "friendly"
    paymentTerms: str = Field(min_length=1)
    notes: str = ""
    status: ClientStatus | None = None


def _database_for(current: dict):
    """Use the caller's JWT so Supabase RLS sees the authenticated user."""
    return supabase.postgrest.auth(current["token"])


def _ensure_user_row(current: dict) -> None:
    """Keep the application profile row in sync with the Auth user."""
    user = current["user"]
    try:
        _database_for(current).table("users").upsert(
            {
                "id": str(user.id),
                "email": getattr(user, "email", None),
            },
            on_conflict="id",
        ).execute()
    except Exception as exc:
        logger.exception("Failed to ensure user profile row")
        raise HTTPException(
            status_code=400,
            detail="Unable to prepare your user profile",
        ) from exc


def _normalize_channel(value: object) -> ReminderChannel:
    normalized = str(value or "email").strip().lower().replace(" ", "_")
    if normalized in {"sms", "text", "text_message"}:
        return "sms"
    if normalized in {"phone", "call", "phone_call"}:
        return "phone"
    return "email"


def _normalize_tone(value: object) -> AITone:
    normalized = str(value or "friendly").strip().lower()
    if normalized in {"professional", "firm"}:
        return normalized  # type: ignore[return-value]
    return "friendly"


def _format_payment_terms(value: object) -> str:
    if value is None or value == "":
        return ""

    try:
        days = int(value)
    except (TypeError, ValueError):
        return str(value)

    return "Due on Receipt" if days == 0 else f"Net {days}"


def _parse_payment_terms(value: str) -> int:
    normalized = value.strip().lower()
    if normalized in {"due on receipt", "due_on_receipt", "0"}:
        return 0

    match = re.fullmatch(r"(?:net\s*)?(\d+)", normalized)
    if match:
        return int(match.group(1))

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Payment terms must be 'Due on Receipt' or 'Net <days>'",
    )


def _to_client_response(row: dict) -> ClientResponse:
    return ClientResponse(
        id=str(row["client_id"]),
        company=row.get("company_name") or "",
        contact=row.get("contact_person") or "",
        email=row.get("email") or "",
        phone=row.get("phone") or "",
        channel=_normalize_channel(row.get("preferred_reminder")),
        tone=_normalize_tone(row.get("communication_tone")),
        paymentTerms=_format_payment_terms(row.get("payment_terms")),
        notes=row.get("notes") or "",
        status=row.get("status") or "active",
        createdAt=row.get("created_at"),
        updatedAt=row.get("updated_at"),
    )


@router.get("", response_model=list[ClientResponse])
def list_clients(current: dict = Depends(get_current_user)) -> list[ClientResponse]:
    """Return clients owned by the authenticated user."""
    owner_id = str(current["user"].id)

    try:
        result = (
            _database_for(current).table("clients")
            .select("*")
            .eq("owner_id", owner_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load clients",
        ) from exc

    return [_to_client_response(row) for row in (result.data or [])]


def _client_row(payload: ClientPayload, owner_id: str, include_owner: bool = False) -> dict:
    row = {
        "company_name": payload.company.strip(),
        "contact_person": payload.contact.strip(),
        "email": payload.email.strip().lower(),
        "phone": payload.phone.strip(),
        "preferred_reminder": payload.channel,
        "communication_tone": payload.tone,
        "payment_terms": _parse_payment_terms(payload.paymentTerms),
        "notes": payload.notes.strip(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if include_owner:
        row["owner_id"] = owner_id
    if payload.status is not None:
        row["status"] = payload.status
    return row


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientPayload, current: dict = Depends(get_current_user)) -> ClientResponse:
    try:
        _ensure_user_row(current)
        result = (
            _database_for(current)
            .table("clients")
            .insert(_client_row(payload, str(current["user"].id), include_owner=True))
            .select("*")
            .execute()
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create client")
        raise HTTPException(status_code=400, detail="Failed to create client") from exc

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create client")
    return _to_client_response(result.data[0])


@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    payload: ClientPayload,
    current: dict = Depends(get_current_user),
) -> ClientResponse:
    updates = _client_row(payload, str(current["user"].id))

    try:
        result = (
            _database_for(current).table("clients")
            .update(updates)
            .eq("client_id", client_id)
            .eq("owner_id", str(current["user"].id))
            .select("*")
            .execute()
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to update client") from exc

    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return _to_client_response(result.data[0])


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: str, current: dict = Depends(get_current_user)) -> None:
    try:
        result = (
            _database_for(current).table("clients")
            .delete()
            .eq("client_id", client_id)
            .eq("owner_id", str(current["user"].id))
            .select("client_id")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to delete client") from exc

    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
