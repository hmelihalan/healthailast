import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import AdminActionsClient from "@/app/admin/AdminActionsClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const posts = await db.post.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: 'desc' }
  });

  const sentRequests = await db.meetingRequest.findMany({
    where: { requesterId: session.userId },
    include: {
      post: { select: { title: true, id: true, owner: { select: { institution: true, role: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="fade-in" style={{ padding: '1rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {session.email} <span className="badge badge-draft" style={{ marginLeft: '0.5rem' }}>{session.role}</span></p>
        </div>
        <Link href="/dashboard/create" className="btn btn-primary">
          <PlusCircle size={18} /> New Post
        </Link>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Your Announcements</h2>
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t posted any projects or requests yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {posts.map(post => (
              <div key={post.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{post.title}</h3>
                  <span className={`badge badge-${post.status.toLowerCase().split(' ')[0]}`}>{post.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Domain:</strong> {post.domain}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Stage:</strong> {post.projectStage}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                   <Link href={`/posts/${post.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1 }}>
                     View Post <ExternalLink size={14} />
                   </Link>
                    <Link href={`/dashboard/posts/${post.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Edit
                    </Link>
                    <div style={{ marginLeft: 'auto' }}>
                      <AdminActionsClient action="delete_post" targetId={post.id} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Your Expressed Interests</h2>
        {sentRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t expressed interest in any projects yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {sentRequests.map(req => (
              <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{req.post.title}</h3>
                  <span className={`badge`} style={{ 
                    background: req.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 
                               req.status === 'Scheduled' ? 'rgba(16, 185, 129, 0.1)' : 
                               req.status === 'Accepted' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: req.status === 'Pending' ? '#eab308' : 
                           req.status === 'Scheduled' ? '#10b981' : 
                           req.status === 'Accepted' ? '#3b82f6' : '#ef4444'
                  }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Owner:</strong> {req.post.owner.role} from {req.post.owner.institution}
                </p>

                {req.status === 'Accepted' && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--success-color)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Your interest was accepted!
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Click "View Post" below to propose a meeting time.
                    </p>
                  </div>
                )}
                
                {req.status === 'Time Proposed' && req.timeSlots && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>Time Proposed</p>
                    <p style={{ fontSize: '0.9rem' }}>{new Date(req.timeSlots).toLocaleString()}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Waiting for owner to accept.</p>
                  </div>
                )}
                
                {req.status === 'Scheduled' && req.timeSlots && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: 600 }}>Meeting Scheduled</p>
                    <p style={{ fontSize: '0.9rem' }}>{new Date(req.timeSlots).toLocaleString()}</p>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex' }}>
                   <Link href={`/posts/${req.postId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1, textAlign: 'center' }}>
                     View Post <ExternalLink size={14} style={{ display: 'inline' }} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
