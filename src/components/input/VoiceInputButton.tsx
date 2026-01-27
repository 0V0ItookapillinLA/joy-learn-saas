import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function VoiceInputButton({ 
  isListening, 
  isSupported, 
  onStart, 
  onStop,
  className 
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              className={cn("text-muted-foreground", className)}
            >
              <MicOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>您的浏览器不支持语音输入</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isListening ? "default" : "ghost"}
            size="icon"
            onClick={isListening ? onStop : onStart}
            className={cn(
              isListening && "bg-destructive hover:bg-destructive/90 animate-pulse",
              className
            )}
          >
            {isListening ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? '点击停止录音' : '语音输入'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
