import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NotificationItem from "./NotificationItem";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bell size={28} color="var(--accent-color)" />
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Notifications</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You have no notifications at this time.</p>
        ) : (
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
}
