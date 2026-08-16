"""Outbound communication providers.

Providers are configured through environment variables so credentials never
live in the codebase. Email uses SMTP (Gmail SMTP works with an app password),
and SMS uses the Twilio Messages API.
"""

from email.message import EmailMessage
import os
import smtplib

import httpx


class DeliveryError(RuntimeError):
    """Raised when an outbound message cannot be delivered."""


def send_outbound(
    *,
    channel: str,
    recipient_email: str,
    recipient_phone: str,
    subject: str | None,
    body: str,
) -> None:
    if channel == "email":
        _send_email(recipient_email, subject or "Payment follow-up", body)
        return

    if channel == "sms":
        _send_sms(recipient_phone, body)
        return

    raise DeliveryError(f"Unsupported communication channel: {channel}")


def _send_email(recipient: str, subject: str, body: str) -> None:
    if not recipient:
        raise DeliveryError("The client does not have an email address")

    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    # Support both the names used by the existing backend/.env and the
    # canonical names documented by this service.
    username = os.getenv("SMTP_USERNAME") or os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM_EMAIL") or os.getenv("EMAIL_FROM_ADDRESS") or username
    use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() == "true"

    if not host or not username or not password or not sender:
        raise DeliveryError(
            "Email delivery is not configured. Set SMTP_HOST, SMTP_USER "
            "(or SMTP_USERNAME), SMTP_PASSWORD and EMAIL_FROM_ADDRESS "
            "(or SMTP_FROM_EMAIL) in backend/.env"
        )

    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    smtp_client = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
    try:
        with smtp_client(host, port, timeout=15) as server:
            if not use_ssl:
                server.starttls()
            if username and password:
                server.login(username, password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise DeliveryError("Email provider rejected the message") from exc


def _send_sms(recipient: str, body: str) -> None:
    if not recipient:
        raise DeliveryError("The client does not have a phone number")

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER") or os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not from_number:
        raise DeliveryError(
            "SMS delivery is not configured. Set TWILIO_ACCOUNT_SID, "
            "TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER "
            "(or TWILIO_FROM_NUMBER) in backend/.env"
        )

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    try:
        response = httpx.post(
            url,
            data={"To": recipient, "From": from_number, "Body": body},
            auth=(account_sid, auth_token),
            timeout=15,
        )
    except httpx.HTTPError as exc:
        raise DeliveryError("SMS provider could not be reached") from exc

    if response.status_code >= 400:
        raise DeliveryError("SMS provider rejected the message")
