# AI Invoice Management Agent — Backend

## 1. Architecture

```
backend/
├── main.py                # Clean entry point — imports & registers routers
├── config.py              # Shared config (Supabase, env vars)
├── api/                   # All routers as modules
│   ├── auth.py            # Auth router (signup, login, profile, etc.)
│   ├── invoices.py        # Invoice endpoints
│   └── strategy.py        # Strategy endpoints
├── app/
│   ├── models/            # Database models (future SQLAlchemy)
│   ├── schemas/           # Pydantic schemas
│   └── services/          # Business logic
└── requirements.txt
```

## 2. Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Communication provider setup (local/demo)

The `.env` file is server configuration. A project owner or deployer fills it
once; users do not edit `.env` when sending messages from the frontend.

For local testing, configure one team-owned email provider and, optionally,
one Twilio SMS provider:

```env
# Gmail / Google Workspace example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-team-account@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-team-account@gmail.com
SMTP_USE_SSL=false

# Twilio example
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+14155550123
```

`SMTP_PASSWORD` must be an App Password for Gmail, not the normal account
password. `TWILIO_FROM_NUMBER` must be an SMS-capable number owned by the
Twilio account.

## 3. API Endpoints

### Auth (`/api/auth`)

| Method | Path               | Description                     |
| ------ | ------------------ | ------------------------------- |
| `POST` | `/signup`          | Register new user               |
| `POST` | `/login`           | Authenticate user               |
| `POST` | `/refresh`         | Refresh access token            |
| `POST` | `/logout`          | Logout user                     |
| `GET`  | `/profile`         | Get user profile (protected)    |
| `PUT`  | `/profile`         | Update user profile (protected) |
| `POST` | `/forgot-password` | Send password reset email       |
| `POST` | `/reset-password`  | Reset password with token       |
| `POST` | `/change-password` | Change password (authenticated) |

### Invoices (`/api/v1/invoices/{invoice_id}`)

| Method | Path              | Response Model           | Description                              |
| ------ | ----------------- | ------------------------ | ---------------------------------------- |
| `GET`  | `/detail`         | `InvoiceDetail`          | Full invoice summary + strategy metadata |
| `GET`  | `/timeline`       | `List[CollectionStep]`   | Chronological collection steps           |
| `GET`  | `/communications` | `List[CommunicationLog]` | Communication history                    |
| `GET`  | `/contact`        | `Contact`                | Primary billing contact                  |
| `GET`  | `/reminder`       | `ReminderPreview`        | AI-generated reminder preview            |

### Strategy (`/api/v1/strategy`)

The Strategy Orchestration Engine (owned by **Hung**) decides *what* should happen next for an invoice.
It **does not** generate or send any communication; that responsibility belongs to the
Communication layer (owned by **Hanh**).

| Method | Path | Request → Response | Description |
|--------|------|--------------------|-------------|
| `POST` | `/update` | `StrategyUpdateRequest` → `StrategyResult` | Evaluate an invoice and return the full strategy recommendation (action, channel, tone, schedule, tier, risk, etc.). |
| `POST` | `/generate-reminder` | `GenerateReminderRequest` → `GenerateReminderResponse` | Generate a deterministic *preview* of a reminder (no sending). |
| `POST` | `/respond` | `DebtorResponse` → `{ "status": "ok" }` | Accept structured response data from Hiếu's response‑intelligence layer (e.g., promise‑to‑pay). |
| `POST` | `/approve` | `{ "invoice_id": "...", "decision": "approved" }` → `{ "status": "ok" }` | Record the owner’s approval or rejection of the recommended strategy. |

### Health

| Method | Path      | Response          |
| ------ | --------- | ----------------- |
| `GET`  | `/health` | `{"status":"ok"}` |

> **Interactive docs:** `http://127.0.0.1:8000/docs` (Swagger UI)

---

## 4. API Contracts (Schemas)

| Enum                   | Values                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `InvoiceStatus`        | `OVERDUE`, `IN_PROGRESS`, `ESCALATED`, `CRITICAL`, `PAID`, `PENDING` |
| `RiskLevel`            | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`                                  |
| `CollectionStepStatus` | `COMPLETED`, `ACTIVE`, `PENDING`                                     |
| `CommunicationType`    | `EMAIL`, `SMS`, `PHONE`, `INVOICE_DELIVERY`                          |
| `CommunicationStatus`  | `DELIVERED`, `SENT`, `FAILED`, `PENDING`                             |
| `ReminderStatus`       | `GENERATED`, `PENDING_APPROVAL`, `SENT`                              |

### Key Models

```python
# Invoice summary
class InvoiceDetail(BaseModel):
    id: str
    client: str
    amountDue: float
    dueDate: str
    daysOverdue: int
    status: InvoiceStatus
    riskLevel: RiskLevel
    strategy: str
    collectionProgress: CollectionProgress

# Strategy evaluation request / response
class StrategyUpdateRequest(BaseModel):
    invoice_id: str
    due_date: str
    amount: float
    client_name: str
    payment_status: Optional[InvoiceStatus] = None

class StrategyUpdateResponse(BaseModel):
    days_overdue: int
    status: InvoiceStatus
    risk_level: RiskLevel
    current_escalation_tier: int
    next_action: str

# Reminder generation
class GenerateReminderRequest(BaseModel):
    invoice_id: str
    client_name: str
    amount_due: float
    days_overdue: int
    tone: Optional[str] = "professional"

class GenerateReminderResponse(BaseModel):
    reminder: ReminderPreview
```

---

## 4. Strategy Engine Logic

All deterministic heuristics live in `backend/app/services/strategy_service.py`. The core function
`evaluate_invoice` receives an invoice identifier, due date and amount, calculates the overdue
days, determines the escalation tier, and builds a **full strategy recommendation** (`StrategyResult`).

### 4.1 `StrategyResult` contract

| Days Overdue        | Escalation Tier | Invoice Status | Risk Level | Next Action                                  |
| ------------------- | --------------- | -------------- | ---------- | -------------------------------------------- |
| ≤ 0                 | 1               | `PENDING`      | `LOW`      | Awaiting due date                            |
| ≤ 7                 | 2               | `OVERDUE`      | `LOW`      | Friendly Email                               |
| ≤ 14                | 3               | `IN_PROGRESS`  | `MEDIUM`   | Reminder SMS                                 |
| ≤ 30                | 4               | `ESCALATED`    | `HIGH`     | Phone Call → Escalation Email → Final Notice |
| > 30, amount > $50k | 5               | `CRITICAL`     | `CRITICAL` | Collections Referral                         |
| > 30, amount ≤ $50k | 5               | `ESCALATED`    | `HIGH`     | Collections Referral                         |

```json
{
  "invoice_id": "string",
  "days_overdue": 0,
  "status": "Overdue",
  "risk_level": "Low",
  "tier": "day_7",
  "action": "payment_reminder",
  "channel": "email",
  "tone": "friendly",
  "schedule": "immediate",
  "reasoning": "optional free‑text explanation",
  "decision": "pending"
}
```

* **invoice_id** – the invoice identifier being evaluated.
* **days_overdue** – integer number of days past the due date (`0` when not overdue).
* **status** – one of the `InvoiceStatus` enum values (e.g., `OVERDUE`, `PAID`).
* **risk_level** – one of the `RiskLevel` enum values.
* **tier** – string identifier of the escalation tier (`day_0`, `day_3`, …).
* **action** – high‑level action name (e.g., `payment_reminder`, `phone_call`).
* **channel** – communication channel (`email`, `sms`, `phone`, `invoice_delivery`).
* **tone** – tone of the next interaction (`friendly`, `professional`, `firm`, `protective`, `legal`).
* **schedule** – when the action should be performed (`immediate` or an ISO‑8601 date string when a promise‑to‑pay is present).
* **reasoning** – optional human‑readable explanation of the decision.
* **decision** – owner’s current decision (`pending`, `approved`, `rejected`).

### 4.2 New enums

| Enum | Values |
|------|--------|
| `Channel` | `email`, `sms`, `phone`, `invoice_delivery` |
| `Tone` | `friendly`, `professional`, `firm`, `protective`, `legal` |
| `Decision` | `pending`, `approved`, `rejected` |

These enums are defined in `backend/app/schemas/schemas.py` and are imported by the routers.

### 4.3 Deterministic escalation mapping (`ESCALATION_TIERS`)

```python
ESCALATION_TIERS = [
    {"tier": "day_0",  "minimum_days_overdue": 0,  "action": "invoice_issue",        "channel": Channel.EMAIL,  "tone": Tone.FRIENDLY,      "schedule": "immediate"},
    {"tier": "day_3",  "minimum_days_overdue": 3,  "action": "payment_reminder",    "channel": Channel.EMAIL,  "tone": Tone.FRIENDLY,      "schedule": "immediate"},
    {"tier": "day_7",  "minimum_days_overdue": 7,  "action": "payment_reminder",    "channel": Channel.SMS,    "tone": Tone.FIRM,          "schedule": "immediate"},
    {"tier": "day_14", "minimum_days_overdue": 14, "action": "phone_call",          "channel": Channel.PHONE,  "tone": Tone.PROFESSIONAL, "schedule": "immediate"},
    {"tier": "day_21", "minimum_days_overdue": 21, "action": "escalation_email",    "channel": Channel.EMAIL,  "tone": Tone.PROTECTIVE,   "schedule": "immediate"},
    {"tier": "day_30", "minimum_days_overdue": 30, "action": "collections_referral", "channel": Channel.EMAIL,  "tone": Tone.LEGAL,        "schedule": "immediate"},
]
```

The service selects the **last tier** whose `minimum_days_overdue` is less than or equal to the
calculated `days_overdue`.

### 4.4 `evaluate_invoice`

Signature (as of the current implementation):

```python
def evaluate_invoice(
    invoice_id: str,
    due_date: datetime,
    amount: float,
    reference_date: datetime | None = None,
) -> dict:
    ...
```

* Calculates `days_overdue = max((reference_date or 2026‑06‑22) - due_date, 0)`.
* Looks up the appropriate tier using `_lookup_tier`.
* Derives `status` via `_invoice_status` and `risk_level` via `_risk_level`.
* Checks for a stored `DebtorResponse` (see section 4.5) and adjusts `action`, `channel`, `tone`
  and `schedule` accordingly:
  * **promise_to_pay** – schedule is set to the promised date, tone softened to *friendly*.
  * **financial_hardship** – tone becomes *protective*.
  * **dispute** – action changes to `dispute_review`, channel forced to **email**, tone set to *professional*.
* Retrieves the current owner decision (`pending` by default) from the in‑memory approval store.
* Returns a plain ``dict`` that matches the `StrategyResult` model.

### 4.5 `DebtorResponse` contract (used by Hiếu)

```json
{
  "invoice_id": "string",
  "intent": "promise_to_pay" | "dispute" | "financial_hardship" | "question" | "refusal" | "unknown",
  "promised_date": "2026-08-14T00:00:00" ,
  "amount": 5000.0
}
```

Only `invoice_id` and `intent` are required; `promised_date` and `amount` are optional and used
by the strategy engine when the intent is `promise_to_pay`.

### 4.6 In‑memory state (mock stage)

* **Debtor responses** are stored in the module‑level dict `_DEBTOR_RESPONSES` inside
  `strategy_service.py`. They persist only for the lifetime of the process.
* **Owner approvals** are stored in `_APPROVALS` (same module). The default state is `pending`.
* This approach keeps the current implementation fully deterministic and removes any
  database dependency. Future work will replace these with PostgreSQL tables.

---

## 5. Mock Data

Everything is in-memory. No database is required to run the backend.

| Variable            | Value                                               |
| ------------------- | --------------------------------------------------- |
| Mock invoice ID     | `INV-2024-0847`                                     |
| Mock client         | `Northgate Medical Group`                           |
| Mock amount         | `$24,750.00`                                        |
| Mock due date       | `2026-06-15` (7 days overdue against reference)     |
| Collection timeline | 6 steps (0 → 30 days)                               |
| Communications      | 3 entries (delivery, email, SMS)                    |
| Contact             | Sarah Mitchell, Billing Manager, 78 % response rate |

---

## 6. How to Run

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` to explore and test endpoints interactively.

### Quick Tests

**Linux / Mac (bash)**

```bash
# Health
curl http://127.0.0.1:8000/health

# Invoice detail
curl http://127.0.0.1:8000/api/v1/invoices/INV-2024-0847/detail

# Strategy evaluation
curl -X POST http://127.0.0.1:8000/api/v1/strategy/update \
  -H "Content-Type: application/json" \
  -d '{"invoice_id":"INV-2024-0847","due_date":"2026-06-15","amount":24750.0,"client_name":"Northgate Medical Group"}'

# Generate reminder
curl -X POST http://127.0.0.1:8000/api/v1/strategy/generate-reminder \
  -H "Content-Type: application/json" \
  -d '{"invoice_id":"INV-2024-0847","client_name":"Northgate Medical Group","amount_due":24750.0,"days_overdue":7}'
```

**Windows (PowerShell)**

```powershell
# Health
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing

# Invoice detail
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/invoices/INV-2024-0847/detail" -UseBasicParsing

# Strategy evaluation
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/strategy/update" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"invoice_id":"INV-2024-0847","due_date":"2026-06-15","amount":24750.0,"client_name":"Northgate Medical Group"}'

# Generate reminder
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/strategy/generate-reminder" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"invoice_id":"INV-2024-0847","client_name":"Northgate Medical Group","amount_due":24750.0,"days_overdue":7}'
```
