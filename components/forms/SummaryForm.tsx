import React, { useState } from 'react';
import { useResumeData } from '@/hooks/useResumeData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Sparkles, Lightbulb } from 'lucide-react';
import { generateFromJD } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { JDPreparationModal } from '@/components/JDPreparationModal';
import { getErrorMessage } from '@/lib/safeErrors';

interface SummaryFormProps {
  data: string;
  onChange: (summary: string) => void;
}

const saveATS = (next: any) => {
  try { localStorage.setItem('atsState', JSON.stringify(next)); } catch {}
  return next;
};

export const SummaryForm = ({ data, onChange }: SummaryFormProps) => {
  const { ats, setAts } = useResumeData();
  const [showJDModal, setShowJDModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const applyAIResult = (res: { summary: string; skills: string[]; experiences: string[] }) => {
    setAts(prev => saveATS({
      ...prev,
      jdText: prev.jdText || '',
      suggestedSummary: res.summary,
      relevantSkills: res.skills,
      suggestedExperiences: res.experiences,
    }));
    onChange(res.summary);
  };

  const startGenerateWithJD = async (jdText: string) => {
    try {
      setIsGenerating(true);
      const res = await generateFromJD(jdText);
      applyAIResult(res);
      toast({ title: 'Summary generated', description: 'Tailored to your JD.' });
    } catch (e: any) {
      toast({ title: 'Generation failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = async () => {
    if (ats.suggestedSummary) { onChange(ats.suggestedSummary); return; }
    if (ats.jdText?.trim()) { await startGenerateWithJD(ats.jdText); return; }
    setShowJDModal(true);
  };

  // 🔑 KEY: Trust JD modal payload. If it already includes skills/summary, use them.
  const handleJDPrepared = (payload: { jdText: string; summary?: string; skills?: string[]; experiences?: string[] }) => {
    const jdText = payload.jdText || '';
    setAts(prev => ({
      ...prev,
      jdText,
      suggestedSummary: payload.summary ?? prev.suggestedSummary,
      relevantSkills: payload.skills ?? prev.relevantSkills,
      suggestedExperiences: payload.experiences ?? prev.suggestedExperiences,
    }));

    if (payload.summary && payload.skills?.length) {
      // Modal has everything, apply immediately (no extra call)
      onChange(payload.summary);
    } else if (jdText.trim()) {
      // Modal returned only JD; fetch once now to populate both summary + skills
      startGenerateWithJD(jdText);
    } else {
      const sample =
        'Experienced professional with a proven track record of delivering high-quality results.';
      onChange(sample);
      toast({ title: 'No JD provided', description: 'You can add a JD later for tailored suggestions.' });
    }
  };

  const summaryTips = [
    'Keep it concise (3–4 sentences or ~50–100 words)',
    'Start with your years of experience or current role',
    'Highlight key skills and achievements',
    'Use keywords from your target job descriptions',
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Professional Summary</h2>
          <p className="text-muted-foreground">Write a compelling summary that highlights your key qualifications.</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-primary mb-2">Summary Writing Tips</h3>
              <ul className="text-sm text-primary/80 space-y-1">
                {summaryTips.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-1 h-1 bg-primary/60 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary">Professional Summary</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              disabled={isGenerating}
              className="text-primary hover:text-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating…' : 'Generate with AI'}
            </Button>
          </div>

          <RichTextEditor
            value={data}
            onChange={onChange}
            placeholder="Write your summary or click Generate with AI…"
            className="min-h-[200px]"
          />
        </div>
      </div>

      <JDPreparationModal
        isOpen={showJDModal}
        onClose={() => setShowJDModal(false)}
        onPrepared={(payload) => {
          setShowJDModal(false);
          handleJDPrepared(payload);
        }}
      />
    </>
  );
};
