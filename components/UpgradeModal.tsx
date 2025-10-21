import React,{ useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

import { pricingTable,currencySymbols } from '@/hooks/pricing';
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
  const [userCurrency, setUserCurrency] = useState<"USD" | "INR" | "EUR">("USD");

  // Example: later you can detect dynamically via IP
  // const userCurrency = 'INR'; 
  const prices = pricingTable[userCurrency];
  const symbol = currencySymbols[userCurrency];
  // const planFeatures = planFeatures[userCurrency];

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.currency && ["USD", "INR", "EUR"].includes(data.currency)) {
          setUserCurrency(data.currency);
        }
      })
      .catch(() => {
        setUserCurrency("INR"); // fallback
      });
  }, []);

  const handleUpgrade = async (planName: string, amount: number) => {
    if (amount === 0) {
      onClose();
      return;
    }

    if (!authToken) {
      window.open('https://quotientone.in/', '_blank');
      return;
    }

    const result = await processPayment(
      {
        planName,
        amount,
        currency: userCurrency
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
          {plansConfig.map((plan) => {
            const amount = Number(prices[plan.name]);
            const displayPrice = amount === 0 ? 'Free' : `${symbol}${amount}/month`;

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
                    <CardDescription className="text-2xl font-bold text-foreground mt-2">
                      {displayPrice}
                    </CardDescription>
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
                    // handleUpgrade(plan.name, amount);
                    navigate('/upgrade');
                  }}
                  disabled={currentPlan.toLowerCase() === plan.name.toLowerCase() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
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
