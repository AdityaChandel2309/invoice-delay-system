import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 relative blueprint-grid">
        <Navbar />
        <main className="relative p-6">{children}</main>
      </div>
    </div>
  );
}
