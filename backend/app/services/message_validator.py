"""Outbound message validation used before delivery."""


class MessageValidationError(ValueError):
    """Raised when an outbound message fails local QA checks."""


def validate_outbound_message(*, channel: str, subject: str | None, body: str) -> None:
    content = body.strip()
    if not content:
        raise MessageValidationError("Message body cannot be empty")

    if channel not in {"email", "sms"}:
        raise MessageValidationError("Only email and sms channels are supported")

    if channel == "email" and subject is not None and len(subject.strip()) > 200:
        raise MessageValidationError("Email subject is too long")

    if channel == "sms" and len(content) > 1600:
        raise MessageValidationError("SMS body cannot exceed 1600 characters")

    if "{{" in content or "}}" in content:
        raise MessageValidationError("Message contains unresolved template variables")
