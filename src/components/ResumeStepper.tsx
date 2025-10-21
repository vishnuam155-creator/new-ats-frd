import { ResumeStep, ResumeStepInfo } from '@/types/resume';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ResumeStepperProps {
  currentStep: ResumeStep;
  onStepClick: (step: ResumeStep) => void;
  getStepCompletionStatus: (step: ResumeStep) => boolean;
}

const steps: ResumeStepInfo[] = [
  { id: 'contacts', title: 'Contacts', description: 'Personal information', isCompleted: false, isActive: false },
  { id: 'summary', title: 'Summary', description: 'Professional summary', isCompleted: false, isActive: false },
  { id: 'experience', title: 'Experience', description: 'Work history', isCompleted: false, isActive: false },
  { id: 'education', title: 'Education', description: 'Academic background', isCompleted: false, isActive: false },
  { id: 'projects', title: 'Projects', description: 'Personal & side projects', isCompleted: false, isActive: false },
  { id: 'certificates', title: 'Certificates', description: 'Certifications & licenses', isCompleted: false, isActive: false },
  { id: 'skills', title: 'Skills', description: 'Technical & soft skills', isCompleted: false, isActive: false },
  { id: 'finalize', title: 'Finalize', description: 'Review & download', isCompleted: false, isActive: false },
];

export const ResumeStepper = ({ currentStep, onStepClick, getStepCompletionStatus }: ResumeStepperProps) => {
  const getStepIndex = (step: ResumeStep) => steps.findIndex(s => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="w-full bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = getStepCompletionStatus(step.id);
            const isActive = step.id === currentStep;
            const isPast = index < currentStepIndex;
            const isClickable = index <= currentStepIndex + 1 || isCompleted;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center space-x-3 transition-all duration-200 group",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold transition-all duration-200",
                        isCompleted ? "bg-stepper-complete text-white" :
                        isActive ? "bg-stepper-active text-white shadow-medium" :
                        isPast ? "bg-stepper-active text-white" :
                        "bg-muted text-stepper-inactive border-2 border-border"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-1 lg:mt-2 text-center">
                      <div
                        className={cn(
                          "text-xs lg:text-sm font-medium transition-colors duration-200",
                          isActive ? "text-stepper-active" :
                          isCompleted || isPast ? "text-stepper-complete" :
                          "text-stepper-inactive"
                        )}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 lg:mx-4 mt-[-12px] lg:mt-[-20px]">
                    <div
                      className={cn(
                        "h-full transition-colors duration-300",
                        index < currentStepIndex || isCompleted ? "bg-stepper-complete" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStepIndex]?.title}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-stepper-active h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};