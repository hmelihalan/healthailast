import { db } from "@/lib/db";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import AdminActionsClient from "../AdminActionsClient";

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ domain?: string, status?: string, date?: string }> }) {
  const resolvedParams = await searchParams;
  const domain = resolvedParams.domain || "";
  const status = resolvedParams.status || "all";
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
      status: status !== "all" ? status : undefined,
      domain: domain ? { contains: domain, mode: 'insensitive' } : undefined,
      createdAt: dateFilter !== "all" ? dateQuery : undefined,
    },
    include: {
      owner: {
        select: { institution: true, role: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Post Moderation</h2>
      
      {/* Search Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-color)' }}>
        <form style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" name="domain" defaultValue={domain} placeholder="Search by Domain..." className="form-input" style={{ flex: 1, minWidth: '150px' }} />
          
          <select name="status" defaultValue={status} className="form-input" style={{ width: '150px' }}>
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Partner Found">Partner Found</option>
            <option value="Draft">Drafts</option>
          </select>
          
          <select name="date" defaultValue={dateFilter} className="form-input" style={{ width: '150px' }}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary"><Search size={16} /> Filter</button>
            <Link href="/admin/posts" className="btn btn-secondary">Clear</Link>
          </div>
        </form>
      </div>

      {/* Results Table/List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No posts found matching criteria.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {post.domain} • By {post.owner.email} ({post.owner.role}) • {post.createdAt.toLocaleDateString()}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span className={`badge badge-${post.status.toLowerCase().split(' ')[0]}`}>{post.status}</span>
                <Link href={`/posts/${post.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  View <ExternalLink size={14} />
                </Link>
                <div style={{ borderLeft: '1px solid var(--surface-border)', paddingLeft: '1rem' }}>
                  <AdminActionsClient action="delete_post" targetId={post.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
