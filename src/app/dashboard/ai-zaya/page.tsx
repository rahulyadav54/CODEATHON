
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Info, 
  Copy, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Paperclip,
  Activity,
  History,
  ShieldCheck,
  ChevronRight
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

  // Auto-scroll to bottom when messages change
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 animate-in fade-in zoom-in duration-700 py-10">
      <div className="space-y-4">
        <div className="mx-auto p-5 rounded-3xl bg-primary/10 border border-primary/20 w-fit mb-6 shadow-[0_0_50px_rgba(var(--primary),0.05)]">
          <Cpu className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent tracking-tight">
          AI Zaya – Operational Specialist
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
          I help manage training machinery, troubleshoot equipment, and provide operational insights to help you master your craft.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4">
        {[
          { title: "Check Availability", icon: Activity, desc: "See which CNCs or printers are free right now.", query: "What machines are available in Chennai?" },
          { title: "Diagnose Issue", icon: Wrench, desc: "Get step-by-step troubleshooting for any machine error.", query: "How to troubleshoot CNC spindle vibration?" },
          { title: "Predictive Health", icon: Sparkles, desc: "Check AI predictions for machine maintenance.", query: "Show maintenance predictions for Bangalore center." },
          { title: "Training Help", icon: BookOpen, desc: "Summarize manuals or explain technical concepts.", query: "Explain Arc Welding safety procedures." }
        ].map((card, i) => (
          <button 
            key={i}
            onClick={() => handleSend(card.query)}
            className="group flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] transition-all text-left space-y-4 backdrop-blur-md shadow-lg"
          >
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors w-fit">
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-normal">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/30 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex h-16 items-center justify-between px-8 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold tracking-tight">AI Zaya</h2>
            <div className="flex items-center gap-1.5">
               <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Specialist Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChat}
            className="rounded-full h-9 w-9 hover:bg-white/10 text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white/10 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Space */}
      <ScrollArea className="flex-1 px-4 lg:px-0" ref={scrollRef}>
        <div className="max-w-4xl mx-auto py-10 px-6">
          {messages.length === 0 ? <WelcomeSection /> : (
            <div className="space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-10 w-10 border shrink-0 shadow-md",
                    m.role === 'assistant' ? 'border-primary/30' : 'border-accent/30'
                  )}>
                    <AvatarFallback className={m.role === 'assistant' ? 'bg-primary' : 'bg-accent'}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                    {m.role === 'assistant' && <AvatarImage src="https://picsum.photos/seed/zaya-avatar/100/100" />}
                    {m.role === 'user' && <AvatarImage src="https://picsum.photos/seed/user-avatar-2/100/100" />}
                  </Avatar>

                  <div className={cn(
                    "flex flex-col gap-2 group max-w-[85%] lg:max-w-[80%]",
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-6 py-4 rounded-2xl shadow-xl relative transition-all duration-300",
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 backdrop-blur-xl text-slate-100 rounded-tl-none'
                    )}>
                      <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed font-normal">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2",
                        m.role === 'user' ? '-left-16' : '-right-16'
                      )}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground"
                          onClick={() => copyToClipboard(m.content)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {m.role === 'assistant' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground"
                            onClick={regenerateResponse}
                          >
                            <RefreshCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 opacity-40 text-[9px] font-bold uppercase tracking-widest">
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.role === 'assistant' && <CheckCircle className="h-2.5 w-2.5 text-green-500" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <Avatar className="h-10 w-10 border border-primary/30">
                    <AvatarFallback className="bg-primary">ZA</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-6 py-4 flex gap-3 items-center backdrop-blur-xl">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">Generating...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="w-full px-6 lg:px-12 pb-8 pt-4 sticky bottom-0 z-50 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Quick Suggestions */}
          {messages.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 mask-linear-right">
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
                  className="rounded-full h-9 px-5 bg-white/5 border-white/10 hover:border-primary/50 text-xs font-medium transition-all backdrop-blur-md whitespace-nowrap"
                  onClick={() => handleSend(q)}
                >
                  {q} <ChevronRight className="ml-1.5 h-3 w-3 opacity-40" />
                </Button>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-xl flex items-center p-1.5 pr-3 focus-within:border-primary/50 transition-all duration-300">
              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-white/5">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input 
                className="bg-transparent border-0 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 px-3" 
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
                    "h-10 w-10 rounded-xl transition-all duration-300",
                    isListening ? "bg-red-500/10 text-red-500 scale-105" : "text-muted-foreground hover:bg-white/5"
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-20" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || (!input.trim() && !isListening)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center px-4">
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
              Technical guidance • Consultation recommended
            </p>
            <div className="flex gap-4">
               <button className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">Safety Protocols</button>
               <button className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">Documentation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
