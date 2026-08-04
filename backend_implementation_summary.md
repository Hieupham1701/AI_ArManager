# Backend Implementation Summary

## Project
**AI Invoice Management Agent — Strategy Orchestration Engine**

Branch: `feature/strategy-engine` (Hung)

---

## Files Created

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI entry point, CORS, router registration, health probe |
| `backend/app/schemas.py` | Pydantic models, enums, and API contracts |
| `backend/app/models.py` | Placeholder for future SQLAlchemy ORM models |
| `backend/app/routers/invoices.py` | Invoice resource endpoints (GET) |
| `backend/app/routers/strategy.py` | Strategy orchestration endpoints (POST) |
| `backend/app/services/strategy_service.py` | Deterministic strategy engine heuristics |
| `backend/app/services/reminder_service.py` | Deterministic reminder preview generator |
| `backend/requirements.txt` | Python dependencies |

---

## Files Modified

None — all backend files were created fresh for this feature branch.

---

## API Endpoints Implemented

### Invoices (`/api/v1/invoices/{invoice_id}`)

| Method | Path | Response Model | Description |
|--------|------|----------------|-------------|
| `GET` | `/detail` | `InvoiceDetail` | Complete invoice summary with strategy metadata |
| `GET` | `/timeline` | `List[CollectionStep]` | Chronological collection timeline steps |
| `GET` | `/communications` | `List[CommunicationLog]` | Historical communication records |
| `GET` | `/contact` | `Contact` | Primary billing contact |
| `GET` | `/reminder` | `ReminderPreview` | AI-generated reminder preview |

### Strategy (`/api/v1/strategy`)

| Method | Path | Request → Response | Description |
|--------|------|--------------------|-------------|
| `POST` | `/update` | `StrategyUpdateRequest` → `StrategyUpdateResponse` | Evaluate invoice and return strategy metadata |
| `POST` | `/generate-reminder` | `GenerateReminderRequest` → `GenerateReminderResponse` | Generate a reminder preview for an invoice |

### Health

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| `GET` | `/health` | `{"status":"ok"}` | Liveness probe |

---

## Schemas (Data Models)

### Enums

| Enum | Values |
|------|--------|
| `InvoiceStatus` | `OVERDUE`, `IN_PROGRESS`, `ESCALATED`, `CRITICAL`, `PAID`, `PENDING` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `CollectionStepStatus` | `COMPLETED`, `ACTIVE`, `PENDING` |
| `CommunicationType` | `EMAIL`, `SMS`, `PHONE`, `INVOICE_DELIVERY` |
| `CommunicationStatus` | `DELIVERED`, `SENT`, `FAILED`, `PENDING` |
| `ReminderStatus` | `GENERATED`, `PENDING_APPROVAL`, `SENT` |
| `Priority` | `LOW`, `MEDIUM`, `HIGH` |

### Request / Response Models

| Model | Fields |
|-------|--------|
| `CollectionProgress` | `currentStep`, `totalSteps`, `percentComplete`, `currentStage` |
| `InvoiceDetail` | `id`, `client`, `amountDue`, `dueDate`, `daysOverdue`, `status`, `riskLevel`, `strategy`, `collectionProgress` |
| `CollectionStep` | `day`, `title`, `description`, `date`, `status`, `icon` (regex: `^(check|message|alert|clock|phone)$`) |
| `Contact` | `name`, `role`, `email`, `phone`, `lastContact`, `responseRate` (0–100) |
| `CommunicationLog` | `id`, `type`, `title`, `date`, `time`, `status`, `content` |
| `ReminderPreview` | `from`, `to`, `subject`, `body`, `generatedAt`, `status` |
| `NextAction` | `action`, `scheduledDate`, `scheduledTime`, `workflow`, `priority` |
| `AIInsight` | `summary`, `recommendedAction`, `optimalContactTime` |
| `StrategyUpdateRequest` | `invoice_id`, `due_date`, `amount`, `client_name`, `payment_status` (optional) |
| `StrategyUpdateResponse` | `days_overdue`, `status`, `risk_level`, `current_escalation_tier`, `next_action` |
| `GenerateReminderRequest` | `invoice_id`, `client_name`, `amount_due`, `days_overdue`, `tone` (optional, default `"professional"`) |
| `GenerateReminderResponse` | `reminder` (`ReminderPreview`) |

---

## Strategy Engine Logic

The strategy engine lives in `app/services/strategy_service.py` and computes the following deterministically:

### 1. Days Overdue
```
days_overdue = max(reference_date - due_date, 0)
```
Reference date is fixed at `2026-06-22` for mock stability.

### 2. Escalation Tier
| Days Overdue | Tier |
|--------------|------|
| ≤ 0 | 1 |
| ≤ 7 | 2 |
| ≤ 14 | 3 |
| ≤ 30 | 4 |
| > 30 | 5 |

### 3. Invoice Status
| Days Overdue | Amount | Status |
|--------------|--------|--------|
| ≤ 0 | any | `PENDING` |
| ≤ 7 | any | `OVERDUE` |
| ≤ 14 | any | `IN_PROGRESS` |
| ≤ 30 | any | `ESCALATED` |
| > 30 | > $50,000 | `CRITICAL` |
| > 30 | ≤ $50,000 | `ESCALATED` |

### 4. Risk Level
| Days Overdue | Amount | Risk |
|--------------|--------|------|
| ≤ 7 | any | `LOW` |
| ≤ 14 | any | `MEDIUM` |
| ≤ 30 | any | `HIGH` |
| > 30 | > $50,000 | `CRITICAL` |
| > 30 | ≤ $50,000 | `HIGH` |

### 5. Next Action
| Days Overdue | Action |
|--------------|--------|
| ≤ 0 | Awaiting due date |
| ≤ 3 | Friendly Email |
| ≤ 7 | Reminder SMS |
| ≤ 14 | Phone Call |
| ≤ 21 | Escalation Email |
| ≤ 30 | Final Notice |
| > 30 | Collections Referral |

---

## Mock Data Assumptions

| Variable | Value | Rationale |
|----------|-------|-----------|
| `MOCK_DUE_DATE` | `2026-06-15` | Fixed so days overdue is always deterministic (7 days) |
| `MOCK_INVOICE_ID` | `INV-2024-0847` | Consistent identifier across all endpoints |
| `MOCK_CLIENT` | `Northgate Medical Group` | Realistic B2B client name |
| `MOCK_AMOUNT` | `$24,750.00` | Sub-critical amount (keeps risk at LOW / MEDIUM) |
| Reference date | `2026-06-22` | Hard-coded so all evaluations are reproducible |
| Collection timeline | 6 steps | Covers 0 → 30 days post-due |
| Communications | 3 entries | Invoice delivery, email reminder, SMS |
| Contact | Sarah Mitchell | Billing Manager with 78 % response rate |

---

## Testing Performed

All endpoints were tested via `curl` against a locally running Uvicorn server (`127.0.0.1:8000`).

| Endpoint | HTTP Status | Result |
|----------|-------------|--------|
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /api/v1/invoices/INV-2024-0847/detail` | 200 | Invoice detail with strategy metadata |
| `GET /api/v1/invoices/INV-2024-0847/timeline` | 200 | 6 collection steps |
| `GET /api/v1/invoices/INV-2024-0847/communications` | 200 | 3 communication logs |
| `GET /api/v1/invoices/INV-2024-0847/contact` | 200 | Contact object |
| `GET /api/v1/invoices/INV-2024-0847/reminder` | 200 | Reminder preview |
| `POST /api/v1/strategy/update` | 200 | Strategy metadata (`days_overdue: 7`, `risk_level: Low`, …) |
| `POST /api/v1/strategy/generate-reminder` | 200 | Reminder preview wrapped in `GenerateReminderResponse` |

All responses validated against their declared Pydantic `response_model` automatically by FastAPI.

---

## Known Limitations

1. **No database** — all data is in-memory mock objects. PostgreSQL integration is future work.
2. **No authentication / authorization** — endpoints are fully open for frontend development.
3. **No real AI** — reminders and strategy heuristics are deterministic mocks.
4. **Fixed reference date** — `2026-06-22` is hard-coded so evaluations never drift; will be replaced by `datetime.now()` once the system is live.
5. **Single invoice mock** — only `INV-2024-0847` returns meaningful data; other IDs will still evaluate but reuse the same mock constants.
6. **No async I/O** — services are synchronous; no external API calls yet.
7. **No logging / observability** — no structured logging or OpenTelemetry instrumentation.

---

## Future Gemini Integration Points

### 1. Strategy Evaluation (`app/services/strategy_service.py`)
**Replace:** `evaluate_invoice()` heuristic functions (`_invoice_status`, `_risk_level`, `_next_action`).
**Integration:**
```python
from google import genai
client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)
```
**Contract:** The router already wraps the dict returned by `evaluate_invoice()` into `StrategyUpdateResponse`; only the service internals change.

### 2. Reminder Generation (`app/services/reminder_service.py`)
**Replace:** `_build_body()` template string.
**Integration:** Pass `tone`, `client_name`, `amount_due`, `days_overdue` into a Gemini system prompt and parse the returned text into `ReminderPreview`.
**Contract:** `generate_reminder()` already returns a `ReminderPreview`; the router (`POST /strategy/generate-reminder`) requires no changes.

### 3. AI Insights (new endpoint)
**Future schema:** `AIInsight` (already defined in `app/schemas.py`).
**Suggested endpoint:** `GET /api/v1/invoices/{id}/insights`
**Payload:** `summary`, `recommendedAction`, `optimalContactTime`.

---

## Dependencies

```text
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
pydantic>=2.9.0
python-dateutil>=2.9.0
```

Verified compatible with **Python 3.13.7** (latest stable at time of writing).

---

## How to Run

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive docs available at `http://127.0.0.1:8000/docs` (Swagger UI).
