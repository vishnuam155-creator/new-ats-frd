import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skill } from '@/types/resume';
import { Plus, X, Lightbulb, Sparkles, Loader2, Check } from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';
import { generateFromJD } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import clsx from 'clsx';
import { getErrorMessage } from '@/lib/safeErrors';

interface SkillsFormProps {
  data: Skill[];
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void;
  onRemoveSkill: (id: string) => void;
}

const skillCategories = [
  'Technical Skills',
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Tools & Software',
  'Design',
  'Project Management',
  'Communication',
  'Leadership',
  'Languages',
  'Other'
];

const skillLevels: Array<Skill['level']> = ['Not specified', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

function guessCategory(name: string): string {
  const n = name.toLowerCase().trim();
  if (/(typescript|javascript|python|java|go|rust|c\+\+|c#|php|ruby|kotlin|swift)\b/.test(n)) return 'Programming Languages';
  if (/(react|vue|angular|next\.js|nuxt|django|flask|fastapi|spring|express|node|laravel|rails|redux|tailwind|mui|bootstrap)/.test(n))
    return 'Frameworks & Libraries';
  if (/(postgres|mysql|sqlite|mongodb|dynamodb|redis|elasticsearch|snowflake|bigquery)/.test(n)) return 'Databases';
  if (/(git|docker|kubernetes|terraform|ansible|aws|gcp|azure|jenkins|ci\/cd|jira|figma|postman)/.test(n)) return 'Tools & Software';
  if (/(photoshop|illustrator|ui|ux|wireframe|prototype|design)/.test(n)) return 'Design';
  if (/(agile|scrum|kanban|roadmap|stakeholder|risk|scope|estimation|planning|delivery)/.test(n)) return 'Project Management';
  if (/(communication|presentation|writing|speaking|negotiation)/.test(n)) return 'Communication';
  if (/(leadership|mentoring|coaching|team lead)/.test(n)) return 'Leadership';
  if (/(english|hindi|spanish|german|french|tamil|telugu|malayalam|kannada|marathi|bengali|urdu|japanese|korean|mandarin)/.test(n))
    return 'Languages';
  return 'Technical Skills';
}

function Chip({
  children,
  onRemove,
  muted = false,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  muted?: boolean;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-all',
        muted
          ? 'border-muted/40 bg-muted/20 text-muted-foreground'
          : 'border-foreground/10 bg-background/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove"
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}

export const SkillsForm = ({ data, onAddSkill, onUpdateSkill, onRemoveSkill }: SkillsFormProps) => {
  const { ats, setAts } = useResumeData();

  const [isGenerating, setIsGenerating] = useState(false);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({
    name: '',
    level: 'Not specified',
    category: 'Technical Skills'
  });

  // NEW: paste JD directly (when missing) with a nicer header + counters
  const [jdInput, setJdInput] = useState('');
  const jdChars = jdInput.trim().length;

  const handleUseJDHere = async () => {
    const jd = jdInput.trim();
    if (!jd) {
      toast({ title: 'JD required', description: 'Paste the job description first.' });
      return;
    }
    try {
      setIsGenerating(true);
      const res = await generateFromJD(jd);
      setAts(prev => ({
        ...prev,
        jdText: jd, // persist JD
        suggestedSummary: res?.summary || prev.suggestedSummary,
        relevantSkills: Array.isArray(res?.skills) ? res.skills : [],
        suggestedExperiences: Array.isArray(res?.experiences) ? res.experiences : prev.suggestedExperiences,
      }));
      toast({ title: 'JD processed', description: `Detected ${res.skills?.length || 0} skills.` });
    } catch (e: any) {
      toast({ title: 'Generation failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearJD = () => {
    setJdInput('');
    setAts(prev => ({ ...prev, jdText: '', relevantSkills: [] }));
  };

  // Names already added manually (only used for “Add all”/per-chip add)
  const existingNames = useMemo(() => new Set(data.map(s => s.name.toLowerCase())), [data]);

  // JD-sourced skills — show exactly what JD produced
  const jdSkills: string[] = Array.isArray(ats.relevantSkills) ? ats.relevantSkills : [];

  const addSkillIfNew = (raw: string) => {
    const n = String(raw || '').trim();
    if (!n) return false;
    if (existingNames.has(n.toLowerCase())) return false;
    onAddSkill({ name: n, level: 'Not specified', category: guessCategory(n) });
    return true;
  };

  const addAllJDSkills = () => {
    if (!jdSkills.length) return;
    let added = 0;
    jdSkills.forEach(name => {
      if (addSkillIfNew(name)) added++;
    });
    toast({
      title: added ? `Added ${added} skill${added > 1 ? 's' : ''}` : 'No new skills',
      description: added ? 'JD skills copied to your list.' : 'All JD skills already exist.',
    });
  };

  // Group manual skills by category
  const groupedSkills = data.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Manual add
  const handleAddSkill = () => {
    const name = newSkill.name.trim();
    if (!name) return;
    if (existingNames.has(name.toLowerCase())) {
      toast({ title: 'Already added', description: `"${name}" is already in your skills.` });
      return;
    }
    onAddSkill({ ...newSkill, category: newSkill.category || guessCategory(name) });
    setNewSkill({ name: '', level: 'Not specified', category: 'Technical Skills' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-foreground/10 bg-gradient-to-b from-muted/30 to-background p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Skills</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your technical & soft skills. Use the JD extractor to pull the most relevant ones automatically.
            </p>
          </div>
          {/* <Badge variant="secondary" className="rounded-full">
            {data.length} added
          </Badge> */}
        </div>
      </div>

      {/* JD PASTE — only when JD is missing */}
      {!ats.jdText?.trim() && (
        <Card className="overflow-hidden border-amber-200/70">
          <div className="flex items-center gap-2 border-b bg-amber-50/70 px-5 py-3">
            <Lightbulb className="h-4 w-4 text-amber-700" />
            <div className="text-sm font-medium text-amber-900">No JD yet — paste it here to auto-detect skills</div>
          </div>

          <div className="p-5 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="jd">Paste Job Description</Label>
              <Textarea
                id="jd"
                rows={8}
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                placeholder="Paste the job description here…"
                className="resize-y"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{jdChars} characters</span>
                <span>Tip: Include responsibilities + required skills for best results</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button onClick={handleUseJDHere} disabled={isGenerating || !jdInput.trim()}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Analyzing JD…' : 'Generate skills from JD'}
              </Button>
              {!!jdInput && (
                <Button type="button" variant="ghost" onClick={clearJD} className="text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* JD skills (reference) */}
      <Card className="p-5 border-emerald-200/70">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Main skills (from JD)</h3>
            <p className="text-xs text-muted-foreground">
              These are detected from your JD and shown for reference. Add the ones you want to your list.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
              {ats.jdText?.trim() ? `JD skills: ${jdSkills.length}` : 'No JD'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={addAllJDSkills}
              disabled={!jdSkills.length}
              className="whitespace-nowrap"
            >
              Add all ({jdSkills.length || 0})
            </Button>
          </div>
        </div>

        {ats.jdText?.trim() ? (
          jdSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {jdSkills.map((s) => {
                const exists = existingNames.has(String(s).toLowerCase());
                return (
                  <span
                    key={s}
                    className={clsx(
                      'group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition',
                      exists
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    )}
                    title={exists ? 'Already in your list' : 'Add to my skills'}
                  >
                    <span className="truncate">{s}</span>
                    {exists ? (
                      <Check className="h-3.5 w-3.5 opacity-70" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (addSkillIfNew(s)) {
                            toast({ title: 'Added', description: `"${s}" moved to your skills.` });
                          }
                        }}
                        className="rounded-full border border-emerald-300 px-1.5 py-0.5 text-xs font-medium hover:bg-emerald-100"
                      >
                        Add
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No JD skills to show.</div>
          )
        ) : (
          <div className="text-sm text-muted-foreground">
            Paste a JD above to enable tailored skills here.
          </div>
        )}
      </Card>

      {/* Manual Add */}
      <Card className="p-5 border-primary/30">
        <div className="mb-4">
          <h3 className="font-semibold">Add New Skill</h3>
          <p className="text-xs text-muted-foreground">Quickly add anything missing or custom to your profile.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              value={newSkill.name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., JavaScript, Stakeholder Management"
              onKeyDown={handleKeyPress}
            />
          </div>

          {/* Keep category/level for later enablement — your commented blocks */}
          {/* 
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={newSkill.category}
              onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={newSkill.level}
              onValueChange={(value: Skill['level']) => setNewSkill(prev => ({ ...prev, level: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'Not specified' ? '-' : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          */}
        </div>

        <div className="mt-4">
          <Button onClick={handleAddSkill} disabled={!newSkill.name.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </Card>

      {/* User-added skills */}
      {Object.keys(groupedSkills).length > 0 ? (
        <div className="space-y-6">
          <h3 className="font-semibold">Your Skills</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <Card key={category} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">{category}</h4>
                  <Badge variant="secondary" className="rounded-full">{skills.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Chip key={skill.id} onRemove={() => onRemoveSkill(skill.id)}>
                      <span className="mr-1">{skill.name}</span>
                      {skill.level !== 'Not specified' && (
                        <span className="text-xs text-muted-foreground">({skill.level})</span>
                      )}
                    </Chip>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 p-8">
          <div className="text-center text-muted-foreground">
            <div className="mb-1 text-lg">No skills added yet</div>
            <div className="text-sm">Add your first skill using the form above, or import from JD.</div>
          </div>
        </Card>
      )}
    </div>
  );
};
