
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#F8F6FA]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
