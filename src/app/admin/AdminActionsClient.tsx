"use client";

import { Trash2, UserX } from "lucide-react";
import { useTransition } from "react";
import { suspendUser } from "@/actions/adminActions";
import { deletePost } from "@/actions/postActions";

export default function AdminActionsClient({ action, targetId }: { action: "suspend" | "delete_post", targetId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    if (!confirm(`Are you sure you want to ${action === 'suspend' ? 'suspend this user' : 'delete this post'}?`)) {
      return;
    }

    startTransition(async () => {
      if (action === "suspend") {
        await suspendUser(targetId);
      } else if (action === "delete_post") {
        await deletePost(targetId);
      }
    });
  };

  return (
    <button 
      onClick={handleAction} 
      disabled={isPending}
      style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.5 : 0.8 }} 
      title={action === 'suspend' ? "Suspend User" : "Remove Post"}
    >
      {action === "suspend" ? <UserX size={16} /> : <Trash2 size={16} />}
    </button>
  );
}
