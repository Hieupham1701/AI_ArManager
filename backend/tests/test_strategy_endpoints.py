"""Integration tests for the Strategy API endpoints.

These tests use FastAPI's ``TestClient`` to hit the actual router paths defined in
``backend/app/routers/strategy.py``. They verify:

* ``/strategy/update`` returns a ``StrategyResult`` with all required fields.
* ``/strategy/generate-reminder`` returns a deterministic reminder preview.
* ``/strategy/respond`` stores a ``DebtorResponse`` that influences a subsequent
  ``/strategy/update`` call.
* ``/strategy/approve`` records the owner decision and that decision is reflected in
  the next ``/strategy/update`` response.
* Validation of ``DebtorResponse`` schema (invalid intent raises a ``ValidationError``).
"""

from datetime import datetime, date
import json

import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app defined in ``backend/main.py``
# Ensure the ``backend`` directory (which contains ``main.py``) is on ``sys.path``.
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1]  # backend/tests/.. -> backend
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from main import app

client = TestClient(app)

# ---------------------------------------------------------------------------
# Helper payloads
# ---------------------------------------------------------------------------

BASE_UPDATE_PAYLOAD = {
    "invoice_id": "INV-TEST",
    "due_date": "2026-06-15",
    "amount": 1000.0,
    "client_name": "Test Corp",
}

BASE_REMINDER_PAYLOAD = {
    "invoice_id": "INV-TEST",
    "client_name": "Test Corp",
    "amount_due": 1000.0,
    "days_overdue": 7,
}

def test_update_endpoint_returns_strategy_result():
    """POST /strategy/update should return a full StrategyResult contract."""
    resp = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    assert resp.status_code == 200
    data = resp.json()
    # Required keys according to StrategyResult model
    required_keys = {
        "invoice_id",
        "days_overdue",
        "status",
        "risk_level",
        "tier",
        "action",
        "channel",
        "tone",
        "schedule",
        "decision",
    }
    assert required_keys.issubset(set(data.keys()))
    # Verify a few concrete values for the deterministic baseline (7 days overdue)
    assert data["days_overdue"] == 7
    assert data["tier"] == "day_7"
    assert data["action"] == "payment_reminder"
    assert data["channel"] == "sms"
    assert data["tone"] == "firm"
    assert data["decision"] == "pending"

def test_generate_reminder_endpoint():
    resp = client.post("/api/v1/strategy/generate-reminder", json=BASE_REMINDER_PAYLOAD)
    assert resp.status_code == 200
    data = resp.json()
    # ReminderResponse contains a ``reminder`` object with the expected fields
    assert "reminder" in data
    reminder = data["reminder"]
    for field in ["from", "to", "subject", "body", "generatedAt", "status"]:
        assert field in reminder

def test_respond_endpoint_affects_subsequent_strategy():
    # Submit a promise‑to‑pay response first
    resp_payload = {
        "invoice_id": "INV-TEST",
        "intent": "promise_to_pay",
        "promised_date": "2026-08-14",
        "amount": 5000,
    }
    r = client.post("/api/v1/strategy/respond", json=resp_payload)
    assert r.status_code == 200
    # Now evaluate the same invoice – the schedule should be the promised date and tone friendly
    r2 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    assert r2.status_code == 200
    data = r2.json()
    assert data["tone"] == "friendly"
    assert data["schedule"] == "2026-08-14"
    assert "promise to pay" in (data.get("reasoning") or "").lower()

def test_approve_endpoint_reflects_decision():
    # Approve the strategy first
    approve_payload = {"invoice_id": "INV-TEST", "decision": "approved"}
    r = client.post("/api/v1/strategy/approve", json=approve_payload)
    assert r.status_code == 200
    # Retrieve strategy – decision should be approved
    r2 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    assert r2.status_code == 200
    data = r2.json()
    assert data["decision"] == "approved"

def test_debtor_intents_other_than_promise_adjust_tone_only():
    # Financial hardship – tone should become protective
    payload = {
        "invoice_id": "INV-TEST",
        "intent": "financial_hardship",
    }
    r = client.post("/api/v1/strategy/respond", json=payload)
    assert r.status_code == 200
    r2 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    data = r2.json()
    assert data["tone"] == "protective"
    assert data["schedule"] == "immediate"

    # Dispute – action changes to dispute_review, channel forced to email, tone professional
    payload = {"invoice_id": "INV-TEST", "intent": "dispute"}
    client.post("/api/v1/strategy/respond", json=payload)
    r3 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    data = r3.json()
    assert data["action"] == "dispute_review"
    assert data["channel"] == "email"
    assert data["tone"] == "professional"

    # Question – no special handling; tone remains the default for the tier (firm for day_7)
    payload = {"invoice_id": "INV-TEST", "intent": "question"}
    client.post("/api/v1/strategy/respond", json=payload)
    r4 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    data = r4.json()
    # Default tier for 7 days overdue is firm tone
    assert data["tone"] == "firm"

    # Refusal – same as unknown, no special handling
    payload = {"invoice_id": "INV-TEST", "intent": "refusal"}
    client.post("/api/v1/strategy/respond", json=payload)
    r5 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    data = r5.json()
    assert data["tone"] == "firm"

    # Unknown – still no special handling
    payload = {"invoice_id": "INV-TEST", "intent": "unknown"}
    client.post("/api/v1/strategy/respond", json=payload)
    r6 = client.post("/api/v1/strategy/update", json=BASE_UPDATE_PAYLOAD)
    data = r6.json()
    assert data["tone"] == "firm"

def test_debtor_response_schema_validation():
    from app.schemas import DebtorResponse
    from pydantic import ValidationError

    # Valid payload works
    valid = DebtorResponse(
        invoice_id="INV-TEST",
        intent="question",
    )
    assert valid.intent == "question"

    # Invalid intent should raise a ValidationError
    with pytest.raises(ValidationError):
        DebtorResponse(
            invoice_id="INV-TEST",
            intent="not_a_real_intent",
        )