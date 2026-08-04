"""
Reminder Generation Service — mock implementation.

Returns deterministic reminder previews so the frontend can develop
independently.  The public API (`generate_reminder`) is designed to be
a drop-in replacement point for Gemini (gemini-2.5-flash) later:

    # Future integration (no router changes required):
    from google import genai
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
"""

from datetime import datetime
from app.schemas import ReminderPreview, ReminderStatus


# ---------------------------------------------------------------------------
# Mock templates
# ---------------------------------------------------------------------------

_DEFAULT_SENDER = "AR Team <collections@yourcompany.com>"
_DEFAULT_RECIPIENT = "s.mitchell@northgatemedical.com"


def _build_subject(invoice_id: str, amount: float) -> str:
    return f"Payment Reminder — {invoice_id} · ${amount:,.2f} Overdue"


def _build_body(
    client_name: str,
    invoice_id: str,
    amount: float,
    days_overdue: int,
) -> str:
    """Deterministic reminder body — will be replaced by Gemini later."""
    return (
        f"Hi Sarah,\n\n"
        f"I hope this message finds you well. I'm reaching out regarding invoice "
        f"{invoice_id} for ${amount:,.2f}, which was due on June 15, 2026 and is "
        f"currently {days_overdue} days past due.\n\n"
        f"We understand that oversights happen, and we would love to work with you "
        f"to resolve this promptly. Could you let us know the expected payment date, "
        f"or if there is any issue with the invoice that we can help address?\n\n"
        f"You can pay securely online at any time using the link below, or contact "
        f"our accounts receivable team directly at (800) 555-0192.\n\n"
        f"Pay Invoice — ${amount:,.2f}\n"
        f"Secure payment · {invoice_id}\n\n"
        f"Thank you for your attention to this matter. We value our partnership with "
        f"{client_name} and look forward to resolving this quickly.\n\n"
        f"Warm regards,\n"
        f"Accounts Receivable Team\n"
        f"YourCompany · collections@yourcompany.com"
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_reminder(
    invoice_id: str,
    client_name: str,
    amount_due: float,
    days_overdue: int,
    tone: str = "professional",
) -> ReminderPreview:
    """
    Generate a reminder preview for the given invoice.

    Parameters
    ----------
    invoice_id : str
        The invoice identifier (e.g. INV-2024-0847).
    client_name : str
        Display name of the client.
    amount_due : float
        Outstanding amount in USD.
    days_overdue : int
        Number of days past the due date.
    tone : str, optional
        Desired tone of the reminder.  Currently ignored in the mock
        implementation; will be passed to Gemini in the future.

    Returns
    -------
    ReminderPreview
        A fully populated reminder ready for approval or send.
    """
    # In the Gemini future, `tone` will drive the system prompt.
    _ = tone  # placate linters during mock phase

    generated_at = datetime(2026, 6, 22, 10, 15)

    return ReminderPreview.model_validate(
        {
            "from": _DEFAULT_SENDER,
            "to": _DEFAULT_RECIPIENT,
            "subject": _build_subject(invoice_id, amount_due),
            "body": _build_body(client_name, invoice_id, amount_due, days_overdue),
            "generatedAt": generated_at.strftime("%b %d, %Y at %I:%M %p"),
            "status": ReminderStatus.PENDING_APPROVAL,
        }
    )
