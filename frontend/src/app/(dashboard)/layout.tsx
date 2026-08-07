import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// Footer component handles the action buttons, including conditional display of Save Strategy.
import Footer from "@/components/layout/Footer";
import TopNav from "./TopNav";

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
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNav />

      <main className="flex-1 overflow-y-auto mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>

       {/* Global Footer – moved to dedicated component */}
       <Footer />
    </div>
  );
}

