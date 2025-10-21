import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Crown, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  newPlan: string;
  onPlanUpdate: (plan: string) => void;
}

const planIcons = {
  'Premium': <Crown className="h-8 w-8 text-primary" />,
  'Pro': <Star className="h-8 w-8 text-primary" />,
  'Basic': <CheckCircle className="h-8 w-8 text-primary" />
};

const planFeatures = {
  'Premium': [
    '10 resume uploads per month',
    'Detailed ATS analysis',
    'Job description matching',
    'Priority support'
  ],
  'Pro': [
    '100 resume uploads per month',
    'Advanced AI analysis',
    'Custom job matching',
    'Resume builder access',
    '24/7 premium support'
  ],
  'Basic': [
    '3 resume uploads per month',
    'Basic ATS analysis',
    'Standard support'
  ]
};

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ 
  isOpen, 
  onClose, 
  newPlan, 
  onPlanUpdate 
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && newPlan) {
      // Update the user's plan in the parent component
      onPlanUpdate(newPlan);
      
      // Show success toast
      toast({
        title: "🎉 Payment Successful!",
        description: `Welcome to ${newPlan} plan! Your account has been upgraded.`,
        duration: 5000,
      });
    }
  }, [isOpen, newPlan, onPlanUpdate, toast]);

  const handleGetStarted = () => {
    onClose();
    // Could redirect to dashboard or resume builder
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <DialogTitle className="text-2xl gradient-text">
            🎉 Payment Successful!
          </DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              {planIcons[newPlan as keyof typeof planIcons]}
            </div>
            <CardTitle className="text-xl">
              Welcome to {newPlan}!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1 bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                <Zap className="h-3 w-3" />
                Plan Activated
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Your new benefits:</h4>
              <ul className="space-y-1">
                {planFeatures[newPlan as keyof typeof planFeatures]?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button
                variant="hero"
                className="w-full"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Your plan is now active and ready to use!
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};