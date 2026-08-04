# AI Invoice Management Agent — Backend

## 1. Architecture

```
backend/
├── main.py ⭐              # Clean entry point — imports & registers routers
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

## 3. API Endpoints

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Authenticate user |
| `POST` | `/refresh` | Refresh access token |
| `POST` | `/logout` | Logout user |
| `GET` | `/profile` | Get user profile (protected) |
| `PUT` | `/profile` | Update user profile (protected) |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |
| `POST` | `/change-password` | Change password (authenticated) |

### Invoices (`/api/v1/invoices/{invoice_id}`)

| Method | Path | Response Model | Description |
|--------|------|----------------|-------------|
| `GET` | `/detail` | `InvoiceDetail` | Full invoice summary + strategy metadata |
| `GET` | `/timeline` | `List[CollectionStep]` | Chronological collection steps |
| `GET` | `/communications` | `List[CommunicationLog]` | Communication history |
| `GET` | `/contact` | `Contact` | Primary billing contact |
| `GET` | `/reminder` | `ReminderPreview` | AI-generated reminder preview |

### Strategy (`/api/v1/strategy`)

| Method | Path | Request → Response | Description |
|--------|------|--------------------|-------------|
| `POST` | `/update` | `StrategyUpdateRequest` → `StrategyUpdateResponse` | Evaluate invoice → strategy metadata |
| `POST` | `/generate-reminder` | `GenerateReminderRequest` → `GenerateReminderResponse` | Generate a reminder preview |

### Health

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/health` | `{"status":"ok"}` |

> **Interactive docs:** `http://127.0.0.1:8000/docs` (Swagger UI)

---

## 4. API Contracts (Schemas)

| Enum | Values |
|------|--------|
| `InvoiceStatus` | `OVERDUE`, `IN_PROGRESS`, `ESCALATED`, `CRITICAL`, `PAID`, `PENDING` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `CollectionStepStatus` | `COMPLETED`, `ACTIVE`, `PENDING` |
| `CommunicationType` | `EMAIL`, `SMS`, `PHONE`, `INVOICE_DELIVERY` |
| `CommunicationStatus` | `DELIVERED`, `SENT`, `FAILED`, `PENDING` |
| `ReminderStatus` | `GENERATED`, `PENDING_APPROVAL`, `SENT` |

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

All heuristics are deterministic and live in `app/services/strategy_service.py`.

| Days Overdue | Escalation Tier | Invoice Status | Risk Level | Next Action |
|--------------|-----------------|----------------|------------|-------------|
| ≤ 0 | 1 | `PENDING` | `LOW` | Awaiting due date |
| ≤ 7 | 2 | `OVERDUE` | `LOW` | Friendly Email |
| ≤ 14 | 3 | `IN_PROGRESS` | `MEDIUM` | Reminder SMS |
| ≤ 30 | 4 | `ESCALATED` | `HIGH` | Phone Call → Escalation Email → Final Notice |
| > 30, amount > $50k | 5 | `CRITICAL` | `CRITICAL` | Collections Referral |
| > 30, amount ≤ $50k | 5 | `ESCALATED` | `HIGH` | Collections Referral |

> **Reference date is fixed at `2026-06-22`** so evaluations are reproducible during development. It will be replaced by `datetime.now()` once the system is live.

---

## 5. Mock Data

Everything is in-memory. No database is required to run the backend.

| Variable | Value |
|----------|-------|
| Mock invoice ID | `INV-2024-0847` |
| Mock client | `Northgate Medical Group` |
| Mock amount | `$24,750.00` |
| Mock due date | `2026-06-15` (7 days overdue against reference) |
| Collection timeline | 6 steps (0 → 30 days) |
| Communications | 3 entries (delivery, email, SMS) |
| Contact | Sarah Mitchell, Billing Manager, 78 % response rate |

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
