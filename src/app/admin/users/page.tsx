import { db } from "@/lib/db";
import Link from "next/link";
import { Search } from "lucide-react";
import AdminActionsClient from "../AdminActionsClient";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string, status?: string, date?: string }> }) {
  const resolvedParams = await searchParams;
  const role = resolvedParams.role || "all";
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

  const users = await db.user.findMany({
    where: {
      role: role !== "all" ? role : undefined,
      isActive: status === "active" ? true : status === "suspended" ? false : undefined,
      createdAt: dateFilter !== "all" ? dateQuery : undefined,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>User Management</h2>
      
      {/* Search Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-color)' }}>
        <form style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select name="role" defaultValue={role} className="form-input" style={{ flex: 1, minWidth: '150px' }}>
            <option value="all">All Roles</option>
            <option value="Doctor">Doctor</option>
            <option value="Engineer">Engineer</option>
            <option value="Admin">Admin</option>
          </select>
          
          <select name="status" defaultValue={status} className="form-input" style={{ width: '150px' }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select name="date" defaultValue={dateFilter} className="form-input" style={{ width: '150px' }}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary"><Search size={16} /> Filter</button>
            <Link href="/admin/users" className="btn btn-secondary">Clear</Link>
          </div>
        </form>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {users.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No users found matching criteria.
          </div>
        ) : (
          users.map(u => (
            <div key={u.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Link href={`/profile/${u.id}`} style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem', textDecoration: 'none', color: 'var(--accent-color)', display: 'inline-block' }}>
                  {u.firstName} {u.lastName}
                </Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{u.email}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{u.role}</span>
                  <span>•</span>
                  <span>Joined {u.createdAt.toLocaleDateString()}</span>
                  <span>•</span>
                  <span style={{ color: u.isActive ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {u.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>
              
              <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--surface-border)' }}>
                {u.role !== "Admin" && (
                   <AdminActionsClient action="suspend" targetId={u.id} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
