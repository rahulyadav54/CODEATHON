"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  BookOpen, 
  Wrench, 
  Mic, 
  MicOff, 
  Trash2, 
  Activity,
  Loader2,
  Copy
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
    if (typeof window === 'undefined') return;
    
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
    recognitionRef.current.onerror = () => setIsListening(false);
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
            troubleshootingSteps: ['Check main power switch', 'Verify emergency stop button', 'Check circuit breaker']
          },
          {
            issue: 'Excessive vibration',
            troubleshootingSteps: ['Check machine leveling', 'Inspect spindle bearings', 'Verify tool clamping']
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
        content: "I'm sorry, I encountered an error. Please try again or contact a trainer.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Message copied to clipboard." });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] bg-background/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-headline font-bold block">AI Zaya</span>
            <span className="text-[10px] text-muted-foreground">Operational Specialist</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMessages([])}
          className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 w-full" ref={scrollRef}>
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-12">
              <div className="space-y-4">
                <div className="mx-auto p-4 rounded-3xl bg-primary/10 border border-primary/20 w-fit">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">How can I assist you today?</h1>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Ask me about machine availability, diagnostics, or training guides.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {[
                  { title: "Check Availability", icon: Activity, query: "What machines are available in Chennai?" },
                  { title: "Troubleshoot Issue", icon: Wrench, query: "How to fix CNC vibration?" },
                  { title: "Explain Manual", icon: BookOpen, query: "Explain Welding safety protocols." },
                  { title: "Status Update", icon: Cpu, query: "Show status of CNC-101." }
                ].map((card, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(card.query)}
                    className="group flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left gap-4"
                  >
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-white group-hover:text-primary">{card.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className="h-8 w-8 shrink-0 border border-white/10 shadow-lg">
                    <AvatarFallback className={cn(
                      "text-[10px] font-bold",
                      m.role === 'assistant' ? 'bg-primary text-white' : 'bg-accent text-white'
                    )}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col gap-2 max-w-[80%]",
                    m.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed relative group shadow-lg",
                      m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    )}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm">
                        {m.content}
                      </ReactMarkdown>
                      {m.role === 'assistant' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity"
                          onClick={() => copyToClipboard(m.content)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-center animate-pulse">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">ZA</AvatarFallback></Avatar>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Analyzing telemetry...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-50 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative bg-black/40 border border-white/10 rounded-2xl backdrop-blur-2xl flex items-center p-2 focus-within:border-primary/50 transition-all">
            <Input 
              className="bg-transparent border-0 h-11 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/30 shadow-none" 
              placeholder="Ask AI Zaya about machines, troubleshooting, or training..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="flex items-center gap-2 px-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "h-9 w-9 rounded-xl transition-all", 
                  isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-white/5"
                )}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                className="h-9 w-9 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform" 
                onClick={() => handleSend()} 
                disabled={isLoading || (!input.trim() && !isListening)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
