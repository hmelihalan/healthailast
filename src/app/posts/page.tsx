import { db } from "@/lib/db";
import Link from "next/link";
import { Search, MapPin, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/session";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ domain?: string, city?: string, requiredExpertise?: string, status?: string, date?: string }> }) {
  const session = await getSession();
  const resolvedParams = await searchParams;
  const domain = resolvedParams.domain || "";
  const city = resolvedParams.city || "";
  const requiredExpertise = resolvedParams.requiredExpertise || "";
  const status = resolvedParams.status || "Active";
  const dateFilter = resolvedParams.date || "all";

  let dateQuery = {};
  if (dateFilter === "today") {
    dateQuery = { gte: new Date(new Date().setHours(0,0,0,0)) };
  } else if (dateFilter === "week") {
    dateQuery = { gte: new Date(new Date().setDate(new Date().getDate() - 7)) };
  } else if (dateFilter === "month") {
    dateQuery = { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
  }

  const posts = await db.post.findMany({
    where: {
      status,
      ...(status === 'Draft' ? { ownerId: session?.userId || 'none' } : {}),
      domain: domain ? { contains: domain, mode: 'insensitive' } : undefined,
      city: city ? { contains: city, mode: 'insensitive' } : undefined,
      requiredExpertise: requiredExpertise ? { contains: requiredExpertise, mode: 'insensitive' } : undefined,
      createdAt: dateFilter !== "all" ? dateQuery : undefined,
    },
    include: {
      owner: {
        select: { institution: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="fade-in" style={{ padding: '1rem 0' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Discover Projects</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find complimentary expertise and collaborate on innovative health-tech.</p>
      </header>

      {/* Search Filters */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
        <form style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <input type="text" name="domain" defaultValue={domain} placeholder="Domain..." className="input-field" style={{ margin: 0 }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <input type="text" name="city" defaultValue={city} placeholder="City..." className="input-field" style={{ margin: 0 }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <input type="text" name="requiredExpertise" defaultValue={requiredExpertise} placeholder="Expertise..." className="input-field" style={{ margin: 0 }} />
          </div>
          <div style={{ width: '150px' }}>
            <select name="status" defaultValue={status} className="input-field" style={{ margin: 0 }}>
              <option value="Active">Active</option>
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Partner Found">Partner Found</option>
              {session && <option value="Draft">Drafts (Mine)</option>}
            </select>
          </div>
          <div style={{ width: '150px' }}>
            <select name="date" defaultValue={dateFilter} className="input-field" style={{ margin: 0 }}>
              <option value="all">Any Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary"><Search size={16} /> Filter</button>
            <Link href="/posts" className="btn btn-secondary">Clear</Link>
          </div>
        </form>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {posts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
            No announcements found matching your criteria.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{post.title}</h3>
                <span className={`badge badge-${post.status.toLowerCase().split(' ')[0]}`}>{post.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Posted by {post.owner.role} at {post.owner.institution}
              </p>
              
              <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <p><strong>Required:</strong> {post.requiredExpertise}</p>
                <p><strong>Stage:</strong> {post.projectStage}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} /> {post.city}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                 <Link href={`/posts/${post.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                   View Details <ExternalLink size={14} />
                 </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
