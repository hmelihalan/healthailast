import { db } from "@/lib/db";

export default async function AdminOverviewPage() {
  const usersCount = await db.user.count();
  const postsCount = await db.post.count();
  const matchesCount = await db.post.count({ where: { status: "Partner Found" } });

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{usersCount}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{postsCount}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Announcements</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success-color)' }}>{matchesCount}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Successful Matches</p>
        </div>
      </div>
    </div>
  );
}
