
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
  RefreshCcw,
  Paperclip,
  Activity,
  ChevronRight,
  ShieldCheck
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

  // Auto-scroll to bottom when messages change or loading state changes
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
        description: "Your browser does not support voice recognition. Please use Chrome or Edge.",
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
      toast({ variant: "destructive", title: "Voice Error", description: "Could not hear you clearly." });
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
            machineType: 'All',
            troubleshootingSteps: ['Check main power switch', 'Verify emergency stop button', 'Inspect power cable']
          },
          {
            issue: '3D Printer Clogging',
            machineType: '3D Printer',
            troubleshootingSteps: ['Increase nozzle temperature', 'Clean the nozzle with a needle', 'Verify filament diameter']
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
        content: "I'm sorry, I encountered an error. Please contact a trainer.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateResponse = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) handleSend(lastUserMessage.content);
  };

  const clearChat = () => setMessages([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const WelcomeSection = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-12 py-12 px-4 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="mx-auto p-4 rounded-2xl bg-primary/10 border border-primary/20 w-fit mb-4">
          <Cpu className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent tracking-tight">
          AI Zaya – Operational Specialist
        </h1>
        <p className="text-base text-muted-foreground font-normal leading-relaxed max-w-xl mx-auto">
          I help manage training machinery, troubleshoot equipment, and provide operational insights to help you master your craft.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[
          { title: "Check Availability", icon: Activity, desc: "See which CNCs or printers are free right now.", query: "What machines are available in Chennai?" },
          { title: "Diagnose Issue", icon: Wrench, desc: "Get step-by-step troubleshooting for any machine error.", query: "How to troubleshoot CNC spindle vibration?" },
          { title: "Predictive Health", icon: Sparkles, desc: "Check AI predictions for machine maintenance.", query: "Show maintenance predictions for Bangalore center." },
          { title: "Training Help", icon: BookOpen, desc: "Summarize manuals or explain technical concepts.", query: "Explain Arc Welding safety procedures." }
        ].map((card, i) => (
          <button 
            key={i}
            onClick={() => handleSend(card.query)}
            className="group flex flex-col p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] transition-all text-left space-y-3 backdrop-blur-md"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors w-fit">
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 font-normal leading-normal">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] relative bg-background/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header - Sticky at the top of the chat area */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold tracking-tight">AI Zaya</h2>
            <div className="flex items-center gap-1.5">
               <span className="flex h-1 w-1 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Specialist Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <ScrollArea className="flex-1 w-full" ref={scrollRef}>
        <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
          {messages.length === 0 ? <WelcomeSection /> : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-8 w-8 border shrink-0",
                    m.role === 'assistant' ? 'border-primary/30' : 'border-accent/30'
                  )}>
                    <AvatarFallback className={m.role === 'assistant' ? 'bg-primary text-[10px]' : 'bg-accent text-[10px]'}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                    {m.role === 'assistant' && <AvatarImage src="https://picsum.photos/seed/zaya-avatar/100/100" />}
                    {m.role === 'user' && <AvatarImage src="https://picsum.photos/seed/user-avatar-2/100/100" />}
                  </Avatar>

                  <div className={cn(
                    "flex flex-col gap-1.5 group max-w-[85%] lg:max-w-[75%]",
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl relative transition-all duration-300",
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    )}>
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed font-normal">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                        m.role === 'user' ? '-left-12' : '-right-12'
                      )}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full hover:bg-white/10 text-muted-foreground"
                          onClick={() => copyToClipboard(m.content)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 opacity-40 text-[8px] font-bold uppercase tracking-widest">
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.role === 'assistant' && <CheckCircle className="h-2 w-2 text-green-500" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarFallback className="bg-primary text-[10px]">ZA</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex gap-2 items-center">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span className="ml-1 text-[9px] font-bold uppercase tracking-widest text-primary/70">Generating...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Section - Sticky at the bottom of the chat area */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick Suggestions */}
          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-right">
              {[
                "Suggest available machines",
                "How to troubleshoot CNC vibration?",
                "Relocation insights for Chennai",
                "Summarize Welding Safety"
              ].map((q, idx) => (
                <Button 
                  key={idx}
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-8 px-4 bg-white/5 border-white/10 hover:border-primary/50 text-[10px] font-medium transition-all backdrop-blur-md whitespace-nowrap"
                  onClick={() => handleSend(q)}
                >
                  {q} <ChevronRight className="ml-1 h-3 w-3 opacity-40" />
                </Button>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/5 border border-white/10 rounded-xl backdrop-blur-2xl shadow-xl flex items-center p-1.5 pr-2 focus-within:border-primary/50 transition-all duration-300">
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-white/5">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input 
                className="bg-transparent border-0 h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 px-3" 
                placeholder="Ask AI Zaya about machines, troubleshooting, or training..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="flex items-center gap-1.5">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-300",
                    isListening ? "bg-red-500/10 text-red-500 scale-105" : "text-muted-foreground hover:bg-white/5"
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-9 w-9 bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-20" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || (!input.trim() && !isListening)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-2">
            <p className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
              Technical guidance • Consultation recommended
            </p>
            <div className="flex gap-3">
               <button className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">Safety Protocols</button>
               <button className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">Documentation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
