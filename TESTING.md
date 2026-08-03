# Testing Guide (Frontend + Backend)

This guide is the quickest way to run and validate the app locally.

## 1. Start backend (Terminal 1)

```powershell
cd C:\Users\ASUS\Desktop\AI_ArManager\backend
copy .env.example .env
```

Update `.env`:

- `SUPABASE_URL=<your_supabase_url>`
- `SUPABASE_KEY=<your_supabase_anon_key>`
- `FRONTEND_URL=http://localhost:3001`

Then run:

```powershell
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 2. Start frontend (Terminal 2)

```powershell
cd C:\Users\ASUS\Desktop\AI_ArManager\frontend
copy .env.example .env.local
```

Update `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

Run:

```powershell
npm install
npm run dev -- --port 3001
```

Open: `http://localhost:3001`

## 3. Quick UI access without auth (optional)

If login/signup is blocked by auth data, open browser DevTools Console at `http://localhost:3001` and run:

```js
document.cookie = "ar_session=1; path=/; SameSite=Lax";
localStorage.setItem("ar_auth", JSON.stringify({
  access_token: "dev-token",
  refresh_token: "dev-refresh",
  user: { id: "dev-user", email: "dev@local.test" }
}));
window.location.assign("/overview");
```

## 4. Manual page checklist

Visit:

- `/overview`
- `/invoices`
- `/invoices/INV-2024-0847/strategy`
- `/clients`
- `/communications`
- `/strategy`
- `/analytics`
- `/settings` (requires valid auth token for profile actions)

## 5. Invoice strategy page checks (important)

On `/invoices/INV-2024-0847/strategy` verify:

- `Communication History` is visible on **mobile and desktop**.
- `Next Scheduled Action` and `AI Reminder Preview` do not overlap other cards.
- `Collection Strategy Timeline` shows 3 steps by default with **View more / View less**.
- No extra blank whitespace under the last visible timeline step.

## 6. Production sanity check

```powershell
cd C:\Users\ASUS\Desktop\AI_ArManager\frontend
npm run type-check
npm run build
npm run start -- --port 3002
```

Open: `http://localhost:3002`

## 7. Common issues

- `EADDRINUSE` on 3000/3001:
  - run `Get-NetTCPConnection -LocalPort <port> | Select-Object -First 1 -ExpandProperty OwningProcess`
  - then `Stop-Process -Id <PID>`
- `Unable to reach the server...`:
  - backend is not running on `127.0.0.1:8000`, or `NEXT_PUBLIC_API_BASE_URL` is wrong.
- CORS/auth issues:
  - ensure backend `.env` `FRONTEND_URL` matches your frontend URL exactly (host + port).
