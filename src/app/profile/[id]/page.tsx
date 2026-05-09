import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building2, MapPin, User as UserIcon } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const user = await db.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { status: "Active" },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) notFound();

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Discover
      </Link>
      
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-color)' }}>
          <UserIcon size={40} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{user.firstName} {user.lastName}</h1>
        <p className="badge badge-active" style={{ marginBottom: '1.5rem' }}>{user.role}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> {user.institution}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} /> {user.city}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> {user.email}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Active Announcements</h2>
      
      {user.posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>This user has no active announcements.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {user.posts.map(post => (
            <div key={post.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{post.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{post.domain}</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                 <Link href={`/posts/${post.id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                   View Project
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
