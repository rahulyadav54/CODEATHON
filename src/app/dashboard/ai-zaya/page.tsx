
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, BrainCircuit, GraduationCap, Copy, RefreshCw
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
      toast({ variant: "destructive", title: "Not Supported", description: "Voice recognition not supported." });
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
          name: profile.name || 'User',
          role: profile.role || 'Student',
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to Zaya brain: " + error.message, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-card/20 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold">AI Zaya</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fleet Intelligence</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="rounded-full text-muted-foreground hover:bg-white/5">
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-12 py-8" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-10 animate-in fade-in zoom-in duration-700">
              <div className="p-5 rounded-full bg-primary/10 border border-primary/20 relative">
                <Sparkles className="h-14 w-14 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl -z-10" />
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-headline font-bold">How can I assist you today, {profile?.name?.split(' ')[0] || 'Trainee'}?</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">I help manage training machinery, troubleshoot equipment, and provide operational insights based on your skill level.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { label: "Check Availability", icon: Activity, query: "Show me available CNC machines across all centers." },
                  { label: "Skill Diagnostic", icon: GraduationCap, query: "Analyze my skill level and suggest my next module." },
                  { label: "Troubleshoot Issue", icon: Wrench, query: "How do I fix common alignment errors on a 3D printer?" },
                  { label: "Recommend Slot", icon: BrainCircuit, query: "Find me a free 2-hour slot for the Precision CNC today." }
                ].map((card, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(card.query)} 
                    className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 text-left flex items-center gap-4 transition-all hover:bg-white/10"
                  >
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{card.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={cn("flex gap-5", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <Avatar className="h-9 w-9 shrink-0 shadow-lg">
                      <AvatarFallback className={cn("text-[10px] font-bold", m.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white')}>
                        {m.role === 'user' ? 'ME' : 'ZA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col gap-2 max-w-[85%]", m.role === 'user' ? 'items-end' : 'items-start')}>
                      <div className={cn(
                        "px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm", 
                        m.role === 'user' ? 'bg-primary text-white' : 'bg-secondary/40 border border-white/5 text-foreground'
                      )}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm break-words">
                          {m.content}
                        </ReactMarkdown>
                        {m.role === 'assistant' && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/10" onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              toast({ title: "Copied", description: "Message text copied to clipboard." });
                            }}><Copy className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          </div>
                        )}
                      </div>
                      {m.analysis && (
                        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                          <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] text-primary font-bold uppercase tracking-tight">AI Skill Analysis Attached</span>
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-2">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-5 items-center">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">ZA</AvatarFallback></Avatar>
                  <div className="px-6 py-3 bg-secondary/30 border border-white/5 rounded-2xl flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Analyzing fleet telemetry...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-8 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-30 group-focus-within:opacity-60 transition-opacity" />
          <div className="relative bg-black/40 border border-white/10 rounded-3xl flex items-center p-2 focus-within:border-primary/50 transition-all shadow-2xl">
            <Input 
              className="bg-transparent border-0 h-12 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40 shadow-none px-4" 
              placeholder="Ask AI Zaya about machines, skills, or troubleshooting..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="flex gap-2 pr-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn("h-10 w-10 rounded-2xl", isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-white/10")} 
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button 
                size="icon" 
                className="h-10 w-10 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform" 
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
