import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI AR Manager",
  description: "Accounts receivable management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">AI AR Manager</div>

            <nav className="nav-links">
              <Link href="/overview" className="nav-link">
                Overview
              </Link>

              <Link href="/invoices" className="nav-link">
                Invoices
              </Link>

              <Link href="/clients" className="nav-link">
                Clients
              </Link>

              <Link href="/analytics" className="nav-link">
                Analytics
              </Link>

              <Link href="/transition" className="nav-link">
                Transition
              </Link>

              <Link href="/settings" className="nav-link">
                Settings
              </Link>

              <Link href="/login" className="nav-link">
                Log In
              </Link>
            </nav>
          </aside>

          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}