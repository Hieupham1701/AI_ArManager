export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="hidden w-full flex-col justify-center bg-white p-10 text-slate-100 lg:flex lg:w-1/2 lg:p-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-carolina-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v4h4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 15h6M9 9h2" />
              </svg>
            </span>
            <span className="text-lg font-semibold text-slate-900">AI Invoice Agent</span>
          </div>

          <p className="mt-8 text-2xl font-bold leading-snug text-slate-900">
            Intelligent accounts receivable management for SMBs
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Auto-generate and send invoices in seconds",
              "Smart follow-up reminders that get paid faster",
              "Real-time AR aging reports and cash flow insights",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-carolina-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="h-3 w-3 text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-slate-900">{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-slate-900">
            Trusted by 2,400+ small businesses
          </p>
        </div>
      </div>

      {/* Right content area (per-page) */}
      <div className="flex w-full flex-1 items-center justify-center bg-white p-6 lg:w-1/2 lg:p-16">
        {children}
      </div>
    </div>
  );
}


