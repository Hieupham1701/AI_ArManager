# AI Invoice Management Agent — AR Automation Platform

> An AI-powered accounts receivable platform for SMBs that autonomously manages invoice collections. The AI agent prioritizes overdue invoices, determines the best follow-up timing and communication strategy, and personalizes client interactions to improve cash flow while reducing manual collection efforts.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**AI Account Receivable Manager** is a full-stack application designed to help businesses automate and optimize their accounts receivable processes. It features:

- **Intelligent Invoice Management** — AI-driven prioritization of overdue invoices
- **Smart Collection Strategies** — Deterministic heuristics for optimal follow-up timing and methods
- **Multi-Channel Communications** — Email, SMS, and phone communication tracking
- **Real-time Analytics** — Dashboards for collection trends, KPIs, and telephony data
- **Secure Authentication** — User account management with password reset and profile settings

---

## ✨ Features

### Core Functionality

- 🤖 **AI Strategy Engine** — Automatically determines next collection actions based on invoice metadata
- 📊 **Collection Timeline** — Visualize collection progress with step-by-step timelines
- 💬 **Communication History** — Track all interactions with clients (emails, calls, SMS)
- 📞 **Reminder Generation** — AI-generated payment reminders with customizable tone
- 👥 **Client Management** — Maintain client profiles with contact info and response rates
- 📈 **Analytics Dashboard** — Real-time KPIs, collection trends, and queue management

### Authentication & Security

- User signup and login
- Password reset and change workflows
- Session management with JWT tokens
- Protected endpoints requiring authentication

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | ≥0.111.0 | Web framework & API server |
| **Uvicorn** | ≥0.30.0 | ASGI application server |
| **Pydantic** | ≥2.9.0 | Data validation & schemas |
| **Supabase** | ≥2.5.0 | Database & auth backend |
| **Python-dotenv** | ≥1.0.0 | Environment configuration |
| **httpx** | ≥0.27 | HTTP client library |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | ^16.2.11 | React framework & SSR |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 7.0.2 | Type safety |
| **Tailwind CSS** | ^4.3.3 | Utility-first CSS framework |
| **ECharts** | ^6.1.0 | Data visualization charts |
| **Lucide React** | ^0.475.0 | Icon library |
| **Playwright** | ^1.62.0 | E2E testing |

### Infrastructure

- **Supabase** — PostgreSQL database and authentication
- **Environment Variables** — Configuration management

---

## 📁 Project Structure

```
AI_ArManager/
├── backend/                      # FastAPI backend
│   ├── main.py                  # Entry point
│   ├── config.py                # Configuration & env vars
│   ├── requirements.txt          # Python dependencies
│   ├── api/
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── invoices.py          # Invoice retrieval endpoints
│   │   └── strategy.py          # Strategy orchestration endpoints
│   └── app/
│       ├── models/              # Database models (SQLAlchemy)
│       ├── schemas/             # Pydantic request/response schemas
│       ├── routers/             # API route handlers
│       └── services/            # Business logic & strategy engine
│
├── frontend/                     # Next.js frontend
│   ├── package.json             # Node dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.ts       # Tailwind CSS config
│   ├── next.config.js           # Next.js configuration
│   ├── playwright.config.ts     # E2E testing config
│   └── src/
│       ├── app/                 # Next.js app directory
│       │   ├── layout.tsx       # Root layout
│       │   ├── (dashboard)/     # Dashboard routes
│       │   └── login/           # Auth pages
│       ├── components/          # Reusable React components
│       ├── lib/                 # Utilities & API client
│       └── types/               # TypeScript type definitions
│
├── docs/                        # Documentation
├── test-results/                # Test output
└── README.md                    # This file
```

---

## 📦 Prerequisites

### Required

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn** (package manager)
- **Supabase Account** (free tier available at https://supabase.com)

### Environment Variables

Both backend and frontend require `.env` configuration files with Supabase credentials.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_ArManager
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file and add Supabase credentials
# Copy .env.example to .env (if available)
# Add:
#   SUPABASE_URL=<your_supabase_url>
#   SUPABASE_KEY=<your_supabase_anon_key>
#   FRONTEND_URL=http://localhost:3001

# Start backend server (runs on http://localhost:8000)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file and add backend API URL
# Add:
#   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api

# Start development server (runs on http://localhost:3001)
npm run dev -- --port 3001

# Open browser to http://localhost:3001
```

### 4. Quick Access (Optional)

If login is blocked, you can bypass auth by opening the browser console and running:

```javascript
document.cookie = "ar_session=1; path=/; SameSite=Lax";
```

---

## 🔌 API Documentation

### Base URL
- **Development:** `http://localhost:8000/api`
- **Production:** (to be configured)

### Authentication Endpoints (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Authenticate user |
| `POST` | `/refresh` | Refresh access token |
| `POST` | `/logout` | Logout user |
| `GET` | `/profile` | Get user profile (protected) |
| `PUT` | `/profile` | Update user profile (protected) |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |
| `POST` | `/change-password` | Change password (authenticated) |

### Invoice Endpoints (`/v1/invoices`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/{invoice_id}/detail` | Get complete invoice summary with strategy |
| `GET` | `/{invoice_id}/timeline` | Get collection timeline steps |
| `GET` | `/{invoice_id}/communications` | Get communication history |
| `GET` | `/{invoice_id}/contact` | Get primary billing contact |
| `GET` | `/{invoice_id}/reminder` | Get AI-generated reminder preview |

### Strategy Endpoints (`/v1/strategy`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/update` | Evaluate invoice and return strategy metadata |
| `POST` | `/generate-reminder` | Generate a reminder preview |

### Health Check (`/health`)

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/health` | `{"status": "ok"}` |

### Key Data Models

**Invoice Status:** `OVERDUE`, `IN_PROGRESS`, `ESCALATED`, `CRITICAL`, `PAID`, `PENDING`

**Risk Levels:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Communication Types:** `EMAIL`, `SMS`, `PHONE`, `INVOICE_DELIVERY`

### Example Request (Strategy Update)

```bash
POST /api/v1/strategy/update
Content-Type: application/json

{
  "invoice_id": "INV-001",
  "due_date": "2026-05-22",
  "amount": 5000.00,
  "client_name": "Acme Corp",
  "payment_status": "overdue"
}
```

### Example Response

```json
{
  "days_overdue": 31,
  "status": "CRITICAL",
  "risk_level": "CRITICAL",
  "current_escalation_tier": 3,
  "next_action": {
    "action": "phone_call",
    "scheduled_date": "2026-06-23",
    "workflow": "executive_escalation"
  }
}
```

---

## 🧪 Testing

### Frontend Testing

Run Playwright E2E tests:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Run tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# View test results
npx playwright show-report
```

Test files are located in `frontend/tests/`.

### Backend Testing

To add backend tests, create a `tests/` directory in the `backend/` folder and use **pytest** with FastAPI's test client.

Example:

```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/
```

---

## 📊 Frontend Pages & Routes

- **`/`** — Redirects to dashboard
- **`/login`** — Login page
- **`/login/signup`** — User registration
- **`/login/forgotpassword`** — Password reset request
- **`/login/resetpassword`** — Password reset confirmation
- **`/(dashboard)/`** — Main dashboard
- **`/(dashboard)/overview`** — Overview & KPIs
- **`/(dashboard)/invoices`** — Invoice list & search
- **`/(dashboard)/invoices/[id]/strategy`** — Invoice-specific strategy
- **`/(dashboard)/strategy`** — Strategy management
- **`/(dashboard)/communications`** — Communication history
- **`/(dashboard)/clients`** — Client management
- **`/(dashboard)/analytics`** — Analytics & reporting
- **`/(dashboard)/settings`** — User settings

---

## 🔐 Environment Configuration

### Backend `.env` (Required)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SERVICE_ROLE_KEY=your_service_role_key_here
FRONTEND_URL=http://localhost:3001
```

### Frontend `.env.local` (Required)

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

> **Note:** Any variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never expose secrets like API keys.

---

## 🏗 Architecture Highlights

### Backend Architecture

- **Modular Router Design** — Separate routers for auth, invoices, and strategy
- **Schema Validation** — Pydantic models enforce strict request/response contracts
- **Service Layer** — Business logic isolated in services (strategy engine, reminders)
- **CORS Enabled** — Permissive CORS for local development

### Strategy Engine

The strategy engine (`backend/app/services/strategy_service.py`) computes collection actions deterministically:

- **Days Overdue** — Calculated from invoice due date
- **Risk Assessment** — Escalates from LOW → CRITICAL based on age
- **Next Action** — Suggests follow-up method and timing
- **Escalation Tiers** — Progresses through reminder → formal notice → legal threat

---

## 🚢 Building for Production

### Backend

```bash
cd backend
pip install -r requirements.txt
# Use a production ASGI server:
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

> Deploy using Vercel, Netlify, AWS, or your preferred hosting platform.

---

## 📝 Contributing

When contributing to this project:

1. Create a feature branch from `main`
2. Follow the existing code structure and naming conventions
3. Add tests for new functionality
4. Update documentation and this README if needed
5. Submit a pull request with a clear description

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Testing](https://playwright.dev/)

---

## 📄 License

Project maintained by Ola_Team4.

---

## 🤝 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.
