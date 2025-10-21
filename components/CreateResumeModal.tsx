import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, User, Briefcase, GraduationCap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleStartResume = () => {
    onClose();                      // close modal
    navigate("/buildresume");          // go to Index.tsx page
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl gradient-text">Create Professional Resume</DialogTitle>
          <DialogDescription className="text-center">
            Build your resume with our AI-powered resume builder. Choose from professional templates.
          </DialogDescription>
        </DialogHeader>
        
        {/* Feature blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <p className="text-sm text-muted-foreground">Add contact details, professional summary</p>
          </div>

          <div className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <Briefcase className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Work Experience</h3>
            </div>
            <p className="text-sm text-muted-foreground">Add your professional experience</p>
          </div>

          <div className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Education</h3>
            </div>
            <p className="text-sm text-muted-foreground">Add educational background</p>
          </div>

          <div className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Skills</h3>
            </div>
            <p className="text-sm text-muted-foreground">Highlight your key skills</p>
          </div>
        </div>
        
        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="hero" className="flex-1" onClick={handleStartResume}>
            Start Building Resume
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};