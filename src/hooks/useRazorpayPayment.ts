// src/hooks/useRazorpayPayment.ts
import { API_BASE, authHeaders } from '@/lib/api';
import { loadRazorpay } from '@/lib/razorpay';

type InitOrderResponse = {
  key_id: string;
  order: { id: string; amount: number; currency: string };
  payment_id: number;
  plan_type: 'premium'|'pro';
};

export async function startRazorpayCheckout(plan_type: 'premium'|'pro'): Promise<void> {
  const ok = await loadRazorpay();
  if (!ok) throw new Error('Razorpay SDK failed to load');

  const res = await fetch(`${API_BASE}/api/payments/razorpay/create-order/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ plan_type }),
  });
  const init: InitOrderResponse = await res.json();
  if (!res.ok) throw new Error(init as any);

  const { key_id, order, payment_id } = init;

  return new Promise((resolve, reject) => {
    const rz = new (window as any).Razorpay({
      key: key_id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'QuotientOne',
      description: `${plan_type.toUpperCase()} plan`,
      prefill: {
        email: localStorage.getItem('userEmail') || undefined,
      },
      theme: { color: '#16a34a' },
      modal: { ondismiss: () => reject(new Error('Payment modal closed')) },
      handler: async (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payments/razorpay/verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ ...resp, payment_id }),
          });
          const data = await verifyRes.json();
          if (!verifyRes.ok || !data?.ok) throw new Error(data?.error || 'Verification failed');
          resolve(data);
        } catch (e) { reject(e); }
      },
    });

    rz.open();
  });
}
