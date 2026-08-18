import hmac
import json
import os
from typing import Any, cast
from urllib.parse import parse_qs

from fastapi import APIRouter, HTTPException, Request, status

from api.auth import supabase_admin
from api.communications import CommunicationResponse, _initials, _to_response
from app.services.intent_service import analyze_intent


router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


def _payload_value(payload: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = payload.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


async def _read_payload(request: Request) -> dict[str, Any]:
    raw_body = await request.body()
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            payload = json.loads(raw_body or b"{}")
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON payload") from exc
        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail="Webhook payload must be an object")
        return payload

    parsed = parse_qs(raw_body.decode("utf-8"), keep_blank_values=True)
    return {key: values[-1] if values else "" for key, values in parsed.items()}


def _check_webhook_secret(request: Request) -> None:
    expected = os.getenv("WEBHOOK_SECRET")
    if expected:
        provided = request.headers.get("x-webhook-secret", "")
        if not hmac.compare_digest(provided, expected):
            raise HTTPException(status_code=401, detail="Invalid webhook secret")


@router.post("/twilio", response_model=CommunicationResponse, status_code=status.HTTP_201_CREATED)
async def receive_twilio_webhook(request: Request) -> CommunicationResponse:
    """Receive an inbound SMS/email simulation and store its intent."""
    _check_webhook_secret(request)
    if supabase_admin is None:
        raise HTTPException(
            status_code=503,
            detail="Webhook storage requires SERVICE_ROLE_KEY",
        )

    payload = await _read_payload(request)
    invoice_id = _payload_value(payload, "invoice_id", "invoiceId", "InvoiceId")
    body = _payload_value(payload, "message", "body", "Body")
    channel = _payload_value(payload, "channel") or "sms"
    sender = _payload_value(payload, "sender", "from", "From") or "Unknown sender"
    subject = _payload_value(payload, "subject", "Subject") or None

    if not invoice_id or not body:
        raise HTTPException(status_code=422, detail="invoice_id and message are required")
    if channel not in {"email", "sms"}:
        raise HTTPException(status_code=422, detail="channel must be email or sms")

    database = supabase_admin
    try:
        invoice_result = (
            database.table("invoices")
            .select("invoice_id, client_id")
            .eq("invoice_id", invoice_id)
            .execute()
        )
        if not invoice_result.data:
            raise HTTPException(status_code=404, detail="Invoice not found")

        invoice = cast(dict[str, Any], invoice_result.data[0])
        client_result = (
            database.table("clients")
            .select("client_id, contact_person")
            .eq("client_id", invoice["client_id"])
            .execute()
        )
        if not client_result.data:
            raise HTTPException(status_code=404, detail="Client not found")

        client = cast(dict[str, Any], client_result.data[0])
        result = (
            database.table("communications")
            .insert(
                {
                    "invoice_id": invoice_id,
                    "channel": channel,
                    "message": body,
                    "intent": analyze_intent(body),
                    "status": None,
                    "direction": "in",
                    "sender_type": "client",
                    "sender_name": sender,
                    "sender_initials": _initials(sender),
                    "sender_label": f"{channel.upper()} Inbound",
                    "subject": subject,
                    "is_read": False,
                }
            )
            .select("*")
            .execute()
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store webhook communication") from exc

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to store webhook communication")

    communication = cast(dict[str, Any], result.data[0])
    return _to_response(communication, client, invoice_id)
