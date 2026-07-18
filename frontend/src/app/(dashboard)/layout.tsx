import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  if (!cookieStore.get("ar_session")) {
    redirect("/login");
  }

  return (
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
  );
}
