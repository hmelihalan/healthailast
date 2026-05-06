import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Download } from "lucide-react";

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ userEmail?: string, actionType?: string, date?: string }> }) {
  const resolvedParams = await searchParams;
  const userEmail = resolvedParams.userEmail || "";
  const actionType = resolvedParams.actionType || "all";
  const dateFilter = resolvedParams.date || "all";

  let dateQuery = {};
  if (dateFilter === "today") {
    dateQuery = { gte: new Date(new Date().setHours(0,0,0,0)) };
  } else if (dateFilter === "week") {
    dateQuery = { gte: new Date(new Date().setDate(new Date().getDate() - 7)) };
  } else if (dateFilter === "month") {
    dateQuery = { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
  }

  const logs = await db.activityLog.findMany({
    where: {
      actionType: actionType !== "all" ? actionType : undefined,
      timestamp: dateFilter !== "all" ? dateQuery : undefined,
      user: userEmail ? { email: { contains: userEmail, mode: 'insensitive' } } : undefined,
    },
    include: {
      user: { select: { email: true } }
    },
    orderBy: { timestamp: 'desc' },
    take: 100 // Limit to 100 on screen to avoid lag, CSV export does all
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Activity Logs & Audit Trail</h2>
        <a href="/api/admin/export-logs" target="_blank" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Export CSV
        </a>
      </div>
      
      {/* Search Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-color)' }}>
        <form style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" name="userEmail" defaultValue={userEmail} placeholder="User Email..." className="form-input" style={{ flex: 1, minWidth: '150px' }} />
          
          <select name="actionType" defaultValue={actionType} className="form-input" style={{ width: '200px' }}>
            <option value="all">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="REGISTER">Register</option>
            <option value="CREATE_POST">Create Post</option>
            <option value="REQUEST_MEETING">Request Meeting</option>
            <option value="PROPOSE_MEETING_TIME">Propose Time</option>
            <option value="ACCEPT_MEETING_SCHEDULE">Accept Schedule</option>
            <option value="ADMIN_DELETE_POST">Admin Delete Post</option>
            <option value="SUSPEND_USER">Suspend User</option>
          </select>
          
          <select name="date" defaultValue={dateFilter} className="form-input" style={{ width: '150px' }}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary"><Search size={16} /> Filter</button>
            <Link href="/admin/logs" className="btn btn-secondary">Clear</Link>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No logs found matching criteria.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{log.timestamp.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{log.user.email}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className="badge" style={{ background: 'var(--bg-color)' }}>{log.actionType}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{ color: log.resultStatus === 'SUCCESS' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 600 }}>
                      {log.resultStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
