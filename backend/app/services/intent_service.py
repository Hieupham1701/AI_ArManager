"""Local intent analysis seam for inbound communications."""


def analyze_intent(message: str) -> str:
    """Classify an inbound message for the Phase 1 local webhook demo."""
    text = message.lower()

    if any(word in text for word in ("dispute", "wrong amount", "incorrect", "not agree", "error")):
        return "dispute"
    if any(word in text for word in ("pay on", "pay by", "payment date", "will pay", "promise")):
        return "promise_to_pay"
    if any(word in text for word in ("invoice", "statement", "receipt", "copy")):
        return "invoice_request"
    return "other"
