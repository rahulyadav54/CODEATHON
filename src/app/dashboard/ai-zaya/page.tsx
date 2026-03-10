"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, BrainCircuit, Search, 
  Terminal, AlertTriangle, Info, FileText
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
    { label: "Check Availability", icon: Activity, query: "Which machines are available now?" },
    { label: "Troubleshoot Issue", icon: Wrench, query: "I need help with a machine error." },
    { label: "Explain Manual", icon: BookOpen, query: "Explain the training manual for CNC operation." },
    { label: "Status Update", icon: Cpu, query: "Show the current status of the fleet." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] w-full max-w-6xl mx-auto bg-[#1a1c24] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* 1. Header Area */}
      <div className="flex h-20 items-center justify-between px-8 border-b border-white/5 bg-[#1a1c24] z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold text-white leading-tight">AI Zaya</h2>
            <p className="text-xs text-muted-foreground/60 font-medium">Operational Specialist</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMessages([])} 
          className="rounded-xl text-muted-foreground/40 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* 2. Scrollable Messages Container */}
      <ScrollArea className="flex-1 w-full overflow-x-hidden bg-[#1a1c24]" ref={scrollRef}>
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-8">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 inline-block">
                  <Sparkles className="h-10 w-10 text-primary/60" />
                </div>
              </div>
              
              <div className="space-y-4 mb-12">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-white">
                  How can I assist you today?
                </h1>
                <p className="text-sm text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
                  Ask me about machine availability, diagnostics, or training guides.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {quickActions.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(action.query)} 
                    className="group p-5 rounded-2xl bg-[#232530] border border-white/[0.03] hover:border-primary/40 text-left flex items-center gap-5 transition-all"
                  >
                    <div className="p-3 rounded-xl bg-[#2a2d3a] group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-all">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
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
                      "h-8 w-8 shrink-0 mt-1 shadow-lg border-white/5", 
                      m.role === 'user' ? 'bg-accent' : 'bg-primary'
                    )}>
                      <AvatarFallback className="text-[10px] font-bold text-white">
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
                            ? 'bg-[#2a2d3a] text-white rounded-tr-none border border-white/5' 
                            : 'bg-[#232530] border border-white/5 text-foreground rounded-tl-none'
                        )}>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="space-y-2 mb-4 ml-4 list-disc marker:text-primary">{children}</ul>,
                                li: ({children}) => <li className="pl-1">{children}</li>,
                                code: ({children}) => <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs text-primary/80">{children}</code>
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-1">
                        {m.analysis && (
                          <div className="flex items-center gap-1.5 text-[9px] text-primary/60 font-bold uppercase tracking-widest">
                            <BrainCircuit className="h-2.5 w-2.5" /> Fleet Synced
                          </div>
                        )}
                        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase">
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-4 items-center">
                  <div className="h-8 w-8 rounded-full bg-[#232530] border border-white/5 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 animate-spin text-primary/60" />
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 uppercase font-bold tracking-widest">Neural Processing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Sticky Input Area */}
      <div className="p-6 md:p-8 bg-[#1a1c24] border-t border-white/5 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center bg-[#232530] border border-white/10 rounded-2xl px-5 h-16 group transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_20px_rgba(var(--primary),0.05)]">
            <Input 
              className="bg-transparent border-0 h-full focus-visible:ring-0 placeholder:text-muted-foreground/20 text-sm md:text-base shadow-none px-0" 
              placeholder="Ask AI Zaya about machines, troubleshooting, or training..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "h-10 w-10 rounded-xl transition-all", 
                  isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground/30 hover:bg-white/5"
                )} 
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button 
                size="icon" 
                className="h-10 w-10 tech-gradient text-white rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-30 disabled:grayscale" 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
