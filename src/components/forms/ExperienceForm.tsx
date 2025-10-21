import { useResumeData } from '@/hooks/useResumeData';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Experience } from '@/types/resume';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { generateFromJD } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/safeErrors';
import { RichTextEditor } from '@/components/RichTextEditor';

interface ExperienceFormProps {
  data: Experience[];
  onChange: (experiences: Experience[]) => void;
  onAddExperience: (experience: Omit<Experience, 'id'>) => void;
  onUpdateExperience: (id: string, updates: Partial<Experience>) => void;
  onRemoveExperience: (id: string) => void;
}


  const handleGenerateExperience = async () => {
    if (ats.suggestedExperiences?.length) {
      const bullets = ats.suggestedExperiences.join('\n• ');
      if (data.length === 0) {
        onAddExperience({ jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrentJob: false, description: `• ${bullets}` });
      } else {
        onUpdateExperience(data[0].id, { description: `• ${bullets}` });
      }
      return;
    }
    if (!ats.jdText) { toast({ title: 'No JD provided', description: 'Use the JD popup or paste a JD to generate experience points.' }); return; }
    try {
      const res = await generateFromJD(ats.jdText);
      setAts(prev => ({ ...prev, suggestedSummary: res.summary, relevantSkills: res.skills, suggestedExperiences: res.experiences }));
      const bullets = res.experiences.join('\n• ');
      if (data.length === 0) {
        onAddExperience({ jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrentJob: false, description: `• ${bullets}` });
      } else {
        onUpdateExperience(data[0].id, { description: `• ${bullets}` });
      }
    } catch (e:any) {
      toast({ title: 'Generation failed', description: getErrorMessage(e), variant: 'destructive' });
    }
  };

export const ExperienceForm = ({ 
  data, 
  onAddExperience, 
  onUpdateExperience, 
  onRemoveExperience 
}: ExperienceFormProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newExperience, setNewExperience] = useState<Omit<Experience, 'id'>>({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    description: ''
  });

  const handleAddExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      onAddExperience(newExperience);
      setNewExperience({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentJob: false,
        description: ''
      });
      setIsAddingNew(false);
    }
  };

  const generateDescription = async (jobTitle: string, company: string) => {
    // Mock AI generation - in real app, this would call an AI API
    const suggestions = [
      `• Led cross-functional initiatives that improved operational efficiency by 25%`,
      `• Collaborated with team members to deliver high-quality solutions on time`,
      `• Developed and implemented strategic processes that enhanced team productivity`,
      `• Managed key stakeholder relationships and ensured project success`
    ];
    
    return suggestions.join('\n');
  };

  const handleGenerateDescription = async (id?: string, jobTitle?: string, company?: string) => {
    const title = jobTitle || (id ? data.find(exp => exp.id === id)?.jobTitle : newExperience.jobTitle);
    const comp = company || (id ? data.find(exp => exp.id === id)?.company : newExperience.company);
    
    if (!title || !comp) return;
    
    const description = await generateDescription(title, comp);
    
    if (id) {
      onUpdateExperience(id, { description });
    } else {
      setNewExperience(prev => ({ ...prev, description }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Work Experience</h2>
        <p className="text-muted-foreground mb-4">
          List your work experience starting with the most recent position first.
        </p>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning-foreground">
            <strong>Experience tips:</strong> Use action verbs, quantify achievements, and focus on results that demonstrate your impact.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((experience) => (
          <Card key={experience.id} className="p-6 border border-border shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm text-muted-foreground">
                {experience.jobTitle}, {experience.company} | {experience.startDate} - {experience.isCurrentJob ? 'Present' : experience.endDate}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveExperience(experience.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={experience.jobTitle}
                  onChange={(e) => onUpdateExperience(experience.id, { jobTitle: e.target.value })}
                  placeholder="Junior Accountant"
                />
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={experience.company}
                  onChange={(e) => onUpdateExperience(experience.id, { company: e.target.value })}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={experience.location}
                  onChange={(e) => onUpdateExperience(experience.id, { location: e.target.value })}
                  placeholder="San Francisco, CA, USA"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${experience.id}`}
                  checked={experience.isCurrentJob}
                  onCheckedChange={(checked) => onUpdateExperience(experience.id, { isCurrentJob: !!checked })}
                />
                <Label htmlFor={`current-${experience.id}`}>I currently work here</Label>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => onUpdateExperience(experience.id, { startDate: e.target.value })}
                />
              </div>

              {!experience.isCurrentJob && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={experience.endDate}
                    onChange={(e) => onUpdateExperience(experience.id, { endDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateDescription(experience.id)}
                  className="text-primary hover:text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
              <RichTextEditor
                value={experience.description}
                onChange={(value) => onUpdateExperience(experience.id, { description: value })}
                placeholder="• Helped with monthly financial reports and data entry
• Watched over team budgets and reported issues
• Entered 150+ invoices weekly using accounting software"
              />
            </div>
          </Card>
        ))}

        {isAddingNew && (
          <Card className="p-6 border border-primary/30 shadow-medium">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={newExperience.jobTitle}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Junior Accountant"
                />
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newExperience.location}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA, USA"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="current-new"
                  checked={newExperience.isCurrentJob}
                  onCheckedChange={(checked) => setNewExperience(prev => ({ ...prev, isCurrentJob: !!checked }))}
                />
                <Label htmlFor="current-new">I currently work here</Label>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              {!newExperience.isCurrentJob && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={newExperience.endDate}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateDescription()}
                  className="text-primary hover:text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
              <RichTextEditor
                value={newExperience.description}
                onChange={(value) => setNewExperience(prev => ({ ...prev, description: value }))}
                placeholder="• Helped with monthly financial reports and data entry..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddExperience}>
                Submit Experience
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Button
          variant="outline"
          onClick={() => setIsAddingNew(true)}
          className="w-full border-dashed border-2 hover:border-primary hover:text-primary"
          disabled={isAddingNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add work experience
        </Button>
      </div>
    </div>
  );
};