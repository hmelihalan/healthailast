import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AlertCircle, FileJson } from "lucide-react";
import ProfileActionsClient from "./ProfileActionsClient";
import { logoutUser } from "@/actions/authActions";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) redirect("/login");

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Profile & Privacy</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account, export your data, and manage GDPR rights.</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Personal Information</h2>
          <Link href="/profile/edit" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Edit Profile
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <div><strong>First Name</strong></div><div>{user.firstName || "Not set"}</div>
          <div><strong>Last Name</strong></div><div>{user.lastName || "Not set"}</div>
          <div><strong>Email</strong></div><div>{user.email}</div>
          <div><strong>Role</strong></div><div>{user.role}</div>
          <div><strong>Institution</strong></div><div>{user.institution}</div>
          <div><strong>City</strong></div><div>{user.city}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data Export (GDPR)</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Request a copy of your personal data, posts, and meeting requests in a machine-readable format.
        </p>
        <a href="/api/export" target="_blank" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          <FileJson size={16} /> Export Data as JSON
        </a>
      </div>

      <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> Danger Zone
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Permanently delete your account and all associated data. This action cannot be undone and is a simulated flow for the demo.
        </p>
        <ProfileActionsClient />
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <form action={logoutUser}>
           <button type="submit" className="btn btn-secondary">Sign Out</button>
         </form>
      </div>

    </div>
  );
}
