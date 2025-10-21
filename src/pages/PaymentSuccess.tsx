// src/pages/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDataMessage, getErrorMessage } from '@/lib/safeErrors';

export default function PaymentSuccess() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const run = async () => {
      try {
        if (!sessionId) throw new Error('Missing session id');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/stripe/confirm/?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(getDataMessage(data));
        setPlan(data.plan);
        // OPTIONAL: also refresh your auth/profile store/context here
        setLoading(false);
        // Auto-redirect after 3 seconds
        setTimeout(() => nav('/dashboard'), 3000);
      } catch (e:any) {
        setError(getErrorMessage(e));
        setLoading(false);
      }
    };
    run();
  }, [nav]);

  if (loading) return <div className="p-8 text-center">Finalizing your payment…</div>;
  if (error)   return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-16 rounded-2xl shadow-lg p-8 text-center">
      <div className="text-4xl mb-2">✅</div>
      <h1 className="text-2xl font-semibold">Payment successful!</h1>
      <p className="mt-2">Your plan is now upgraded to <b>{plan}</b>.</p>
      <p className="mt-6 text-sm text-gray-500">Redirecting to your dashboard in 3 seconds…</p>
    </div>
  );
}
