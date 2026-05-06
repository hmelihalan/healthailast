import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Building, MapPin, Calendar, Activity } from "lucide-react";
import AdminActionsClient from "../../AdminActionsClient";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const user = await db.user.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' }
      },
      meetingRequests: {
        include: { post: { select: { title: true } } },
        orderBy: { createdAt: 'desc' }
      },
      activityLogs: {
        orderBy: { timestamp: 'desc' },
        take: 20
      }
    }
  });

  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={24} /> {user.email}
            </h2>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={16} /> Verified: {user.emailVerified ? "Yes" : "No"}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building size={16} /> {user.institution}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> {user.city}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> Joined: {user.createdAt.toLocaleDateString()}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'var(--bg-color)', fontSize: '0.9rem' }}>Role: {user.role}</span>
              <span className="badge" style={{ 
                background: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: user.isActive ? 'var(--success-color)' : 'var(--danger-color)',
                fontSize: '0.9rem'
              }}>
                Status: {user.isActive ? "Active" : "Suspended"}
              </span>
            </div>
          </div>
          
          {user.role !== "Admin" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Admin Actions</span>
              <div style={{ background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <AdminActionsClient action="suspend" targetId={user.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Posts & Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Announcements Created ({user.posts.length})</h3>
            {user.posts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No announcements created.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {user.posts.map(post => (
                  <li key={post.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{post.title}</span>
                    <span className={`badge badge-${post.status.toLowerCase().split(' ')[0]}`} style={{ fontSize: '0.7rem' }}>{post.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Meeting Requests ({user.meetingRequests.length})</h3>
            {user.meetingRequests.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No requests sent.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {user.meetingRequests.map(req => (
                  <li key={req.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{req.post.title}</span>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{req.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Recent Activity
          </h3>
          {user.activityLogs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No activity logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user.activityLogs.map(log => (
                <div key={log.id} style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '6px', borderLeft: log.resultStatus === 'SUCCESS' ? '3px solid var(--success-color)' : '3px solid var(--danger-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.actionType}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.timestamp.toLocaleString()}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: log.resultStatus === 'SUCCESS' ? 'var(--success-color)' : 'var(--danger-color)' }}>{log.resultStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
