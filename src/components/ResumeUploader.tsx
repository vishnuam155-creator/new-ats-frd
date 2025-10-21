import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';
import { getDataMessage, getErrorMessage, SAFE_ERROR_MESSAGE } from '@/lib/safeErrors';

interface UsageInfo {
  uploads_used: number;
  limit: number;
  plan: string;
}

interface ResumeUploaderProps {
  authToken: string | null;
  usageInfo: UsageInfo | null;
  onUsageUpdate: (usage: UsageInfo) => void;
  onLoginRequired: () => void;
  onUpgradeRequired: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  authToken,
  usageInfo,
  onUsageUpdate,
  onLoginRequired,
  onUpgradeRequired
}) => {
  const [mode, setMode] = useState<'with_jd' | 'without_jd'>('with_jd');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoginWarningOpen, setIsLoginWarningOpen] = useState(false);
  const { user, login, logout } = useAuth();
  
  

  const handleLoginRequired = () => {
    setIsLoginWarningOpen(true);
  };

  const API_BASE = 'http://127.0.0.1:8000';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file only.",
          variant: "destructive"
        });
        return;
      }
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for analysis.`,
        variant: "default"
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const checkUsageLimit = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/resume_checker/`, {
        method: 'GET',
        headers: authToken ? { Authorization: `Token ${authToken}` } : {},
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.error) {
        const message = getDataMessage(data, SAFE_ERROR_MESSAGE);
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
        return false;
      }

      onUsageUpdate(data);

      if (!authToken && data.uploads_used >= data.limit) {
        onLoginRequired();
        return false;
      }

      if (authToken && data.uploads_used >= data.limit) {
        onUpgradeRequired();
        return false;
      }

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
      return false;
    }
  };

  const handleSubmit = async (action: 'review' | 'percentage') => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a resume before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'with_jd' && !jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please paste the job description before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'without_jd' && !companyName.trim()) {
      toast({
        title: "Missing Company Name",
        description: "Please enter the post/job details before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Check usage limits first
    const canProceed = await checkUsageLimit();
    if (!canProceed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      formData.append('action', action);
      
      if (mode === 'with_jd') {
        formData.append('job_desc', jobDescription);
      } else {
        formData.append('company_name', companyName);
      }

      const response = await fetch(`${API_BASE}/resume_checker/`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Token ${authToken}` } : {},
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Update usage info
        onUsageUpdate({
          uploads_used: data.uploads_used,
          limit: data.limit,
          plan: data.plan
        });

        // Format the response
        let formatted = data.response
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/^\* (.*$)/gim, "<li>$1</li>");
        
        if (formatted.includes("<li>")) {
          formatted = "<ul>" + formatted + "</ul>";
        }
        formatted = formatted.replace(/\n/g, "<br>");
        
        setResult(formatted);
        
        toast({
          title: "Analysis Complete",
          description: "Your resume has been analyzed successfully.",
          variant: "default"
        });
      } else {
        const message = getDataMessage(data, SAFE_ERROR_MESSAGE);
        toast({
          title: "Analysis Failed",
          description: message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Usage Info */}
      {usageInfo && (
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Upload Usage: <span className="font-semibold text-foreground">
                    {usageInfo.uploads_used}/{usageInfo.limit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plan: <span className="px-2 py-1 bg-secondary rounded-full text-xs uppercase font-semibold">
                    {usageInfo.plan}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {usageInfo.uploads_used < usageInfo.limit ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your PDF resume for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? 'border-primary bg-primary/5 shadow-glow' 
                : 'border-border hover:border-primary/60 hover:shadow-soft'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {uploadedFile ? (
                  <FileText className="h-6 w-6 text-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isDragActive ? 'Drop your resume here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description Mode */}
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <CardHeader>
          <CardTitle>Analysis Mode</CardTitle>
          <CardDescription>
            Choose how you want to analyze your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'with_jd' | 'without_jd')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="with_jd">With Job Description</TabsTrigger>
              <TabsTrigger value="without_jd">General Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="with_jd" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Description
                </label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for targeted analysis..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="without_jd" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Position/Company Name
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter position or company name..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
          variant="hero" 
          size="lg" 
          className="flex items-center justify-center gap-2"
          onClick={() => handleSubmit('percentage')}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Get ATS Score'
          )}
        </Button>
        <Button 
          variant="corporate" 
          size="lg" 
          className="flex-1"
          onClick={() => {
              if (!user) {
                handleLoginRequired(); // show login modal
                return;
              }
              handleSubmit("review"); // run ATS scoring
            }}
          disabled={isLoading}
        >
          Detailed Review
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="bg-gradient-card border-0 shadow-elegant animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              AI Analysis Results
            </CardTitle>
                        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-green-500 font-medium">
                💡 Pro Tip: If your resume score is below 70%, consider creating a new resume tailored to the job requirements.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: result }}
            />
            

          </CardContent>
        </Card>
      )}
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