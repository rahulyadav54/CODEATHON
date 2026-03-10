"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cpu, Send, Sparkles, BookOpen, Wrench, HelpCircle, Mic, MicOff, Info } from 'lucide-react';
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
        description: "Your browser does not support voice recognition.",
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
        content: "I'm sorry, I'm having trouble processing that request right now. Please try again or reach out to your center trainer.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="flex-1 flex flex-col border-white/5 bg-white/[0.01] backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden border">
        <CardHeader className="border-b border-white/5 bg-white/[0.02] py-5 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-primary/20 tech-gradient">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">AI Zaya</CardTitle>
                <div className="flex items-center gap-2">
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expert Operational Support</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-muted-foreground">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative overflow-hidden bg-[url('https://picsum.photos/seed/tech-bg/1200/800')] bg-fixed bg-cover opacity-90">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
          <ScrollArea className="h-full px-8 py-10 relative z-10" ref={scrollRef}>
            <div className="space-y-8 max-w-4xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4 group",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-10 w-10 border-2 shrink-0 transition-transform group-hover:scale-110",
                    m.role === 'assistant' ? 'border-primary/50 shadow-lg shadow-primary/20' : 'border-accent/50 shadow-lg shadow-accent/20'
                  )}>
                    <AvatarFallback className={m.role === 'assistant' ? 'bg-primary' : 'bg-accent'}>
                      {m.role === 'assistant' ? 'ZA' : 'ME'}
                    </AvatarFallback>
                    {m.role === 'assistant' && <AvatarImage src="https://picsum.photos/seed/zaya-avatar/80/80" />}
                    {m.role === 'user' && <AvatarImage src="https://picsum.photos/seed/user-avatar/80/80" />}
                  </Avatar>
                  <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]">
                    <div className={cn(
                      "rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed shadow-sm transition-all",
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 rounded-tl-none backdrop-blur-md'
                    )}>
                      {m.content}
                    </div>
                    <span className={cn(
                      "text-[10px] text-muted-foreground px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      m.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 border-2 border-primary/50 animate-pulse shrink-0">
                    <AvatarFallback className="bg-primary">ZA</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 border border-white/10 rounded-[1.5rem] rounded-tl-none px-6 py-4 flex gap-2 items-center">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-4xl mx-auto w-full">
               {[
                 { label: "Find CNCs", icon: Sparkles, color: "text-primary", query: "Suggest available CNC machines in Chennai" },
                 { label: "3D Print Help", icon: Wrench, color: "text-accent", query: "How to troubleshoot 3D printer jamming?" },
                 { label: "Welding Safety", icon: BookOpen, color: "text-primary", query: "Summarize Arc Welding Safety Manual" },
                 { label: "Maintenance", icon: Info, color: "text-accent", query: "What are the common issues with electrical kits?" }
               ].map((btn, idx) => (
                 <Button 
                  key={idx}
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs whitespace-nowrap bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all h-9 px-4"
                  onClick={() => handleSend(btn.query)}
                 >
                   <btn.icon className={cn("h-3.5 w-3.5 mr-2", btn.color)} /> {btn.label}
                 </Button>
               ))}
          </div>

          <div className="relative max-w-4xl mx-auto w-full flex items-center gap-3">
            <div className="relative flex-1 group">
              <Input 
                className="bg-white/5 border-white/10 rounded-2xl h-14 pl-6 pr-24 focus:ring-primary focus:border-primary/50 transition-all text-base placeholder:text-muted-foreground/50" 
                placeholder="Message Zaya..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    isListening ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "text-muted-foreground hover:bg-white/10"
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-10 w-10 tech-gradient border-0 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" 
                  onClick={() => handleSend()} 
                  disabled={isLoading || (!input.trim() && !isListening)}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/40 mt-1">
            Zaya can make mistakes. Verify critical technical instructions with your trainer.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
