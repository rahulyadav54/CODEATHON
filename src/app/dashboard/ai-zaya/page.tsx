"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, BrainCircuit, GraduationCap, Copy, RefreshCw,
  Search, Info, FileText, CheckCircle2, Terminal, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { aiZayaOperationalSupport } from '@/ai/flows/ai-zaya-operational-support-flow';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: string;
  isError?: boolean;
};

export default function AiZayaPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const userRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);
  
  const machinesQuery = useMemo(() => db ? collection(db, 'machines') : null, [db]);
  const { data: machines } = useCollection(machinesQuery);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Not Supported", description: "Voice recognition not supported in this browser." });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleSend = async (forcedInput?: string) => {
    const queryStr = forcedInput || input.trim();
    if (!queryStr || isLoading || !profile) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryStr, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await aiZayaOperationalSupport({
        studentQuery: queryStr,
        userProfile: {
          name: profile.name || 'Operator',
          role: profile.role || 'Trainee',
          skillLevel: profile.skillLevel || 'Beginner',
          totalHours: profile.totalHours || 0,
          bookingHistory: []
        },
        machineFleet: (machines || []).map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          status: m.status,
          usageHours: m.usageHours,
          healthScore: m.healthScore
        })),
        centerDemand: []
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer, 
        timestamp: new Date(),
        analysis: response.skillAnalysis
      }]);
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.message?.toLowerCase().includes('too many requests');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isRateLimit ? "API Limit Reached: Please wait a moment before sending another request." : "Neural Link Error: " + error.message, 
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Check Availability", icon: Search, query: "Which machines are available now?" },
    { label: "Troubleshooting", icon: Wrench, query: "I need help with a machine error." },
    { label: "Safety Protocols", icon: ShieldCheck, query: "What are the safety rules for CNC?" },
    { label: "Fleet Health", icon: Activity, query: "Summarize the health of the current fleet." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] w-full max-w-6xl mx-auto bg-card/20 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative">
      
      {/* 1. Header Area */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-headline font-bold">AI Zaya Operational Core</h2>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/30 text-primary">v2.5 FLASH</Badge>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active Neural Link</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMessages([])} 
            className="rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
           >
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* 2. Scrollable Messages Container */}
      <ScrollArea className="flex-1 w-full overflow-x-hidden" ref={scrollRef}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
              <div className="relative">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 relative z-10 shadow-2xl">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] -z-0" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-headline font-bold tracking-tight text-white">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Operator'}.
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  I am Zaya, your centralized intelligence layer. I have full visibility of the fleet. How shall we proceed?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {quickActions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(action.query)} 
                    className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 text-left flex items-center gap-4 transition-all hover:bg-white/[0.05]"
                  >
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary transition-all">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={cn(
                      "flex gap-4 items-start w-full",
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 shrink-0 mt-1 shadow-lg", 
                      m.role === 'user' ? 'border-accent/30' : 'border-primary/30'
                    )}>
                      <AvatarFallback className={cn(
                        "text-[10px] font-bold", 
                        m.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'
                      )}>
                        {m.role === 'user' ? 'U' : 'Z'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={cn(
                      "flex flex-col gap-2 max-w-[85%]",
                      m.role === 'user' ? 'items-end' : 'items-start'
                    )}>
                      {m.isError ? (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 w-full shadow-lg">
                          <AlertTriangle className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">⚠️ System Failure</p>
                            <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "px-5 py-4 rounded-2xl shadow-xl break-words whitespace-pre-wrap overflow-wrap-anywhere overflow-x-hidden", 
                          m.role === 'user' 
                            ? 'tech-gradient text-white rounded-tr-none' 
                            : 'bg-white/[0.05] border border-white/10 text-foreground rounded-tl-none'
                        )}>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="space-y-2 mb-4 ml-4 list-disc marker:text-primary">{children}</ul>,
                                li: ({children}) => <li className="pl-1">{children}</li>,
                                code: ({children}) => <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs text-primary">{children}</code>
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-1">
                        {m.analysis && (
                          <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                            <BrainCircuit className="h-2.5 w-2.5" /> Fleet Synced
                          </div>
                        )}
                        <span className="text-[9px] text-muted-foreground/40 font-bold uppercase">
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-4 items-center">
                  <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10 animate-pulse">
                    <AvatarFallback className="bg-transparent text-primary text-[10px] font-bold">Z</AvatarFallback>
                  </Avatar>
                  <div className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Processing Query...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Sticky Input Area */}
      <div className="p-4 md:p-6 bg-black/40 backdrop-blur-2xl border-t border-white/5 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Action Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {quickActions.map((q, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => handleSend(q.query)}
                className="rounded-full bg-white/5 border-white/5 text-[9px] h-8 px-5 hover:bg-primary/20 hover:text-primary transition-all shrink-0 font-bold uppercase tracking-wider backdrop-blur-md"
              >
                <q.icon className="mr-2 h-3 w-3" />
                {q.label}
              </Button>
            ))}
          </div>

          <div className="relative flex items-center gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-4 focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all">
                <Terminal className="h-4 w-4 text-muted-foreground/30 mr-2" />
                <Input 
                  className="bg-transparent border-0 h-14 focus-visible:ring-0 placeholder:text-muted-foreground/30 text-sm md:text-base shadow-none" 
                  placeholder="Ask AI Zaya about machine diagnostics, maintenance, or training..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "h-14 w-14 rounded-2xl transition-all duration-300", 
                  isListening ? "text-red-500 bg-red-500/10 shadow-lg scale-105" : "text-muted-foreground hover:bg-white/10"
                )} 
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button 
                size="icon" 
                className="h-14 w-14 tech-gradient text-white rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform active:scale-95 disabled:opacity-30 disabled:grayscale" 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-center text-[8px] text-muted-foreground/30 uppercase tracking-[0.4em] font-bold">
            Encrypted Operational Stream • Level {profile?.skillLevel || 'A'} Clearance
          </p>
        </div>
      </div>
    </div>
  );
}
