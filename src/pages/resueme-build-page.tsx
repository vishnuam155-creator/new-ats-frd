import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useResumeData } from '@/hooks/useResumeData';
import { ResumeStepper } from '@/components/ResumeStepper';
import { ResumeScore } from '@/components/ResumeScore';
import { ResumePreview } from '@/components/ResumePreview';
import { ContactsForm } from '@/components/forms/ContactsForm';
import { ExperienceForm } from '@/components/forms/ExperienceForm';
import { EducationForm } from '@/components/forms/EducationForm';
import { CertificatesForm } from '@/components/forms/CertificatesForm';
import { ProjectsForm } from '@/components/forms/ProjectsForm';
import { SkillsForm } from '@/components/forms/SkillsForm';
import { SummaryForm } from '@/components/forms/SummaryForm';
import { JDPreparationModal } from '@/components/JDPreparationModal';
import { FinalizeForm } from '@/components/forms/FinalizeForm';
import { ResumeStep } from '@/types/resume';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { AuthModal } from "@/components/AuthModal";
import { useAuthContext } from "@/context/AuthProvider";
import { Header } from '@/components/Header';
import { EnhancedAuthModal } from '@/components/EnhancedAuthModal';
import { UserProfileDashboard } from '@/components/UserProfileDashboard';
import { ResumeUploader } from '@/components/ResumeUploader';
import { UpgradeModal } from '@/components/UpgradeModal';
import { CreateResumeModal } from '@/components/CreateResumeModal';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { Footer } from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';

// Import your Header

interface UsageInfo {
  uploads_used: number;
  limit: number;
  plan: string;
}

const ResumeBuilderPage = () => {
  const {
    resumeData,
    currentStep,
    setCurrentStep,
    updateContacts,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addCertificate,
    updateCertificate,
    removeCertificate,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    calculateCompletionScore,
    getStepCompletionStatus
  } = useResumeData();

  // ATS state for JD modal
  const [ats, setAts] = useState({
    jdText: '',
    relevantSkills: [],
    suggestedSummary: '',
    suggestedExperiences: [],
  });

  const steps: ResumeStep[] = ['contacts', 'summary', 'experience', 'education', 'projects', 'certificates', 'skills', 'finalize'];
  const currentStepIndex = steps.indexOf(currentStep);
  const score = calculateCompletionScore();

  // Auth hooks for Header
  const { user, authToken, isLoading, login, logout } = useAuthContext();

  const [isLoginWarningOpen, setIsLoginWarningOpen] = useState(false);
  const { verifyPayment } = usePayment();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isProfileDashboardOpen, setIsProfileDashboardOpen] = useState(false);
  const [isCreateResumeModalOpen, setIsCreateResumeModalOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isJDModalOpen, setIsJDModalOpen] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [successPlan, setSuccessPlan] = useState('');
  const handleJDPrepared = (payload: { jdText: string; summary?: string; skills?: string[]; experiences?: string[] }) => {
    setAts(prev => ({
      ...prev,
      jdText: payload.jdText || '',
      relevantSkills: payload.skills || prev.relevantSkills,
      suggestedSummary: payload.summary || prev.suggestedSummary,
      suggestedExperiences: payload.experiences || prev.suggestedExperiences,
    }));
  };

  

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

  useEffect(() => {
    if (!authToken) {
      setUsageInfo(null);
      return;
    }

    let isCancelled = false;

    const fetchUsageInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/resume_checker/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${authToken}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch usage info: ${response.status}`);
        }

        const data = await response.json();

        if (!isCancelled) {
          setUsageInfo({
            uploads_used: data?.uploads_used ?? 0,
            limit: data?.limit ?? 0,
            plan: data?.plan ?? user?.plan ?? 'basic',
          });
        }
      } catch (error) {
        console.error('Failed to load usage info', error);
        if (!isCancelled) {
          setUsageInfo((prev) => prev ?? null);
        }
      }
    };

    fetchUsageInfo();

    return () => {
      isCancelled = true;
    };
  }, [API_BASE, authToken, user?.plan]);

  const handleAuthSuccess = (token: string, username: string, plan: string) => {
    login(token, username, plan);
  };

  const handleLoginRequired = () => {
    setIsLoginWarningOpen(true);
  };

  const handleUpgradeRequired = () => {
    setIsUpgradeModalOpen(true);
  };

  const handlePlanUpdate = (newPlan: string) => {
    if (user && authToken) {
      login(authToken, user.username, newPlan);
    }
  };

  const canProceedFromCurrentStep = () => {
    switch (currentStep) {
      case 'contacts': {
        const { firstName, lastName, email, phone } = resumeData.contacts;
        const missingFields = [
          !firstName.trim() && 'first name',
          !lastName.trim() && 'last name',
          !email.trim() && 'email address',
          !phone.trim() && 'phone number'
        ].filter(Boolean) as string[];

        if (missingFields.length) {
          toast({
            title: 'Complete your personal information',
            description: `Please provide your ${missingFields.join(', ')} before continuing.`,
            variant: 'destructive'
          });
          return false;
        }
        return true;
      }
      case 'experience':
        return true;
      case 'education':
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (!canProceedFromCurrentStep()) {
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 'contacts':
        return <ContactsForm data={resumeData.contacts} onChange={updateContacts} />;
      case 'experience':
        return (
          <ExperienceForm
            data={resumeData.experience}
            onChange={() => {}}
            onAddExperience={addExperience}
            onUpdateExperience={updateExperience}
            onRemoveExperience={removeExperience}
          />
        );
      case 'education':
        return (
          <EducationForm
            data={resumeData.education}
            onAddEducation={addEducation}
            onUpdateEducation={updateEducation}
            onRemoveEducation={removeEducation}
          />
        );
      case 'certificates':
        return (
          <CertificatesForm
            data={resumeData.certificates}
            onAddCertificate={addCertificate}
            onUpdateCertificate={updateCertificate}
            onRemoveCertificate={removeCertificate}
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            data={resumeData.projects}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onRemoveProject={removeProject}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            data={resumeData.skills}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onRemoveSkill={removeSkill}
          />
        );
      case 'summary':
        return <SummaryForm data={resumeData.summary} onChange={updateSummary} />;
      case 'finalize':
        return (
          <FinalizeForm
            data={resumeData}
            score={score}
            usageInfo={usageInfo}
            onUpgradeRequired={handleUpgradeRequired}
          />
        );
      default:
        return null;
    }
  };

  const getNextStepTitle = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) return null;
    
    const stepTitles: Record<ResumeStep, string> = {
      contacts: 'Contacts',
      experience: 'Experience', 
      education: 'Education',
      certificates: 'Certificates',
      projects: 'Projects',
      skills: 'Skills',
      summary: 'Summary',
      finalize: 'Finalize'
    };
    
    return stepTitles[steps[nextIndex]];
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header 
        user={user} 
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onProfile={() => setIsProfileDashboardOpen(true)}
      />

      {/* Stepper */}
      <ResumeStepper 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        getStepCompletionStatus={getStepCompletionStatus}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Panel - Form */}
          <div className="xl:col-span-2 order-1 xl:order-1">
            <Card className="p-4 sm:p-6 lg:p-8 shadow-medium border border-border">
              {renderStepForm()}
              
              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border space-y-4 sm:space-y-0">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>

                <Button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  className="flex items-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
                  variant='hero'
                >
                  <span>Next: {getNextStepTitle()}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel - Preview & Score */}
          <div className="space-y-4 lg:space-y-6 order-2 xl:order-2">
            <ResumeScore score={score} />
            <div className="xl:sticky xl:top-6">
              <ResumePreview data={resumeData} />
            </div>
          </div>
        </div>
      </div>
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

      <CreateResumeModal
        isOpen={isCreateResumeModalOpen}
        onClose={() => setIsCreateResumeModalOpen(false)}
      />

      {/* JD Preparation Modal */}
      {/* <JDPreparationModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        onPrepared={handleJDPrepared}
      /> */}
    </div>
  );
};

export default ResumeBuilderPage;