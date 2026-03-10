
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, BrainCircuit, GraduationCap, Copy, RefreshCw,
  Search, Info, FileText, CheckCircle2
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
        machineFleet: machines.map(m => ({
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
    { label: "Find Available Machines", icon: Search, query: "Which CNC machines are currently available in the Chennai center?" },
    { label: "Machine Troubleshooting", icon: Wrench, query: "I'm having alignment issues with the 3D printer. What should I check?" },
    { label: "Show Machine Status", icon: Activity, query: "Show me a health summary of all machines in the fleet." },
    { label: "Explain Training Manual", icon: BookOpen, query: "Can you explain the safety protocols for high-pressure hydraulic equipment?" },
    { label: "Maintenance Report", icon: FileText, query: "Generate a summary of pending maintenance tasks." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-[1400px] mx-auto bg-card/10 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-8 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/20 shadow-lg shadow-primary/10">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold">AI Zaya</h2>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fleet Core Online</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="rounded-xl text-muted-foreground hover:bg-white/5 h-10 w-10">
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Conversation Area */}
      <ScrollArea className="flex-1 px-6 md:px-20 py-10" ref={scrollRef}>
        <div className="max-w-5xl mx-auto space-y-12">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
              <div className="relative">
                <div className="p-8 rounded-full bg-primary/10 border border-primary/20 relative z-10">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-[80px] -z-0 opacity-50" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">System Ready, {profile?.name?.split(' ')[0] || 'Operator'}.</h1>
                <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">I am your intelligence layer for SkillMach AI. How can I optimize your training node today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {quickActions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(action.query)} 
                    className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-primary/50 text-left flex items-center gap-5 transition-all hover:bg-white/[0.05] shadow-sm"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary transition-all">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors mb-1">Command</span>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-10 pb-20">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={cn("flex gap-6", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <Avatar className="h-10 w-10 shrink-0 shadow-xl border border-white/10 mt-1">
                      <AvatarFallback className={cn("text-[10px] font-bold", m.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white')}>
                        {m.role === 'user' ? 'ME' : 'ZA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col gap-3", m.role === 'user' ? 'items-end' : 'items-start', "max-w-[75%]")}>
                      <div className={cn(
                        "px-8 py-5 rounded-[2.5rem] text-sm leading-relaxed shadow-xl", 
                        m.role === 'user' 
                          ? 'tech-gradient text-white rounded-tr-none' 
                          : 'bg-white/[0.03] border border-white/10 text-foreground rounded-tl-none'
                      )}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm break-words max-w-none">
                          {m.content}
                        </ReactMarkdown>
                        {m.role === 'assistant' && (
                          <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              toast({ title: "Copied", description: "Response text synchronized to clipboard." });
                            }}><Copy className="h-4 w-4 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10"><RefreshCw className="h-4 w-4 text-muted-foreground" /></Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 px-2">
                        {m.analysis && (
                          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                            <BrainCircuit className="h-3 w-3 text-primary" />
                            <span className="text-[9px] text-primary font-bold uppercase tracking-tight">Skill Analysis Synchronized</span>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-6 items-center animate-pulse">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">ZA</AvatarFallback></Avatar>
                  <div className="px-8 py-4 bg-white/[0.02] border border-white/10 rounded-full flex items-center gap-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Synthesizing Neural Response...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Smart Input Bar */}
      <div className="p-10 bg-gradient-to-t from-background via-background/95 to-transparent relative z-20">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Action Chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {quickActions.slice(0, 3).map((chip, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => handleSend(chip.query)}
                className="rounded-full bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-8 transition-all"
              >
                <chip.icon className="mr-2 h-3 w-3" />
                {chip.label}
              </Button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-black/40 border border-white/10 rounded-[2.5rem] flex items-center p-3 focus-within:border-primary/40 transition-all shadow-3xl backdrop-blur-xl">
              <div className="flex items-center px-4">
                <BrainCircuit className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <Input 
                className="bg-transparent border-0 h-14 text-base focus-visible:ring-0 placeholder:text-muted-foreground/30 shadow-none px-2" 
                placeholder="Ask AI Zaya about machinery, protocols, or troubleshooting..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="flex gap-3 pr-3">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-12 w-12 rounded-2xl transition-all", 
                    isListening ? "text-red-500 bg-red-500/10 shadow-lg shadow-red-500/20" : "text-muted-foreground hover:bg-white/10"
                  )} 
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-12 w-12 tech-gradient text-white rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform active:scale-95" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

