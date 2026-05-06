"use client";

import { useSearchParams } from "next/navigation";
import { verifyAndLogin } from "@/actions/authActions";
import { useEffect, useState, useTransition } from "react";
import { ShieldCheck, Mail } from "lucide-react";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (email && token) {
      startTransition(async () => {
        const res = await verifyAndLogin(email, token);
        if (res?.error) {
          setError(res.error);
        }
      });
    }
  };

  if (!email) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>No email provided.</div>;
  }

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Mail size={32} color="var(--success-color)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Verify Your Email</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          We&apos;ve simulated sending a verification token to <strong>{email}</strong>. 
          Please check your terminal logs for the mock email and enter the 6-digit token below:
        </p>

        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          placeholder="Enter token" 
          className="form-input" 
          style={{ marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }}
          maxLength={6}
        />

        <button 
          onClick={handleVerify} 
          disabled={isPending || !token} 
          className="btn btn-primary" 
          style={{ width: '100%' }}
        >
          {isPending ? "Verifying..." : "Verify Token"}
        </button>
      </div>
    </div>
  );
}
