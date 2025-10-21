// src/pages/UpgradePlan.tsx
import React, { useEffect, useState } from 'react';
import { API_BASE, authHeaders } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentElement, Elements, useStripe, useElements,LinkAuthenticationElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getDataMessage, getErrorMessage, SAFE_ERROR_MESSAGE } from '@/lib/safeErrors';

import { startRazorpayCheckout } from '@/hooks/useRazorpayPayment';
type Plans = 'basic' | 'premium' | 'pro';

type PricingResponse = {
  country: string;
  currency: 'INR' | 'USD' | 'EUR';
  prices_minor: Record<Plans, number>;
};

const ZERO_DECIMAL = new Set<string>(['JPY', 'KRW']);
function formatFromMinor(minor: number, currency: string, locale?: string) {
  const divisor = ZERO_DECIMAL.has(currency) ? 1 : 100;
  const major = (minor ?? 0) / divisor;
  return new Intl.NumberFormat(locale || undefined, {
    style: 'currency',
    currency,
  }).format(major);
}

const planFeatures: Record<Plans, string[]> = {
  basic: [
    '2 resume uploads per month',
    'Get detailed ATS Score & keyword analysis',
    '❌ No PDF / DOCX downloads',
    '❌ No AI resume creation',
    '❌ Resume optimization tips',
    '❌ Faster processing',
    '❌ Access to all modern templates',
    '❌ Resume performance analytics & optimization tips',
    '❌ 24/7 premium support',
  ],
  premium: [
    '25 resume uploads per month',
    'Limited manual resume builds using creative templates',
    'Limited Download in PDF & DOCX formats',
    'Up to 25 AI-powered resume builds using the ATS Resume Builder',
    'Resume optimization tips',
    'Faster processing',
    'Access to all modern templates',
    'Resume performance analytics & optimization tips',
    '⭐ Note : Premium will Buy 2 Month',
  ],
  pro: [
    '100 resume uploads per month',
    'Unlimited manual resume builds with all templates',
    'Up to 100 AI-powered resume builds using the ATS Resume Builder',
    'Unlimited Download in PDF & DOCX formats',
    'Advanced resume analytics + keyword recommendations',
    '24/7 premium support',
    'Priority email support',
    'Upcoming Updates',
    '⭐ Note : Only One Month',
  ],
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function UpgradePlan() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Plans>('premium');
  const [currentPlan, setCurrentPlan] = useState<Plans>('basic');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmountMinor, setPayAmountMinor] = useState<number | null>(null);
  const [payPlanName, setPayPlanName] = useState<Plans | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile/`, { headers: { ...authHeaders() } });
        if (res.ok) {
          const json = await res.json();
          const plan = (json.plan || 'basic').toLowerCase();
          const normalized = (['basic', 'premium', 'pro'].includes(plan) ? plan : 'basic') as Plans;
          setCurrentPlan(normalized);
          setSelected(normalized);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pricing/`);
        const json: PricingResponse = await res.json();
        setPricing(json);
      } catch {
        toast({ title: 'Could not load pricing', variant: 'destructive' });
      }
    })();
  }, [toast]);

  const handleCreatePayment = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/?loginWarning=1');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ plan_type: selected, provider: 'stripe' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.client_secret) {
        const message = getDataMessage(json);
        throw new Error(message);
      }

      const amtMinor = pricing?.prices_minor?.[selected] ?? 0;
      setPayAmountMinor(amtMinor);
      setPayPlanName(selected);

      setClientSecret(json.client_secret);
      setPaymentOpen(true);
    } catch (e: any) {
      toast({ title: 'Payment init failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const currency = pricing?.currency || 'USD';

async function handlePay() {
  try {
    // Only call Razorpay for premium or pro plans; basic does not use Razorpay
    if (selected !== 'premium' && selected !== 'pro') {
      toast({
        title: 'No payment required',
        description: `The ${selected} plan does not require Razorpay checkout.`,
      });
      return;
    }

    await startRazorpayCheckout(selected); // now narrowed to 'premium' | 'pro'
    toast({ title: 'Payment successful', description: `Your ${selected} plan is now active.` });
    // optional: refresh profile or navigate
  } catch (e: any) {
    toast({ title: 'Payment failed', description: e?.message || 'Please try again', variant: 'destructive' });
  }
}

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/src/assets/payment-bg.jpg')" }} // <-- update to your image path
    >
      <div className="w-full h-full bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 drop-shadow">
            Upgrade your plan
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            Experience quick, safe, and stress-free payment methods.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {(['basic', 'premium', 'pro'] as Plans[]).map((p) => {
              const isSelected = selected === p;
              const isCurrent = currentPlan === p;
              const amountMinor = pricing?.prices_minor?.[p] ?? 0;
              const isLoggedIn = !!localStorage.getItem('authToken');

              return (
                <Card
                  key={p}
                  className={`transition-all border rounded-2xl shadow-lg backdrop-blur-sm ${
                    isSelected
                      ? 'border-green-400 ring-2 ring-green-200 bg-white/80'
                      : 'border-muted bg-white/60'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center justify-between">
                      <span>{p}</span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                          Current
                        </span>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-semibold">
                      {formatFromMinor(amountMinor, currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">{currency}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {planFeatures[p].map((f, i) => (
                        <li key={i} className="text-sm">• {f}</li>
                      ))}
                    </ul>

                    <div className="flex gap-2">
                      {!isSelected && (
                        <Button variant="outline" onClick={() => setSelected(p)} className="w-full">
                          Choose
                        </Button>
                      )}

                      {isSelected && isCurrent && (
                        <Button variant="outline" className="w-full" disabled>
                          Current plan
                        </Button>
                      )}

                      {isSelected && !isCurrent && (
                        <Button
                          variant="hero"
                          onClick={handlePay}
                          disabled={loading || selected === 'basic'}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md shadow-green-200"
                        >
                          {p === 'basic'
                            ? 'Included'
                            : isLoggedIn
                            ? loading
                              ? 'Starting…'
                              : 'Proceed to payment'
                            : 'Login to continue'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <StripePaymentDialog
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            clientSecret={clientSecret}
            amountMinor={payAmountMinor ?? 0}
            currency={currency}
            planName={(payPlanName || selected) as Plans}
          />
        </div>
      </div>
    </div>
  );
}
// === replace your StripePaymentDialog + PaymentForm with this ===

function StripePaymentDialog({
  open,
  onOpenChange,
  clientSecret,
  amountMinor,
  currency,
  planName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientSecret: string | null;
  amountMinor: number;
  currency: string;
  planName: Plans;
}) {
  if (!clientSecret) return null;

  // Stripe Elements appearance to match a clean checkout style (light, rounded, subtle borders)
  const appearance: stripe.elements.Appearance = {
    theme: 'stripe', // base theme
    variables: {
      colorPrimary: '#16a34a',           // green-600
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      colorDanger: '#ef4444',
      borderRadius: '12px',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      spacingUnit: '6px',
    },
    rules: {
      '.Input': {
        boxShadow: 'none',
        border: '1px solid #e5e7eb', // gray-200
      },
      '.Input:focus': {
        border: '1px solid #16a34a',
        boxShadow: '0 0 0 4px rgba(22,163,74,0.15)',
      },
      '.Tab, .Pill': {
        borderRadius: '10px',
      },
    },
  };

  const options = { clientSecret, appearance };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent  className="
    w-full max-w-4xl !p-0 overflow-hidden bg-white
    md:rounded-2xl md:border md:border-gray-100 md:shadow-xl
    h-[100dvh] md:h-auto md:max-h-[85vh]
  ">
        {/* header (mobile only) */}
        <div className="md:hidden px-5 pt-4 pb-3 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Secure checkout</DialogTitle>
            <p className="text-xs text-muted-foreground">
              You’re paying <b>{formatFromMinor(amountMinor, currency)}</b> for the{' '}
              <b className="capitalize">{planName}</b> plan.
            </p>
          </DialogHeader>
        </div>

        {/* two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100dvh-56px)] md:h-auto">
          {/* LEFT: Order summary */}
          <aside className="bg-gray-50/70 md:bg-gray-50 px-5 py-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <img src="/favicon.ico" alt="" className="w-5 h-5 rounded" />
              <span className="font-medium text-gray-700">QuotientOne</span>
            </div>

            <h3 className="text-xl font-semibold mb-1 capitalize">{planName} plan</h3>
            <p className="text-sm text-gray-500 mb-4">Billed monthly</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold">
                {formatFromMinor(amountMinor, currency)}
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-500">{currency}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatFromMinor(amountMinor, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">Tax
                  <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">auto</span>
                </span>
                <span>Included</span>
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total due today</span>
                <span className="text-lg font-semibold">
                  {formatFromMinor(amountMinor, currency)}
                </span>
              </div>
            </div>

            <p className="mt-6 text-[11px] leading-4 text-gray-500">
              Payments are securely processed by Stripe. By subscribing, you agree to our{' '}
              <a href="/terms" className="underline">Terms</a> and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </aside>

          {/* RIGHT: Payment form */}
          <div className="px-5 py-6 md:p-8 overflow-y-auto">
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm
                clientSecret={clientSecret}
                onUpgraded={() => onOpenChange(false)}
                amountMinor={amountMinor}
                currency={currency}
                planName={planName}
              />
            </Elements>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({
  clientSecret,
  onUpgraded,
  amountMinor,
  currency,
  planName,
}: {
  clientSecret: string;
  onUpgraded: () => void;
  amountMinor: number;
  currency: string;
  planName: Plans;
}) {
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState<string>('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
          toast({ title: 'Stripe not ready', variant: 'destructive' });
          return;
        }
        setSubmitting(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
          confirmParams: {
            // Optionally pass receipt email to Stripe if available
            receipt_email: email || undefined,
          },
        });

        if (error) {
          toast({ title: 'Payment failed', 
          description: error.message, variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        let piId = paymentIntent?.id;
        if (!piId) {
          const res = await stripe.retrievePaymentIntent(clientSecret);
          piId = res.paymentIntent?.id || undefined;
        }

        try {
          if (piId) {
            const verifyRes = await fetch(
              `${API_BASE}/api/payments/verify-intent/?pi=${encodeURIComponent(piId)}`,
              { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'include' }
            );
            const data = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && data?.ok) {
              toast({
                title: 'Payment successful',
                description: `Your plan is now upgraded to ${data.plan}. Redirecting…`,
              });
            } else {
              toast({ title: 'Payment successful', description: 'Applying your upgrade…' });
            }
          } else {
            toast({ title: 'Payment completed', description: 'Finalizing upgrade…' });
          }
          onUpgraded();
          setTimeout(() => navigate('/'), 1200);
        } catch {
          toast({ title: 'Payment successful', description: 'Redirecting…' });
          onUpgraded();
          setTimeout(() => navigate('/'), 1200);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-5"
    >
      {/* Contact email (Stripe-hosted, localized, handles validation) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Contact information</label>
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email ?? '')}
          options={{ defaultValues: { email } }}
        />
      </div>

      {/* Payment method(s) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Payment method</label>
        {/* PaymentElement renders Tabs for Card/UPI/etc based on your Stripe account & country */}
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {/* Save info like in the screenshot */}
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={saveInfo}
          onChange={(e) => setSaveInfo(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Save my info for faster checkout. Payments are processed securely by Stripe and partners.
        </span>
      </label>

      <Button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-6"
      >
        {submitting ? 'Processing…' : `Subscribe — ${formatFromMinor(amountMinor, currency)}`}
      </Button>

      <p className="text-[11px] text-center text-gray-500">
        Plan: <span className="capitalize">{planName}</span> • Total today:{' '}
        <b>{formatFromMinor(amountMinor, currency)}</b>
      </p>
    </form>
  );
}
