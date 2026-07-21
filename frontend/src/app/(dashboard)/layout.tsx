import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TopNav from "./TopNav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*const cookieStore = await cookies();
  if (!cookieStore.get("ar_session")) {
    redirect("/login");
  }*/

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

