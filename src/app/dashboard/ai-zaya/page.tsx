
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, BrainCircuit, GraduationCap, Copy, RefreshCw,
  Search, Info, FileText, CheckCircle2, Terminal, ShieldCheck
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural Link Error: " + error.message, timestamp: new Date() }]);
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
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-[1400px] mx-auto bg-card/5 border border-white/5 md:rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-3xl transition-all duration-500 relative">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/20 shadow-lg shadow-primary/10 border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-headline font-bold flex items-center gap-2">
              AI Zaya Operational Core
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/30 text-primary">v2.5 FLASH</Badge>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Encrypted Link Active</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 h-10 w-10 transition-colors">
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Conversation Area */}
      <ScrollArea className="flex-1 px-4 md:px-12 lg:px-20 py-8" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
              <div className="relative">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 relative z-10 shadow-2xl">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-[80px] -z-0 opacity-40 animate-pulse" />
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Operator'}.
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
                  I am Zaya, your centralized intelligence layer. I have full visibility of the {machines?.length || 0} nodes in your fleet. How shall we proceed?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {quickActions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(action.query)} 
                    className="group p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/50 text-left flex items-center gap-5 transition-all hover:bg-white/[0.05] shadow-sm hover:shadow-primary/10"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary transition-all">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors mb-1">Module</span>
                      <span className="text-sm md:text-base font-bold truncate">{action.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={i} 
                    className={cn("flex gap-6 items-start", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                      <Avatar className={cn(
                        "h-10 w-10 border shadow-2xl", 
                        m.role === 'user' ? 'border-accent/30' : 'border-primary/30'
                      )}>
                        <AvatarFallback className={cn(
                          "text-[10px] font-bold", 
                          m.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'
                        )}>
                          {m.role === 'user' ? 'USR' : 'ZYA'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className={cn("flex flex-col gap-3", m.role === 'user' ? 'items-end' : 'items-start', "max-w-[88%]")}>
                      <div className={cn(
                        "px-8 py-6 rounded-[2.5rem] shadow-2xl backdrop-blur-sm", 
                        m.role === 'user' 
                          ? 'tech-gradient text-white rounded-tr-none' 
                          : 'bg-white/[0.04] border border-white/10 text-foreground rounded-tl-none'
                      )}>
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none break-words">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({children}) => <p className="leading-relaxed mb-4 last:mb-0">{children}</p>,
                              ul: ({children}) => <ul className="space-y-2 mb-4 ml-4 list-disc marker:text-primary">{children}</ul>,
                              li: ({children}) => <li className="pl-1">{children}</li>,
                              code: ({children}) => <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-primary text-xs">{children}</code>
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                        
                        {m.role === 'assistant' && (
                          <div className="flex gap-3 mt-8 pt-4 border-t border-white/5">
                            <Button variant="ghost" size="sm" className="h-8 rounded-xl hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground gap-2" onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              toast({ title: "Synchronized", description: "Response text copied to neural buffer." });
                            }}>
                              <Copy className="h-3.5 w-3.5" /> Copy Log
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 rounded-xl hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground gap-2">
                              <RefreshCw className="h-3.5 w-3.5" /> Re-Analyze
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 px-2">
                        {m.analysis && (
                          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                            <BrainCircuit className="h-3 w-3 text-primary" />
                            <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Fleet Telemetry Synced</span>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-6 items-center animate-in fade-in slide-in-from-left-4 duration-500">
                  <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 animate-pulse">
                    <AvatarFallback className="bg-transparent text-primary text-[10px] font-bold">ZYA</AvatarFallback>
                  </Avatar>
                  <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-full flex items-center gap-4 shadow-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Querying Operational Nodes...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Modern Command Deck (Sticky Input) */}
      <div className="absolute bottom-0 left-0 right-0 px-8 py-10 bg-gradient-to-t from-background via-background/90 to-transparent z-40">
        <div className="max-w-4xl mx-auto">
          {/* Quick Context Chips */}
          <div className="flex gap-3 justify-center mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {quickActions.map((chip, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => handleSend(chip.query)}
                className="rounded-full bg-black/20 border-white/10 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-primary/20 hover:text-primary hover:border-primary/40 h-8 transition-all shrink-0 backdrop-blur-md px-5"
              >
                <chip.icon className="mr-2 h-3 w-3" />
                {chip.label}
              </Button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-black/60 border border-white/10 rounded-[2.2rem] flex items-center p-2.5 focus-within:border-primary/40 transition-all shadow-3xl backdrop-blur-3xl">
              <div className="flex items-center px-5">
                <Terminal className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <Input 
                className="bg-transparent border-0 h-14 text-base md:text-lg focus-visible:ring-0 placeholder:text-muted-foreground/30 shadow-none px-2 font-medium" 
                placeholder="Enter fleet query or maintenance request..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <div className="flex gap-2 pr-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-12 w-12 rounded-2xl transition-all duration-300", 
                    isListening ? "text-red-500 bg-red-500/10 shadow-lg scale-110" : "text-muted-foreground hover:bg-white/10"
                  )} 
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-12 w-12 tech-gradient text-white rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform active:scale-95 disabled:opacity-30 disabled:grayscale" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] text-muted-foreground/40 mt-4 uppercase tracking-[0.3em] font-bold">
            Secure Neural Uplink Channel • AES-256 Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
