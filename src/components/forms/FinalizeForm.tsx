import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResumeData } from '@/types/resume';
import { ProfessionalResumeTemplate } from '@/templates/ProfessionalResumeTemplate';
import { ProfessionalResumeTemplateWithPhoto } from '@/templates/ProfessionalResumeTemplateWithPhoto';
import { ModernResumeTemplate } from '@/templates/ModernResumeTemplate';
import { ModernResumeTemplateWithPhoto } from '@/templates/ModernResumeTemplateWithPhoto';
import { CreativeResumeTemplate } from '@/templates/CreativeResumeTemplate';
import { CreativeResumeTemplateWithPhoto } from '@/templates/CreativeResumeTemplateWithPhoto';
import {
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  User,
  UserCircle,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { getErrorMessage } from '@/lib/safeErrors';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UsageInfo {
  uploads_used: number;
  limit: number;
  plan?: string | null;
}

interface FinalizeFormProps {
  data: ResumeData;
  score: number;
  usageInfo?: UsageInfo | null;
  onUpgradeRequired?: () => void;
}

type TemplateType = 'professional' | 'modern' | 'creative';

type FormatType = 'with-photo' | 'without-photo';

// === NEW: Thumbnail sets per format (place images in /public/templates/...) === //
const TEMPLATE_OPTIONS: Record<FormatType, { id: TemplateType; label: string; icon: any; img: string }[]> = {
  'without-photo': [
    { id: 'professional', label: 'Professional', icon: Briefcase, img: 'src/templates/without/professional.png' },
    { id: 'modern', label: 'Modern', icon: FileText, img: 'src/templates/without/modern.png' },
    { id: 'creative', label: 'Creative', icon: Sparkles, img: 'src/templates/without/creative.png' },
  ],
  'with-photo': [
    { id: 'professional', label: 'Professional (Photo)', icon: Briefcase, img: 'src/templates/with/professional_photo.png' },
    { id: 'modern', label: 'Modern (Photo)', icon: FileText, img: 'src/templates/with/modern_photo.png' },
    { id: 'creative', label: 'Creative (Photo)', icon: Sparkles, img: 'src/templates/with/creative_photo.png' },
  ],
};

export const FinalizeForm = ({ data, score, usageInfo, onUpgradeRequired }: FinalizeFormProps) => {
  const { toast } = useToast();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [resumeFormat, setResumeFormat] = useState<FormatType>('without-photo');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('professional');
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photo || null);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedPlan = useMemo(() => {
    const plan = usageInfo?.plan?.toLowerCase() ?? '';
    if (plan.includes('pro')) return 'pro';
    if (plan.includes('premium')) return 'premium';
    if (plan.includes('basic')) return 'basic';
    if (plan.includes('guest') || plan.includes('free')) return 'basic';
    return plan || 'basic';
  }, [usageInfo?.plan]);

  const ensureDownloadAccess = () => {
    const triggerUpgrade = () => {
      onUpgradeRequired?.();
    };

    if (normalizedPlan === 'pro') return true;

    if (normalizedPlan === 'premium') {
      const uploadsUsed = usageInfo?.uploads_used ?? 0;
      const limit = usageInfo?.limit;
      if (typeof limit === 'number' && limit > 0 && uploadsUsed >= limit) {
        toast({
          title: 'Limit Reached',
          description: "You've used all available downloads for your Premium plan. Upgrade to unlock more downloads.",
          variant: 'destructive',
        });
        triggerUpgrade();
        return false;
      }
      return true;
    }

    toast({
      title: 'Upgrade Required',
      description: 'Resume downloads are available on Premium and Pro plans.',
      variant: 'destructive',
    });
    triggerUpgrade();
    return false;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please upload an image file (JPG, PNG, etc.)', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Please upload an image smaller than 5MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      toast({ title: 'Photo Uploaded', description: 'Your photo has been added to the resume' });
    };
    reader.readAsDataURL(file);
  };

  const getTemplateComponent = () => {
    const templates = {
      professional: { withPhoto: ProfessionalResumeTemplateWithPhoto, withoutPhoto: ProfessionalResumeTemplate },
      modern: { withPhoto: ModernResumeTemplateWithPhoto, withoutPhoto: ModernResumeTemplate },
      creative: { withPhoto: CreativeResumeTemplateWithPhoto, withoutPhoto: CreativeResumeTemplate },
    } as const;

    const Template = resumeFormat === 'with-photo' ? templates[selectedTemplate].withPhoto : templates[selectedTemplate].withoutPhoto;
    return Template;
  };

  // ================= PDF =================
  const handleDownloadPDF = async () => {
    if (!ensureDownloadAccess()) return;
    try {
      if (resumeFormat === 'with-photo' && !photoPreview) {
        toast({ title: 'Photo Required', description: "Please upload a photo for the 'with photo' format.", variant: 'destructive' });
        return;
      }

      const payload = {
        template: selectedTemplate,
        format: resumeFormat,
        data: { ...data, photo: resumeFormat === 'with-photo' ? photoPreview || '' : '' },
      };

      const res = await fetch(`${API_BASE}/api/resume/generate-pdf/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null);
        throw new Error(maybeJson ? JSON.stringify(maybeJson) : `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url;
      a.download = `${data.contacts.firstName}_${data.contacts.lastName}_${selectedTemplate}_${ts}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'PDF Downloaded', description: 'Pdf download completed...' });
    } catch (e: any) {
      console.error('Server PDF error:', e);
      const cleanMessage = (e.message || 'Unknown error').replace(/[\[\]{}"']/g, '').replace(/\s+/g, ' ').trim();
      toast({ title: 'PDF Failed', description: getErrorMessage(e), variant: 'destructive' });
    }
  };

  // ================= DOCX =================
  const handleDownloadDOCX = async () => {
    if (!ensureDownloadAccess()) return;
    if (resumeFormat === 'with-photo' && !photoPreview) {
      toast({ title: 'Photo Required', description: 'Please upload a photo for the resume with photo format', variant: 'destructive' });
      return;
    }

    try {
      const sections: Paragraph[] = [];

      sections.push(
        new Paragraph({ text: `${data.contacts.firstName} ${data.contacts.lastName}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${data.contacts.email} | ${data.contacts.phone}`)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${data.contacts.location}`)] })
      );

      if (data.contacts.website || data.contacts.linkedin || data.contacts.github) {
        const links: string[] = [];
        if (data.contacts.website) links.push(data.contacts.website);
        if (data.contacts.linkedin) links.push(data.contacts.linkedin);
        if (data.contacts.github) links.push(data.contacts.github);
        sections.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(links.join(' | '))] }));
      }

      sections.push(new Paragraph({ text: '' }));

      if (data.summary) {
        sections.push(
          new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: data.summary }),
          new Paragraph({ text: '' })
        );
      }

      if (data.experience.length > 0) {
        sections.push(new Paragraph({ text: 'Work Experience', heading: HeadingLevel.HEADING_2 }));
        data.experience.forEach((exp) => {
          sections.push(
            new Paragraph({ children: [new TextRun({ text: exp.jobTitle, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `${exp.company} - ${exp.location}`, italics: true })] }),
            new Paragraph({ text: `${exp.startDate} - ${exp.isCurrentJob ? 'Present' : exp.endDate}` }),
            new Paragraph({ text: exp.description }),
            new Paragraph({ text: '' })
          );
        });
      }

      if (data.education.length > 0) {
        sections.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }));
        data.education.forEach((edu) => {
          sections.push(
            new Paragraph({ children: [new TextRun({ text: `${edu.degree} in ${edu.fieldOfStudy}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: edu.institution, italics: true })] }),
            new Paragraph({ text: `${edu.startDate} - ${edu.isCurrentlyStudying ? 'Present' : edu.endDate}` })
          );
          if (edu.description) sections.push(new Paragraph({ text: edu.description }));
          sections.push(new Paragraph({ text: '' }));
        });
      }

      if (data.projects.length > 0) {
        sections.push(new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }));
        data.projects.forEach((project) => {
          sections.push(
            new Paragraph({ children: [new TextRun({ text: project.name, bold: true })] }),
            new Paragraph({ text: project.description })
          );
          if (project.technologies.length > 0) sections.push(new Paragraph({ text: `Technologies: ${project.technologies.join(', ')}` }));
          if (project.url || project.githubUrl) {
            const links: string[] = [];
            if (project.url) links.push(`URL: ${project.url}`);
            if (project.githubUrl) links.push(`GitHub: ${project.githubUrl}`);
            sections.push(new Paragraph({ text: links.join(' | ') }));
          }
          sections.push(new Paragraph({ text: '' }));
        });
      }

      if (data.certificates.length > 0) {
        sections.push(new Paragraph({ text: 'Certificates', heading: HeadingLevel.HEADING_2 }));
        data.certificates.forEach((cert) => {
          sections.push(
            new Paragraph({ children: [new TextRun({ text: cert.name, bold: true })] }),
            new Paragraph({ text: `${cert.issuer} - ${cert.issueDate}` })
          );
          if (cert.url) sections.push(new Paragraph({ text: `URL: ${cert.url}` }));
          sections.push(new Paragraph({ text: '' }));
        });
      }

      if (data.skills.length > 0) {
        sections.push(
          new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: data.skills.map((s) => s.name).join(', ') }),
          new Paragraph({ text: '' })
        );
      }

      const doc = new Document({ sections: [{ properties: {}, children: sections }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${data.contacts.firstName}_${data.contacts.lastName}_Resume_${selectedTemplate}_${resumeFormat}.docx`);
      toast({ title: 'DOCX Downloaded!', description: `Your ${selectedTemplate} resume has been saved ${resumeFormat === 'with-photo' ? 'with photo' : 'without photo'}.` });
    } catch (error) {
      console.error('DOCX generation error:', error);
      toast({ title: 'Download Failed', description: 'There was an error generating the DOCX. Please try again.', variant: 'destructive' });
    }
  };

  const getCompletionStatus = () => {
    const sections = [
      { name: 'Contact Information', completed: !!(data.contacts.firstName && data.contacts.lastName && data.contacts.email) },
      { name: 'Professional Summary', completed: data.summary.length > 50 },
      { name: 'Work Experience', completed: data.experience.length > 0 },
      { name: 'Education', completed: data.education.length > 0 },
      { name: 'Skills', completed: data.skills.length >= 3 },
    ];
    return sections;
  };

  const sections = getCompletionStatus();
  const completedSections = sections.filter((s) => s.completed).length;

  const TemplateComponent = getTemplateComponent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Finalize Your Resume</h2>
        <p className="text-muted-foreground">Review your resume, check completeness, and download your professional resume.</p>
      </div>

      {/* Completion Status */}
      <Card className="p-6 border border-border shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Resume Completion Status</h3>
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center space-x-3">
              {section.completed ? <CheckCircle className="w-5 h-5 text-stepper-complete" /> : <AlertCircle className="w-5 h-5 text-warning" />}
              <span className={section.completed ? 'text-foreground' : 'text-muted-foreground'}>{section.name}</span>
              {section.completed && <span className="text-xs bg-stepper-complete/10 text-stepper-complete px-2 py-1 rounded-full">Complete</span>}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sections completed:</span>
            <span className="font-medium text-foreground">{completedSections}/{sections.length}</span>
          </div>
        </div>
      </Card>

      {/* Resume Statistics */}
      <Card className="p-6 border border-border shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Resume Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data.experience.length}</div>
            <div className="text-sm text-muted-foreground">Experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data.education.length}</div>
            <div className="text-sm text-muted-foreground">Education</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data.skills.length}</div>
            <div className="text-sm text-muted-foreground">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data.certificates.length}</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </div>
        </div>
      </Card>

      {/* Resume Format Selection */}
      <Card className="p-6 border border-border shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Choose Resume Format & Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => {
              setResumeFormat('without-photo');
              setShowTemplateModal(true);
            }}
            variant="outline"
            className="h-auto p-6 flex flex-col items-center space-y-3 hover:border-primary hover:bg-primary/5"
          >
            <FileText className="w-10 h-10 text-primary" />
            <div>
              <div className="font-medium text-foreground">Resume Without Photo</div>
              <div className="text-xs text-muted-foreground text-center mt-1">Classic professional format</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setResumeFormat('with-photo');
              setShowTemplateModal(true);
            }}
            variant="outline"
            className="h-auto p-6 flex flex-col items-center space-y-3 hover:border-primary hover:bg-primary/5"
          >
            <UserCircle className="w-10 h-10 text-primary" />
            <div>
              <div className="font-medium text-foreground">Resume With Photo</div>
              <div className="text-xs text-muted-foreground text-center mt-1">Modern format with profile picture</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        {/* === NEW: mobile-friendly sizing + scrolling === */}
        <DialogContent className="md:max-w-6xl w-[96vw] sm:w-[90vw] h-[85vh] md:h-auto overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              <div className="flex flex-col gap-2">
                <span>Choose Your Template ({resumeFormat === 'with-photo' ? 'With Photo' : 'Without Photo'})</span>
                <p className="text-muted-foreground">Templates are ordinary — perfection is our promise, value is our result</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Photo Upload Section for "with-photo" format */}
          {resumeFormat === 'with-photo' && (
            <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-start space-x-4">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-lg object-cover border-2 border-primary" />
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-background">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">Upload Your Photo</h4>
                  <p className="text-sm text-muted-foreground mb-3">Choose a professional photo (JPG, PNG, max 5MB)</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* === NEW: responsive grid & distinct thumbnails per format === */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {TEMPLATE_OPTIONS[resumeFormat].map((tpl) => {
              const Icon = tpl.icon;
              const isActive = selectedTemplate === tpl.id;
              return (
                <button
                  key={`${resumeFormat}-${tpl.id}`}
                  onClick={() => {
                    setSelectedTemplate(tpl.id as TemplateType);
                    setShowTemplateModal(false);
                  }}
                  className={`group relative border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    isActive ? 'border-primary' : 'border-border'
                  }`}
                >
                  <div className="aspect-[8.5/11] bg-white overflow-hidden">
                    <img src={tpl.img} alt={`${tpl.label} Preview`} className="object-cover w-full h-full" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{tpl.label}</span>
                      </div>
                      {isActive && <CheckCircle className="w-5 h-5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Format Selection */}
      <Card className="p-6 border border-border shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Choose Download Format</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button onClick={() => setDownloadFormat('pdf')} variant={downloadFormat === 'pdf' ? 'default' : 'outline'} className="h-auto p-4 flex flex-col items-center space-y-2">
            <FileText className="w-8 h-8" />
            <div className="font-medium">PDF Format</div>
          </Button>
          <Button onClick={() => setDownloadFormat('docx')} variant={downloadFormat === 'docx' ? 'default' : 'outline'} className="h-auto p-4 flex flex-col items-center space-y-2">
            <FileText className="w-8 h-8" />
            <div className="font-medium">DOCX Format</div>
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={downloadFormat === 'pdf' ? handleDownloadPDF : handleDownloadDOCX} className="h-12 text-left flex items-center space-x-3" disabled={score < 40 || (resumeFormat === 'with-photo' && !photoPreview)}>
          <Download className="w-5 h-5" />
          <div>
            <div className="font-medium">Download {downloadFormat.toUpperCase()}</div>
            <div className="text-xs opacity-80">{selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} - {resumeFormat === 'with-photo' ? 'With Photo' : 'Without Photo'}</div>
          </div>
        </Button>
      </div>

      {/* Hidden Resume Templates for PDF Generation (kept) */}
      <div className="hidden">
        <div id="resume-preview-pdf-professional-without-photo">
          <ProfessionalResumeTemplate data={data} />
        </div>
        <div id="resume-preview-pdf-professional-with-photo">
          <ProfessionalResumeTemplateWithPhoto data={{ ...data, photo: photoPreview || undefined }} />
        </div>
        <div id="resume-preview-pdf-modern-without-photo">
          <ModernResumeTemplate data={data} />
        </div>
        <div id="resume-preview-pdf-modern-with-photo">
          <ModernResumeTemplateWithPhoto data={{ ...data, photo: photoPreview || undefined }} />
        </div>
        <div id="resume-preview-pdf-creative-without-photo">
          <CreativeResumeTemplate data={data} />
        </div>
        <div id="resume-preview-pdf-creative-with-photo">
          <CreativeResumeTemplateWithPhoto data={{ ...data, photo: photoPreview || undefined }} />
        </div>
      </div>

      {score < 40 && (
        <Card className="p-4 border border-warning/30 bg-warning/5">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-medium text-warning mb-1">Resume Needs Improvement</h4>
              <p className="text-sm text-warning/80">Your resume score is below 40%. Please go back and complete more sections to improve your resume before downloading.</p>
            </div>
          </div>
        </Card>
      )}

      {score >= 70 && (
        <Card className="p-4 border border-stepper-complete/30 bg-stepper-complete/5">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-stepper-complete mt-0.5" />
            <div>
              <h4 className="font-medium text-stepper-complete mb-1">Excellent Resume!</h4>
              <p className="text-sm text-stepper-complete/80">Your resume looks great and is ready to impress employers. You can download it with confidence!</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinalizeForm;