import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProfile } from "@/actions/authActions";

export default async function EditProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) redirect("/login");

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Profile
      </Link>
      
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit Profile</h2>
        
        <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" defaultValue={user.firstName || ""} required className="input-field" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" defaultValue={user.lastName || ""} required className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email (Immutable for Demo)</label>
            <input type="text" disabled defaultValue={user.email} className="input-field" style={{ opacity: 0.7 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Role (Immutable for Demo)</label>
            <input type="text" disabled defaultValue={user.role} className="input-field" style={{ opacity: 0.7 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Institution / Organization</label>
            <input type="text" name="institution" defaultValue={user.institution || ""} required className="input-field" />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input type="text" name="city" defaultValue={user.city || ""} required className="input-field" />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
