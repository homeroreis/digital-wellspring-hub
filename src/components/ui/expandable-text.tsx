import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ExpandableTextProps {
  content: string;
  maxLength?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  content,
  maxLength = 300,
  className = "",
  showMoreText = "Ver mais",
  showLessText = "Ver menos"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const shouldTruncate = content.length > maxLength;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.slice(0, maxLength) + '...' 
    : content;

  // Function to render content with basic markdown-like formatting
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return (
        <p 
          key={index} 
          className="mb-2 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-foreground leading-relaxed">
        {renderContent(displayContent)}
      </div>
      
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-auto font-medium text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              {showLessText}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              {showMoreText}
            </>
          )}
        </Button>
      )}
    </div>
  );
};