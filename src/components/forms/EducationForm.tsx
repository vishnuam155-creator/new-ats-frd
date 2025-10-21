import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Education } from '@/types/resume';
import { Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from '@/components/ui/use-toast';

interface EducationFormProps {
  data: Education[];
  onAddEducation: (education: Omit<Education, 'id'>) => void;
  onUpdateEducation: (id: string, updates: Partial<Education>) => void;
  onRemoveEducation: (id: string) => void;
}

export const EducationForm = ({ 
  data, 
  onAddEducation, 
  onUpdateEducation, 
  onRemoveEducation 
}: EducationFormProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrentlyStudying: false,
    gpa: '',
    description: ''
  });

  const handleAddEducation = () => {
    const trimmedEducation = {
      institution: newEducation.institution.trim(),
      degree: newEducation.degree.trim(),
      fieldOfStudy: newEducation.fieldOfStudy.trim(),
      startDate: newEducation.startDate.trim(),
      description: newEducation.description.trim()
    };

    if (!trimmedEducation.institution || !trimmedEducation.degree || !trimmedEducation.fieldOfStudy || !trimmedEducation.startDate || !trimmedEducation.description) {
      toast({
        title: 'Complete your education details',
        description: 'Institution, degree, field of study, start date, and education details are required before submitting.',
        variant: 'destructive'
      });
      return;
    }

    onAddEducation(newEducation);
    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      gpa: '',
      description: ''
    });
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Education</h2>
        <p className="text-muted-foreground">
          Add your educational background, including degrees, certifications, and relevant coursework.
        </p>
      </div>

      <div className="space-y-4">
        {data.map((education) => (
          <Card key={education.id} className="p-6 border border-border shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm text-muted-foreground">
                {education.degree} {education.fieldOfStudy && `in ${education.fieldOfStudy}`} | {education.institution} | {education.startDate} - {education.isCurrentlyStudying ? 'Present' : education.endDate}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveEducation(education.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Institution Name *</Label>
                <Input
                  value={education.institution}
                  onChange={(e) => onUpdateEducation(education.id, { institution: e.target.value })}
                  placeholder="Harvard University"
                />
              </div>

              <div className="space-y-2">
                <Label>Degree *</Label>
                <Input
                  value={education.degree}
                  onChange={(e) => onUpdateEducation(education.id, { degree: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>

              <div className="space-y-2">
                <Label>Field of Study *</Label>
                <Input
                  value={education.fieldOfStudy}
                  onChange={(e) => onUpdateEducation(education.id, { fieldOfStudy: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label>GPA (Optional)</Label>
                <Input
                  value={education.gpa}
                  onChange={(e) => onUpdateEducation(education.id, { gpa: e.target.value })}
                  placeholder="3.8/4.0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`studying-${education.id}`}
                  checked={education.isCurrentlyStudying}
                  onCheckedChange={(checked) => onUpdateEducation(education.id, { isCurrentlyStudying: !!checked })}
                />
                <Label htmlFor={`studying-${education.id}`}>I'm currently studying here</Label>
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={education.startDate}
                  onChange={(e) => onUpdateEducation(education.id, { startDate: e.target.value })}
                />
              </div>

              {!education.isCurrentlyStudying && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={education.endDate}
                    onChange={(e) => onUpdateEducation(education.id, { endDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Education Details *</Label>
              <RichTextEditor
                value={education.description || ''}
                onChange={(value) => onUpdateEducation(education.id, { description: value })}
                placeholder="Relevant coursework, achievements, honors, or activities..."
              />
            </div>
          </Card>
        ))}

        {isAddingNew && (
          <Card className="p-6 border border-primary/30 shadow-medium">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Institution Name *</Label>
                <Input
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Harvard University"
                />
              </div>

              <div className="space-y-2">
                <Label>Degree *</Label>
                <Input
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Bachelor of Science"
                />
              </div>

              <div className="space-y-2">
                <Label>Field of Study *</Label>
                <Input
                  value={newEducation.fieldOfStudy}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label>GPA (Optional)</Label>
                <Input
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                  placeholder="3.8/4.0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="studying-new"
                  checked={newEducation.isCurrentlyStudying}
                  onCheckedChange={(checked) => setNewEducation(prev => ({ ...prev, isCurrentlyStudying: !!checked }))}
                />
                <Label htmlFor="studying-new">I'm currently studying here</Label>
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              {!newEducation.isCurrentlyStudying && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={newEducation.endDate}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <Label>Education Details *</Label>
              <RichTextEditor
                value={newEducation.description || ''}
                onChange={(value) => setNewEducation(prev => ({ ...prev, description: value }))}
                placeholder="Relevant coursework, achievements, honors, or activities..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddEducation}>
               Submit Education
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
          Add education
        </Button>
      </div>
    </div>
  );
};