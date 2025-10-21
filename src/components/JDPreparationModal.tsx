import React, { useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import { extractJD, generateFromJD } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/safeErrors';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPrepared: (payload: {
    jdText: string;
    summary?: string;
    skills?: string[];
    experiences?: string[];
  }) => void;
};

const MAX_UPLOAD_MB = 5;

export const JDPreparationModal: React.FC<Props> = ({ isOpen, onClose, onPrepared }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState('');
  const [pasted, setPasted] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<{ summary: string; skills: string[]; experiences: string[] } | null>(null);

  const jdText = useMemo(() => (activeTab === 'upload' ? extracted.trim() : pasted.trim()), [activeTab, extracted, pasted]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Max ${MAX_UPLOAD_MB} MB allowed.`, variant: 'destructive' });
      return;
    }
    setFile(f);
    setExtracted('');
    setPreview(null);
  };

  const handleExtract = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please choose a PDF or image.' });
      return;
    }
    try {
      setUploading(true);
      const text = await extractJD(file);
      setExtracted(text || '');
      toast({
        title: text ? 'Text extracted' : 'No text found',
        description: text ? `Found ~${text.length} characters.` : 'Try another file or paste JD manually.',
      });
    } catch (e: any) {
      toast({ title: 'Extract failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async () => {
    if (!jdText) {
      toast({ title: 'JD required', description: 'Upload a file or paste JD text.' });
      return;
    }
    try {
      setPreviewing(true);
      const res = await generateFromJD(jdText);
      setPreview(res);
      toast({ title: 'AI preview ready', description: `Detected ${res.skills.length} skills.` });
    } catch (e: any) {
      toast({ title: 'Generation failed', description: getErrorMessage(e), variant: 'destructive' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleUse = () => {
    if (!jdText) {
      toast({ title: 'JD required', description: 'Upload a file or paste JD text.' });
      return;
    }
    onPrepared({
      jdText,
      summary: preview?.summary,
      skills: preview?.skills,
      experiences: preview?.experiences,
    });
    onClose();
  };

  const handleSkip = () => {
    onPrepared({ jdText: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-center sm:text-left">
            Make your resume suitable for the Job Description
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center sm:text-left">
            Upload the JD (PDF/image) or paste the text. You can also skip this step.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-4">
          <TabsList className="flex w-full justify-center sm:justify-start gap-2 flex-wrap">
            <TabsTrigger value="upload">Upload JD</TabsTrigger>
            <TabsTrigger value="paste">Paste JD</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent
            value="upload"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4"
          >
            <div className="border border-border rounded-lg p-3 sm:p-4 bg-white">
              <Label className="mb-2 block">Upload JD (PDF or Image)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-4 text-center text-sm text-gray-600 transition"
                >
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="truncate">
                    {file ? file.name : 'Choose a file or drag & drop here'}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={onPickFile}
                  className="hidden"
                />
              </div>

              <Button
                variant="hero"
                onClick={handleExtract}
                disabled={!file || uploading}
                className="w-full mt-4"
              >
                {uploading ? 'Extracting…' : (<><Upload className="mr-2 h-4 w-4" /> Extract Text</>)}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Drop your JD file — we’ll extract and prepare the text automatically.
              </p>
            </div>

            <div className="border border-border rounded-lg p-3 sm:p-4 bg-white">
              <Label htmlFor="jdText" className="mb-2 block">Extracted JD Text</Label>
              <Textarea
                id="jdText"
                placeholder="Extracted JD will appear here…"
                value={extracted}
                onChange={(e) => setExtracted(e.target.value)}
                className="h-48 sm:h-56"
              />
              <div className="text-xs text-muted-foreground mt-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" /> You can edit extracted text here as well.
              </div>
            </div>
          </TabsContent>

          {/* Paste Tab */}
          <TabsContent value="paste" className="mt-4">
            <Label htmlFor="pasted" className="mb-2 block">Paste Job Description</Label>
            <Textarea
              id="pasted"
              placeholder="Paste the JD here..."
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              className="h-48 sm:h-56"
            />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">Skip</Button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={handlePreview} disabled={previewing || !jdText} className="w-full sm:w-auto">
              {previewing ? 'Generating…' : 'Preview AI Result'}
            </Button>
            <Button variant="hero" onClick={handleUse} disabled={!jdText} className="w-full sm:w-auto">
              Use This JD
            </Button>
          </div>
        </div>

        {preview && (
          <div className="mt-6 space-y-3 border rounded-lg p-4 bg-gray-50">
            <div>
              <div className="font-semibold mb-1">AI Summary</div>
              <div className="text-sm text-muted-foreground">{preview.summary || '—'}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">AI Skills ({preview.skills.length})</div>
              <div className="flex flex-wrap gap-2">
                {preview.skills.map((s) => (
                  <span key={s} className="px-2 py-1 text-xs rounded-full border bg-white">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
