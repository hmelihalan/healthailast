"use client";

import { CheckCircle } from "lucide-react";
import { useTransition } from "react";

export default function PartnerFoundButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    if (window.confirm("Are you sure you want to mark this project as 'Partner Found'? This action cannot be reversed and will reject all future meeting requests.")) {
      startTransition(async () => {
        await onConfirm();
      });
    }
  };

  return (
    <button 
      onClick={handleAction} 
      disabled={isPending}
      className="btn btn-success" 
      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
    >
      <CheckCircle size={14} /> {isPending ? "Marking..." : "Mark Partner Found"}
    </button>
  );
}
