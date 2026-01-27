import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

// Define SpeechRecognition types for TypeScript
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const { onResult, onError, language = 'zh-CN', continuous = false } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  // Check if browser supports SpeechRecognition
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (finalTranscript && onResult) {
        onResult(finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      const errorMessage = getErrorMessage(event.error);
      if (onError) {
        onError(errorMessage);
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.abort();
    };
  }, [isSupported, language, continuous, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('您的浏览器不支持语音识别功能');
      return;
    }
    
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch (error) {
      // Already started
      console.log('Recognition already started');
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return '未检测到语音，请重试';
    case 'audio-capture':
      return '未找到麦克风设备';
    case 'not-allowed':
      return '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风';
    case 'network':
      return '网络错误，请检查网络连接';
    case 'aborted':
      return '语音识别已取消';
    case 'service-not-allowed':
      return '语音服务不可用';
    default:
      return `语音识别错误: ${error}`;
  }
}
