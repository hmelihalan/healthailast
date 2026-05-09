"use client";

import { useSearchParams } from "next/navigation";
import { verifyAndLogin, resendVerification } from "@/actions/authActions";
import { useEffect, useState, useTransition, useCallback } from "react";
import { Mail, Clock, RefreshCw } from "lucide-react";

const TIMER_SECONDS = 600; // 10 minutes

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  const handleResend = () => {
    if (email && resendCooldown <= 0) {
      startTransition(async () => {
        const res = await resendVerification(email);
        if (res?.error) {
          setError(res.error);
        } else {
          setResendMessage("A new verification code has been sent!");
          setError("");
          setTimeLeft(TIMER_SECONDS);
          setResendCooldown(60); // 60 second cooldown between resends
          setTimeout(() => setResendMessage(""), 5000);
        }
      });
    }
  };

  if (!email) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>No email provided.</div>;
  }

  const isExpired = timeLeft <= 0;

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Mail size={32} color="var(--success-color)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Verify Your Email</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          We&apos;ve sent a verification code to <strong>{email}</strong>.
          Enter the 6-digit code below:
        </p>

        {/* Timer */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '1.5rem', padding: '0.6rem 1rem', borderRadius: '8px',
          background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          color: isExpired ? '#ef4444' : '#60a5fa',
          fontSize: '0.9rem', fontWeight: 500
        }}>
          <Clock size={16} />
          {isExpired ? 'Code expired — request a new one' : `Code expires in ${formatTime(timeLeft)}`}
        </div>

        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {resendMessage && <div style={{ color: 'var(--success-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>{resendMessage}</div>}

        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          placeholder="Enter 6-digit code" 
          className="form-input" 
          style={{ marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }}
          maxLength={6}
          disabled={isExpired}
        />

        <button 
          onClick={handleVerify} 
          disabled={isPending || !token || isExpired} 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {isPending ? "Verifying..." : "Verify Token"}
        </button>

        <button
          onClick={handleResend}
          disabled={isPending || resendCooldown > 0}
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} />
          {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Code'}
        </button>
      </div>
    </div>
  );
}
