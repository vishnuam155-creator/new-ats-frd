import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

import {
  usePricing,
  formatFromMinor,
  minorToMajor,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
  type PlanName,
} from '@/hooks/pricing';
import { useNavigate } from 'react-router-dom';


interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  authToken?: string;
}

const plansConfig = [
  {
    name: 'Basic',
    uploads: 2,
    icon: <Check className="h-5 w-5" />,
    features: [
      '2 resume uploads per month',
      'Get detailed ATS Score & keyword analysis',
      // '❌ No PDF / DOCX downloads',
      // '❌ No AI resume creation',
    ],
    variant: 'outline' as const
  },
  {
    name: 'Premium',
    uploads: 25,
    icon: <Crown className="h-5 w-5" />,
    features: [
      '25 resume uploads per month',
      'Limited manual resume builds using creative templates',
      'Up to 25 AI-powered resume builds using the ATS Resume Builder',
      'Limited Download in PDF & DOCX formats',
      'Resume optimization tips',
      'Faster processing',
      'Access to all modern templates',
      'Resume performance analytics & optimization tips'
    ],
    variant: 'hero' as const,
    popular: true
  },
  {
    name: 'Pro',
    uploads: 100,
    icon: <Star className="h-5 w-5" />,
    features: [
      '100 resume uploads per month',
      'Unlimited manual resume builds with all templates',
      'Up to 100 AI-powered resume builds using the ATS Resume Builder',
      'Unlimited Download in PDF & DOCX formats',
      'Advanced resume analytics + keyword recommendations',
      '24/7 premium support',
      'Priority email support',
      'Upcoming Updates'
    ],
    variant: 'corporate' as const
  }
];


// const plans = [
//   {
//     name: 'Basic',
//     price: 'Free',
//     amount: 0,
//     uploads: 3,
//     icon: <Check className="h-5 w-5" />,
//     features: [
//       '3 resume uploads per month',
//       'Basic ATS analysis',
//       'Standard support'
//     ],
//     variant: 'outline' as const
//   },
//   {
//     name: 'Premium',
//     price: '$9.99/month',
//     amount: 9.99,
//     uploads: 10,
//     icon: <Crown className="h-5 w-5" />,
//     features: [
//       '10 resume uploads per month',
//       'Detailed ATS analysis',
//       'Job description matching',
//       'Priority support',
//       'Resume optimization tips'
//     ],
//     variant: 'hero' as const,
//     popular: true
//   },
//   {
//     name: 'Pro',
//     price: '$19.99/month',
//     amount: 19.99,
//     uploads: 100,
//     icon: <Star className="h-5 w-5" />,
//     features: [
//       '100 resume uploads per month',
//       'Advanced AI analysis',
//       'Custom job matching',
//       'Resume builder access',
//       'Direct recruiter insights',
//       '24/7 premium support'
//     ],
//     variant: 'corporate' as const
//   }
// ];


export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentPlan, authToken }) => {
  const { processPayment, isProcessing } = usePayment();

  // ==================== add payment options =============================

  // currency add 
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>("INR");
  const { prices, basePrices, currency, activeOffer, error: pricingError, isLoading: pricingLoading } =
    usePricing(userCurrency);
  const offerEndsText = useMemo(() => {
    if (!activeOffer?.endsAt) return null;
    const date = new Date(activeOffer.endsAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }, [activeOffer?.endsAt]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const detected = typeof data.currency === "string" ? data.currency.toUpperCase() : "";
        if ((SUPPORTED_CURRENCIES as readonly string[]).includes(detected)) {
          setUserCurrency(detected as CurrencyCode);
        }
      })
      .catch(() => {
        setUserCurrency("INR"); // fallback
      });
  }, []);

  const handleUpgrade = async (planName: string, amountMinor: number) => {
    if (amountMinor === 0) {
      onClose();
      return;
    }

    if (!authToken) {
      window.open('https://quotientone.in/', '_blank');
      return;
    }

    const amountMajor = minorToMajor(amountMinor, currency);

    const result = await processPayment(
      {
        planName,
        amount: amountMajor,
        currency,
      },
      authToken
    );

    if (result.success && result.payment_url) {
      window.location.href = result.payment_url;
    }
  };
  const navigate = useNavigate();


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl gradient-text">
            Upgrade Your Plan
          </DialogTitle>
          <p className="text-muted-foreground">
            Unlock more resume uploads and advanced features
          </p>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {pricingError && !pricingLoading && (
            <div className="md:col-span-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {pricingError}
            </div>
          )}

          {activeOffer && (
            <div className="md:col-span-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <div className="font-semibold">{activeOffer.label || 'Limited-time offer'}</div>
              {activeOffer.description && <div className="mt-1 text-xs md:text-sm">{activeOffer.description}</div>}
              {offerEndsText && <div className="mt-1 text-xs">Offer ends {offerEndsText}</div>}
            </div>
          )}

          {plansConfig.map((plan) => {
            const planKey = plan.name.toLowerCase() as PlanName;
            const amountMinor = prices[planKey] ?? 0;
            const baseMinor = basePrices[planKey] ?? amountMinor;
            const showStriked = baseMinor !== amountMinor && baseMinor > amountMinor && baseMinor > 0;
            const baseDisplay = showStriked ? `${formatFromMinor(baseMinor, currency)}/month` : null;
            const displayPrice =
              amountMinor === 0 ? 'Free' : `${formatFromMinor(amountMinor, currency)}/month`;

            return (
              <Card
                key={plan.name}
                className={`
                  relative bg-gradient-card border-0 shadow-elegant transition-all duration-300 hover:shadow-glow
                  ${plan.popular ? 'ring-2 ring-primary/20' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 flex flex-col items-center gap-1 text-2xl font-bold text-foreground">
                      {baseDisplay && (
                        <span className="text-sm text-muted-foreground line-through">{baseDisplay}</span>
                      )}
                      <span>{displayPrice}</span>
                    </CardDescription>
                    {showStriked && (
                      <div className="text-xs font-medium text-emerald-600">Limited-time price</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {plan.uploads} uploads per month
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                <Button
                  variant={plan.variant}
                  className="w-full mt-6"
                  onClick={() => {
                    if (authToken) {
                      void handleUpgrade(plan.name, amountMinor);
                    } else {
                      navigate('/upgrade');
                    }
                  }}
                  disabled={
                    currentPlan.toLowerCase() === plan.name.toLowerCase() || isProcessing || pricingLoading
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : pricingLoading ? (
                    'Updating price…'
                  ) : currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
