"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  BookOpen, 
  Wrench, 
  Mic, 
  MicOff, 
  Copy, 
  Trash2, 
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Paperclip,
  Activity
} from 'lucide-react';
import { aiZayaOperationalSupport } from '@/ai/flows/ai-zaya-operational-support-flow';
import { MockDB } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AiZayaPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support voice recognition.",
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      if (transcript.length > 5) handleSend(transcript);
    };
    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleSend = async (forcedInput?: string) => {
    const messageToSend = forcedInput || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    const newMessage: Message = { role: 'user', content: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await aiZayaOperationalSupport({
        studentQuery: messageToSend,
        availableMachines: MockDB.machines
          .filter(m => m.status === 'Available')
          .map(m => ({
            id: m.id,
            name: m.name,
            type: m.type,
            location: m.centerId === 'c1' ? 'Chennai' : m.centerId === 'c2' ? 'Delhi' : 'Bangalore',
            status: m.status
          })),
        commonMachineIssues: [
          {
            issue: 'Machine not powering on',
            troubleshootingSteps: ['Check main power switch', 'Verify emergency stop button']
          }
        ]
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  const WelcomeSection = () => (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center space-y-8 md:space-y-12 px-2 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="mx-auto p-3 rounded-2xl bg-primary/10 border border-primary/20 w-fit">
          <Cpu className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl md:text-3xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent tracking-tight">
          AI Zaya – Operational Specialist
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed max-w-lg mx-auto px-4">
          I help manage training machinery, troubleshoot equipment, and provide operational insights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">
        {[
          { title: "Availability", icon: Activity, query: "What machines are available in Chennai?" },
          { title: "Diagnose", icon: Wrench, query: "How to troubleshoot CNC spindle vibration?" },
          { title: "Predictive", icon: Sparkles, query: "Show maintenance predictions." },
          { title: "Training", icon: BookOpen, query: "Explain Welding safety procedures." }
        ].map((card, i) => (
          <button 
            key={i}
            onClick={() => handleSend(card.query)}
            className="group flex flex-row items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left gap-4"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-xs md:text-sm text-white group-hover:text-primary transition-colors">{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] relative bg-background/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex h-12 md:h-14 items-center justify-between px-4 md:px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Cpu className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs md:text-sm font-headline font-bold">AI Zaya</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat}
          className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 w-full" ref={scrollRef}>
        <div className="max-w-4xl mx-auto py-4 md:py-8 px-4 md:px-6 space-y-6">
          {messages.length === 0 ? <WelcomeSection /> : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                    <AvatarFallback className={m.role === 'assistant' ? 'bg-primary text-[8px]' : 'bg-accent text-[8px]'}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed",
                      m.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-slate-200'
                    )}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-center">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8"><AvatarFallback className="bg-primary text-[8px]">ZA</AvatarFallback></Avatar>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-primary/70 uppercase tracking-widest font-bold">Thinking...</div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/5 border border-white/10 rounded-xl backdrop-blur-2xl flex items-center p-1 md:p-1.5 focus-within:border-primary/50 transition-all">
            <Input 
              className="bg-transparent border-0 h-9 md:h-10 text-xs md:text-sm focus-visible:ring-0 placeholder:text-muted-foreground/30" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="flex items-center gap-1 md:gap-1.5 px-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn("h-8 w-8 rounded-lg", isListening ? "text-red-500" : "text-muted-foreground")}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
              <Button 
                size="icon" 
                className="h-8 w-8 bg-primary text-white rounded-lg" 
                onClick={() => handleSend()} 
                disabled={isLoading || (!input.trim() && !isListening)}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
