"""Message draft generation seam.

The local implementation keeps the Communications flow usable before the
Gemini credentials and final team contract are available.  Gemini can replace
``generate_message_draft`` later without changing the API or sender flow.
"""

from typing import Any


def _first_name(contact_person: str, company_name: str) -> str:
    value = (contact_person or company_name or "there").strip()
    return value.split()[0] if value else "there"


def _invoice_summary(invoice: dict[str, Any]) -> tuple[str, str, int, float]:
    invoice_number = str(invoice.get("invoice_number") or "the invoice")
    due_date = str(invoice.get("due_date") or "the due date")
    days_overdue = int(invoice.get("days_overdue") or 0)
    amount = float(invoice.get("amount") or 0)
    return invoice_number, due_date, days_overdue, amount


def generate_message_draft(
    *,
    client: dict[str, Any],
    invoice: dict[str, Any],
    channel: str,
    tone: str,
    action: str,
    reply_to: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate a deterministic draft for local development.

    ``action``, ``channel`` and ``tone`` are deliberately part of the
    function contract because Hùng's strategy output will provide them later.
    """
    company_name = str(client.get("company_name") or "your team")
    first_name = _first_name(
        str(client.get("contact_person") or ""),
        company_name,
    )
    invoice_number, due_date, days_overdue, amount = _invoice_summary(invoice)
    amount_text = f"${amount:,.2f}"
    tone_text = tone.replace("_", " ").strip() or "friendly"
    action_text = action.replace("_", " ").strip() or "send reminder"

    reply_intent = str((reply_to or {}).get("intent") or "").lower()
    if reply_to:
        if reply_intent == "dispute":
            email_body = (
                f"Hi {first_name},\n\n"
                f"Thank you for contacting us about invoice {invoice_number}. "
                "We are reviewing the details and will follow up with you shortly.\n\n"
                "Best regards,\nAccounts Receivable Team"
            )
            sms_body = (
                f"Hi {first_name}, thanks for reaching out about {invoice_number}. "
                "We are reviewing it and will follow up shortly."
            )
        elif reply_intent == "invoice_request":
            email_body = (
                f"Hi {first_name},\n\n"
                f"Attached is the requested statement for invoice {invoice_number}. "
                "Please let us know if you need any further information.\n\n"
                "Best regards,\nAccounts Receivable Team"
            )
            sms_body = (
                f"Hi {first_name}, we have sent the requested statement for "
                f"{invoice_number}. Let us know if you need anything else."
            )
        else:
            email_body = (
                f"Hi {first_name},\n\n"
                f"Thank you for your update regarding invoice {invoice_number}. "
                "We have recorded it and will follow up if needed.\n\n"
                "Best regards,\nAccounts Receivable Team"
            )
            sms_body = (
                f"Hi {first_name}, thank you for the update regarding {invoice_number}. "
                "We have recorded it in our system."
            )
        subject = f"Re: Follow-up on {invoice_number}"
    else:
        overdue_text = (
            f"which is {days_overdue} days past due"
            if days_overdue > 0
            else f"with a due date of {due_date}"
        )
        subject = f"Payment reminder — {invoice_number}"
        email_body = (
            f"Hi {first_name},\n\n"
            f"This is a {tone_text} reminder regarding invoice {invoice_number} "
            f"for {amount_text}, {overdue_text}.\n\n"
            "Please let us know the expected payment date or contact us if there "
            "is anything we can clarify.\n\n"
            f"Best regards,\nAccounts Receivable Team\n{company_name}"
        )
        sms_body = (
            f"Hi {first_name}, this is a {tone_text} reminder for {invoice_number} "
            f"({amount_text}). Please let us know when payment is expected."
        )

    body = email_body if channel == "email" else sms_body
    return {
        "channel": channel,
        "tone": tone,
        "action": action,
        "subject": subject if channel == "email" else None,
        "body": body,
        "provider": "local",
        "is_compliant": True,
        "violations": [],
    }
