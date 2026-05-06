"use client";

import { useActionState, useState } from "react";
import { requestMeeting } from "@/actions/meetingActions";
import { Info } from "lucide-react";

type ActionState = {
  success: boolean;
  error: string;
};

export default function MeetingRequestForm({ postId }: { postId: string }) {
  const [success, setSuccess] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
      const res = await requestMeeting(formData);
      if (res?.success) {
        setSuccess(true);
        return { success: true, error: "" };
      }
      return { success: false, error: res?.error || "Failed to request meeting" };
    },
    { success: false, error: "" }
  );

  if (success) {
    return (
      <div className="card fade-in" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)' }}>
        <h4 style={{ color: 'var(--success-color)', fontWeight: 600, marginBottom: '0.5rem' }}>Meeting Requested Successfully!</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>The project owner has been notified. You will see an update in your dashboard if they accept.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        Express Interest & Request Meeting
      </h3>
      
      {state?.error && (
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', border: '1px solid var(--danger-color)' }}>
          {state.error}
        </div>
      )}

      <input type="hidden" name="postId" value={postId} />

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Propose a Time Slot</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select a specific date and time for the meeting</p>
        <input type="datetime-local" name="timeSlots" required className="input-field" />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Short Message (Optional)</label>
        <textarea name="message" className="input-field" rows={3} placeholder="Briefly state why your expertise matches this project..." style={{ resize: 'vertical' }}></textarea>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <input type="checkbox" id="ndaAccepted" name="ndaAccepted" required style={{ marginTop: '0.25rem', cursor: 'pointer' }} />
          <label htmlFor="ndaAccepted" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Non-Disclosure Agreement (NDA) Acceptance</strong><br />
            I agree that any information shared during the requested meeting will remain confidential and will not be used or disclosed outside of this collaboration without the explicit consent of the disclosing party.
          </label>
        </div>
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        {isPending ? "Sending Request..." : "Accept NDA & Send Request"}
      </button>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', justifyContent: 'center', marginTop: '0.5rem' }}>
        <Info size={14} /> Meetings occur externally. No recordings are stored on HEALTH AI.
      </div>
    </form>
  );
}
