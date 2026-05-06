import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    redirect("/dashboard");
  }

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={28} /> Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>System overview, user moderation, and audit logs.</p>
        </div>
      </header>

      <AdminNav />

      <div>
        {children}
      </div>
    </div>
  );
}
