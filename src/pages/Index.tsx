import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EnhancedAuthModal } from '@/components/EnhancedAuthModal';
import { UserProfileDashboard } from '@/components/UserProfileDashboard';
import { ResumeUploader } from '@/components/ResumeUploader';
import { UpgradeModal } from '@/components/UpgradeModal';
import { CreateResumeModal } from '@/components/CreateResumeModal';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { Footer } from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { Lock } from 'lucide-react';

interface UsageInfo {
  uploads_used: number;
  limit: number;
  plan: string;
}

const Index = () => {
  const { user, authToken, isLoading, login, logout } = useAuth();
  const { verifyPayment } = usePayment();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreateResumeModalOpen, setIsCreateResumeModalOpen] = useState(false);
  const [isLoginWarningOpen, setIsLoginWarningOpen] = useState(false);
  const [isProfileDashboardOpen, setIsProfileDashboardOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [successPlan, setSuccessPlan] = useState('');
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  
  const [typedText, setTypedText] = useState('');
  const fullText = "Stop getting lost in the resume black hole. Our AI-powered ATS Resume Checker and Builder helps you craft a professional resume that gets noticed by recruiters";

  // Check for payment success on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const planParam = urlParams.get('plan');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && planParam && sessionId && authToken) {
      // Verify payment and update user plan
      verifyPayment(sessionId, authToken).then((result) => {
        if (result.success && result.plan) {
          setSuccessPlan(result.plan);
          setIsPaymentSuccessOpen(true);
          
          // Clean up URL parameters
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      });
    }
  }, [authToken, verifyPayment]);

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // near top of Index component, after state declarations
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('loginWarning') === '1') {
      setIsLoginWarningOpen(true);

      // optional: clean the URL so refresh doesn’t reopen it
      params.delete('loginWarning');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);


  const handleAuthSuccess = (token: string, username: string, plan: string) => {
    login(token, username, plan);
  };

  const handleLoginRequired = () => {
    setIsLoginWarningOpen(true);
  };

  const handleUpgradeRequired = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleUsageUpdate = (usage: UsageInfo) => {
    setUsageInfo(usage);
  };

  const handlePlanUpdate = (newPlan: string) => {
    if (user && authToken) {
      // Update user object with new plan
      login(authToken, user.username, newPlan);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading QuotientOne ATS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header 
        user={user} 
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onProfile={() => setIsProfileDashboardOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            <span className="gradient-text">Your Career Starts</span>  
            <br />
            <span className="text-foreground">with the Right Resume</span>
          </h1>
          
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed min-h-[3rem]">
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => {
                if (user) {
                  setIsCreateResumeModalOpen(true);
                } else {
                  handleLoginRequired();
                }
              }}
            >
              Create Resume
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto animate-slide-up">
          <ResumeUploader
            authToken={authToken}
            usageInfo={usageInfo}
            onUsageUpdate={handleUsageUpdate}
            onLoginRequired={handleLoginRequired}
            onUpgradeRequired={handleUpgradeRequired}
          />
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <EnhancedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Profile Dashboard */}
      <UserProfileDashboard
        isOpen={isProfileDashboardOpen}
        onClose={() => setIsProfileDashboardOpen(false)}
        authToken={authToken}
        onUpgrade={() => {
          setIsProfileDashboardOpen(false);
          setIsUpgradeModalOpen(true);
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={user?.plan || 'guest'}
        authToken={authToken}
      />

      {/* Payment Success Modal */}
      <PaymentSuccess
        isOpen={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
        newPlan={successPlan}
        onPlanUpdate={handlePlanUpdate}
      />

      {/* Create Resume Modal */}
      <CreateResumeModal
        isOpen={isCreateResumeModalOpen}
        onClose={() => setIsCreateResumeModalOpen(false)}
      />

      {/* Login Warning Dialog */}
      <Dialog open={isLoginWarningOpen} onOpenChange={setIsLoginWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-warning" />
            </div>
            <DialogTitle className="text-xl">Login Required</DialogTitle>
            <DialogDescription className="text-center">
              You have reached the free upload limit.<br />
              Please login to continue with more uploads.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => {
                setIsLoginWarningOpen(false);
                setIsAuthModalOpen(true);
              }}
            >
              Login / Sign Up
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsLoginWarningOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default Index;