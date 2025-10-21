import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isActive, setIsActive] = useState(false);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText || 'underlined text'}__`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText || 'strikethrough text'}~~`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'bullet':
        const bulletLines = (selectedText || 'list item').split('\n').map(line => `• ${line}`).join('\n');
        formattedText = bulletLines;
        break;
      case 'numbered':
        const numberedLines = (selectedText || 'list item').split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        formattedText = numberedLines;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: 'bold', label: 'Bold' },
    { icon: Italic, action: 'italic', label: 'Italic' },
    { icon: Underline, action: 'underline', label: 'Underline' },
    { icon: Strikethrough, action: 'strikethrough', label: 'Strikethrough' },
    { icon: Link, action: 'link', label: 'Link' },
    { icon: List, action: 'bullet', label: 'Bullet List' },
    { icon: ListOrdered, action: 'numbered', label: 'Numbered List' },
  ];

  return (
    <div className={cn("border border-input rounded-lg overflow-hidden", className)}>
      <div className="border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.action}
              variant="ghost"
              size="sm"
              onClick={() => formatText(button.action)}
              title={button.label}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <button.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 rounded-none resize-none min-h-[120px] focus:ring-0 focus:ring-offset-0"
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
      />
    </div>
  );
};