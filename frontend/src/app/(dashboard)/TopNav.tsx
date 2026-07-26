"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/strategy", label: "Invoices" },
  { href: "/clients", label: "Clients" },
  { href: "/analytics", label: "Analytics" },
  { href: "/communications", label: "Inbox" },
  { href: "/settings", label: "Settings" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex w-full items-center gap-6 px-4 sm:px-6 lg:px-8">
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
        <span className="whitespace-nowrap py-4 text-base font-semibold text-slate-900">
          AI AR Manager
        </span>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap border-b-2 px-3 py-4 text-sm font-medium transition ${active
                  ? "border-carolina-600 text-carolina-600"
                  : "border-transparent text-slate-600 hover:border-carolina-200 hover:text-carolina-600"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-carolina-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.66V5a2 2 0 1 0-4 0v.34A6 6 0 0 0 6 11v3.2a2 2 0 0 1-.6 1.4L4 17h5"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-carolina-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17l5-5-5-5M20 12H9M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
