"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Cpu, Send, Sparkles, BookOpen, Wrench, Mic, MicOff, 
  Trash2, Activity, Loader2, Copy, BrainCircuit, GraduationCap
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
  analysis?: string;
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
    const query = forcedInput || input.trim();
    if (!query || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await aiZayaOperationalSupport({
        studentQuery: query,
        userProfile: {
          name: MockDB.currentUser.name,
          role: MockDB.currentUser.role,
          skillLevel: MockDB.currentUser.skillLevel,
          totalHours: MockDB.currentUser.totalHours,
          bookingHistory: MockDB.bookings.filter(b => b.studentId === MockDB.currentUser.id).map(b => b.machineId)
        },
        machineFleet: MockDB.machines,
        centerDemand: MockDB.centers
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer, 
        timestamp: new Date(),
        analysis: response.skillAnalysis
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to Zaya brain.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-background border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold">AI Zaya</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fleet Intelligence</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="rounded-full text-muted-foreground hover:bg-white/5"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-8 py-6" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
              <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-headline font-bold">Welcome back, {MockDB.currentUser.name}</h1>
                <p className="text-sm text-muted-foreground">I can analyze your level, suggest machines, and troubleshoot fleet issues.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { label: "Analyze My Skill Level", icon: GraduationCap, query: "Analyze my skill level based on my history." },
                  { label: "Find Best Machine", icon: Activity, query: "What machine should I book next for my level?" },
                  { label: "Recommend Slot", icon: BrainCircuit, query: "Are there any free slots for CNC-101 today?" },
                  { label: "Fix CNC Vibration", icon: Wrench, query: "How do I fix excessive vibration on the precision CNC?" }
                ].map((card, i) => (
                  <button key={i} onClick={() => handleSend(card.query)} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 text-left flex items-center gap-4 transition-all">
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary"><card.icon className="h-5 w-5" /></div>
                    <span className="text-xs font-medium">{card.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn("text-[10px] font-bold", m.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white')}>
                      {m.role === 'user' ? 'ME' : 'ZA'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("flex flex-col gap-2 max-w-[85%]", m.role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn("px-5 py-4 rounded-2xl text-sm leading-relaxed", m.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-slate-300')}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm">{m.content}</ReactMarkdown>
                    </div>
                    {m.analysis && (
                       <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                          <BrainCircuit className="h-3 w-3 text-yellow-500" />
                          <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-tight">AI Skill Analysis Attached</span>
                       </div>
                    )}
                    <span className="text-[10px] text-muted-foreground">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-center">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">ZA</AvatarFallback></Avatar>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Synthesizing fleet telemetry...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30" />
          <div className="relative bg-black/40 border border-white/10 rounded-2xl flex items-center p-2 focus-within:border-primary/50 transition-all">
            <Input 
              className="bg-transparent border-0 h-11 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/30 shadow-none" 
              placeholder="Ask Zaya about skills, suggestions, or troubleshooting..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="flex gap-2 pr-2">
              <Button size="icon" variant="ghost" className={cn("h-9 w-9 rounded-xl", isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-white/5")} onClick={toggleListening}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button size="icon" className="h-9 w-9 bg-primary text-white rounded-xl shadow-lg shadow-primary/20" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}