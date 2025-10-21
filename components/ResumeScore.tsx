import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ResumeScoreProps {
  score: number;
  className?: string;
}

export const ResumeScore = ({ score, className }: ResumeScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-stepper-complete';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '😊';
    if (score >= 40) return '😐';
    return '😔';
  };

  const getProgressColorClass = (score: number) => {
    if (score >= 80) return '[&>[data-progress-indicator]]:bg-stepper-complete';
    if (score >= 60) return '[&>[data-progress-indicator]]:bg-warning';
    return '[&>[data-progress-indicator]]:bg-destructive';
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border p-4 shadow-soft", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={cn("text-lg font-semibold", getScoreColor(score))}>
            {score}%
          </span>
          <span className="text-sm text-muted-foreground">Your resume score</span>
          <span className="text-lg">{getScoreEmoji(score)}</span>
        </div>
      </div>
      <Progress 
        value={score} 
        className={cn("h-2", getProgressColorClass(score))}
      />
      <div className="mt-2 text-xs text-muted-foreground">
        {score < 40 && "Complete more sections to improve your score"}
        {score >= 40 && score < 60 && "Add more details to boost your score"}
        {score >= 60 && score < 80 && "Looking good! Add finishing touches"}
        {score >= 80 && "Excellent! Your resume is ready to impress"}
      </div>
    </div>
  );
};