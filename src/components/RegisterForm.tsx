"use client";

import { useActionState } from "react";
import { registerUser } from "@/actions/authActions";

type ActionState = {
  error: string;
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
      const res = await registerUser(formData);
      return { error: res?.error || "" };
    },
    { error: "" }
  );

  return (
    <form action={formAction} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {state?.error && (
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', border: '1px solid var(--danger-color)' }}>
          {state.error}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">First Name</label>
          <input type="text" name="firstName" required className="input-field" placeholder="John" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Last Name</label>
          <input type="text" name="lastName" required className="input-field" placeholder="Doe" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email (.edu only)</label>
        <input type="email" name="email" required className="input-field" placeholder="your.name@university.edu" />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input type="password" name="password" required className="input-field" minLength={6} />
      </div>

      <div className="form-group">
        <label className="form-label">Role</label>
        <select name="role" required className="input-field" style={{ appearance: 'none' }}>
          <option value="">Select your role...</option>
          <option value="Engineer">Engineer</option>
          <option value="Healthcare Professional">Healthcare Professional</option>
          {/* Admin role is usually hidden but for demo purposes we can leave it out. Seed data has Admin. */}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">City</label>
        <input type="text" name="city" required className="input-field" placeholder="e.g., Munich" />
      </div>

      <div className="form-group">
        <label className="form-label">Institution</label>
        <input type="text" name="institution" required className="input-field" placeholder="e.g., Tech University Munich" />
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
        {isPending ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
}
