"""Tests for the Strategy Engine service layer.

These tests exercise the deterministic tier mapping, the handling of debtor
responses, and the approval workflow. No external services (Gemini, DB, etc.)
are touched – the entire implementation is in‑memory and deterministic, which
keeps the test suite fast and reliable.
"""
from datetime import datetime, date, timedelta
import pytest
import sys
import os
from pathlib import Path

# Ensure the directory that contains the ``app`` package (i.e. ``backend``) is on
# ``sys.path``. Using ``Path`` provides a robust, OS‑agnostic resolution.
backend_dir = Path(__file__).resolve().parents[1]  # backend/tests/.. -> backend
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from app.services.strategy_service import (
    evaluate_invoice,
    store_debtor_response,
    set_approval,
    get_approval,
    Decision,
    DebtorResponse,
    Tone,
    Channel,
)
from app.services import strategy_service

# ---------------------------------------------------------------------------
# Ensure a clean in‑memory state before each test (the service stores data in
# module‑level dictionaries). This fixture runs automatically for every test in
# this file.
# ---------------------------------------------------------------------------

import pytest

@pytest.fixture(autouse=True)
def _clear_in_memory_state():
    """Reset the mock stores between tests to avoid cross‑test contamination."""
    strategy_service._APPROVALS.clear()
    strategy_service._DEBTOR_RESPONSES.clear()


def _base_payload(days_overdue: int, amount: float = 1000.0):
    """Helper that returns arguments for ``evaluate_invoice``.

    ``reference_date`` is fixed at 2026‑06‑22 (the same deterministic date used
    by the service for mock stability).
    """
    reference = datetime(2026, 6, 22)
    due = reference - timedelta(days=days_overdue)
    return {
        "invoice_id": "INV-TEST",
        "due_date": due,
        "amount": amount,
        "reference_date": reference,
    }


@pytest.mark.parametrize(
    "days,expected_tier,expected_action,expected_channel,expected_tone",
    [
        (0, "day_0", "invoice_issue", Channel.EMAIL, Tone.FRIENDLY),
        (3, "day_3", "payment_reminder", Channel.EMAIL, Tone.FRIENDLY),
        (7, "day_7", "payment_reminder", Channel.SMS, Tone.FIRM),
        (14, "day_14", "phone_call", Channel.PHONE, Tone.PROFESSIONAL),
        (21, "day_21", "escalation_email", Channel.EMAIL, Tone.PROTECTIVE),
        (30, "day_30", "collections_referral", Channel.EMAIL, Tone.LEGAL),
    ],
)
def test_tier_lookup(days, expected_tier, expected_action, expected_channel, expected_tone):
    payload = _base_payload(days)
    result = evaluate_invoice(**payload)
    assert result["tier"] == expected_tier
    assert result["action"] == expected_action
    assert result["channel"] == expected_channel
    assert result["tone"] == expected_tone


def test_debtor_promise_to_pay_adjusts_schedule_and_tone():
    # Store a promise‑to‑pay response first
    resp = DebtorResponse(
        invoice_id="INV-TEST",
        intent="promise_to_pay",
        promised_date=date(2026, 8, 14),
        amount=5000,
    )
    store_debtor_response(resp)

    payload = _base_payload(7)  # day_7 tier initially
    result = evaluate_invoice(**payload)
    # Tone should be softened to friendly and schedule should be the promised date
    assert result["tone"] == Tone.FRIENDLY
    assert result["schedule"] == "2026-08-14"
    assert "promise to pay" in (result["reasoning"] or "").lower()


def test_debtor_financial_hardship_adjusts_tone():
    resp = DebtorResponse(
        invoice_id="INV-TEST",
        intent="financial_hardship",
    )
    store_debtor_response(resp)
    payload = _base_payload(14)  # day_14 tier
    result = evaluate_invoice(**payload)
    assert result["tone"] == Tone.PROTECTIVE
    assert "hardship" in (result["reasoning"] or "").lower()


def test_approval_workflow():
    invoice_id = "INV-TEST"
    # default should be pending
    assert get_approval(invoice_id) == Decision.PENDING
    set_approval(invoice_id, Decision.APPROVED)
    assert get_approval(invoice_id) == Decision.APPROVED
    set_approval(invoice_id, Decision.REJECTED)
    assert get_approval(invoice_id) == Decision.REJECTED
