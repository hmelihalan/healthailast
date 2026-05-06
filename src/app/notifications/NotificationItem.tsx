"use client";

import { useTransition } from "react";
import { CheckCircle, Info, BellDot } from "lucide-react";
import { markAsRead } from "@/actions/notificationActions";

type NotificationProps = {
  notification: {
    id: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  };
};

export default function NotificationItem({ notification }: NotificationProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      startTransition(() => {
        markAsRead(notification.id);
      });
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "MEETING_REQUEST":
        return <BellDot size={20} color="var(--accent-color)" />;
      case "MEETING_UPDATE":
      case "POST_UPDATE":
        return <CheckCircle size={20} color="var(--success-color)" />;
      default:
        return <Info size={20} color="var(--accent-color)" />;
    }
  };

  const getBorderColor = () => {
    if (notification.isRead) return "transparent";
    return notification.type === "MEETING_REQUEST" ? "var(--accent-color)" : "var(--success-color)";
  };

  return (
    <div 
      className="card" 
      style={{ 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'flex-start', 
        borderLeft: `4px solid ${getBorderColor()}`,
        opacity: notification.isRead ? 0.6 : 1,
        transition: 'opacity 0.2s',
        cursor: notification.isRead ? 'default' : 'pointer'
      }}
      onClick={handleMarkAsRead}
    >
      <div style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '50%' }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          {notification.type.replace("_", " ")}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{notification.message}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      {!notification.isRead && (
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 500, alignSelf: 'center' }}>
          {isPending ? "Marking..." : "Click to mark read"}
        </div>
      )}
    </div>
  );
}
