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
  AlertCircle
} from 'lucide-react';
import { aiZayaOperationalSupport } from '@/ai/flows/ai-zaya-operational-support-flow';
import { MockDB } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AiZayaPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I am AI Zaya, your advanced operational support assistant. I can help you find machines, troubleshoot technical issues, or explain training manuals. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
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

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Automatically send if transcript is clear
      if (transcript.length > 5) {
        handleSend(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: "Could not hear you clearly. Please try again.",
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

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
            troubleshootingSteps: ['Check main power switch', 'Verify emergency stop button is disengaged', 'Inspect power cable for damage']
          },
          {
            issue: 'Excessive heat or smoke during operation',
            machineType: 'CNC/Welding',
            troubleshootingSteps: ['Immediately press Emergency Stop', 'Check coolant levels', 'Inspect tool wear and friction']
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
        content: "I'm sorry, I encountered an error. Please check your network connection or contact a trainer if the issue persists.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: 'Chat cleared. How else can I help you with your training today?',
      timestamp: new Date()
    }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this information elsewhere.",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto px-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="flex-1 flex flex-col border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden border">
        {/* Header */}
        <CardHeader className="border-b border-white/5 bg-white/[0.03] py-6 px-8 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-primary/20 tech-gradient ring-1 ring-white/20">
                <Cpu className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-[#1e293b] animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent">AI Zaya</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                 <span className="flex h-2 w-2 rounded-full bg-green-500" />
                 <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em]">Operational Specialist</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/10 text-muted-foreground h-11 w-11"
              onClick={clearChat}
              title="Clear Conversation"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-muted-foreground h-11 w-11">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Chat Content */}
        <CardContent className="flex-1 p-0 relative overflow-hidden bg-slate-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.03),transparent_70%)]" />
          <ScrollArea className="h-full px-6 md:px-12 py-10 relative z-10" ref={scrollRef}>
            <div className="space-y-10 max-w-4xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-5 group",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-12 w-12 border-2 shrink-0 transition-all duration-300 group-hover:scale-110",
                    m.role === 'assistant' 
                      ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
                      : 'border-accent/50 shadow-[0_0_15px_rgba(var(--accent),0.3)]'
                  )}>
                    <AvatarFallback className={m.role === 'assistant' ? 'bg-primary' : 'bg-accent'}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                    {m.role === 'assistant' && <AvatarImage src="https://picsum.photos/seed/zaya-avatar/100/100" />}
                    {m.role === 'user' && <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" />}
                  </Avatar>
                  
                  <div className={cn(
                    "flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]",
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "rounded-[2rem] px-6 py-5 text-base md:text-lg leading-relaxed shadow-xl transition-all relative group/bubble",
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none font-medium' 
                        : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-xl'
                    )}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      
                      {m.role === 'assistant' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -right-12 top-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-white"
                          onClick={() => copyToClipboard(m.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-3",
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}>
                      <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.role === 'assistant' && <CheckCircle className="h-3 w-3 text-green-500/50" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-5">
                  <Avatar className="h-12 w-12 border-2 border-primary/50 animate-pulse shrink-0">
                    <AvatarFallback className="bg-primary">ZA</AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-800/80 border border-white/10 rounded-[2rem] rounded-tl-none px-8 py-5 flex gap-3 items-center backdrop-blur-xl">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                    <span className="ml-2 text-sm font-medium text-muted-foreground animate-pulse">Zaya is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Footer / Input */}
        <CardFooter className="p-8 bg-slate-900/60 border-t border-white/5 flex flex-col gap-6">
          {/* Quick suggestions */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-4xl mx-auto w-full no-scrollbar">
               {[
                 { label: "Find CNCs", icon: Sparkles, color: "text-blue-400", query: "Suggest available CNC machines in Chennai" },
                 { label: "Printer Troubleshooting", icon: Wrench, color: "text-amber-400", query: "How to troubleshoot 3D printer jamming?" },
                 { label: "Safety Summary", icon: BookOpen, color: "text-emerald-400", query: "Summarize Arc Welding Safety Manual" },
                 { label: "Contact Trainer", icon: AlertCircle, color: "text-rose-400", query: "I need to talk to a trainer about a critical machine error" }
               ].map((btn, idx) => (
                 <Button 
                  key={idx}
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-sm font-medium whitespace-nowrap bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all h-10 px-6 backdrop-blur-md"
                  onClick={() => handleSend(btn.query)}
                 >
                   <btn.icon className={cn("h-4 w-4 mr-2", btn.color)} /> {btn.label}
                 </Button>
               ))}
          </div>

          <div className="relative max-w-4xl mx-auto w-full flex items-center gap-4">
            <div className="relative flex-1 group">
              <Input 
                className="bg-white/5 border-white/10 rounded-[1.5rem] h-16 pl-8 pr-28 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-lg placeholder:text-muted-foreground/30 shadow-inner" 
                placeholder="Ask Zaya anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-12 w-12 rounded-2xl transition-all duration-300",
                    isListening ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 scale-110" : "text-muted-foreground hover:bg-white/10"
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-12 w-12 tech-gradient border-0 rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || (!input.trim() && !isListening)}
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground/30 font-medium">
            AI Zaya can make technical errors. Always verify safety procedures with your certified trainer.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
