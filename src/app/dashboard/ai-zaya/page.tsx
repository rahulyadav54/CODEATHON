"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cpu, Send, Sparkles, BookOpen, Wrench, HelpCircle } from 'lucide-react';
import { aiZayaOperationalSupport } from '@/ai/flows/ai-zaya-operational-support-flow';
import { MockDB } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiZayaPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am AI Zaya, your operational support assistant. How can I help you with the training machines today? I can suggest available machines, provide troubleshooting steps, or explain operation manuals.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiZayaOperationalSupport({
        studentQuery: userMessage,
        availableMachines: MockDB.machines
          .filter(m => m.status === 'Available')
          .map(m => ({
            id: m.id,
            name: m.name,
            type: m.type,
            location: m.centerId === 'c1' ? 'Chennai' : 'Delhi',
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

      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact a trainer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <Card className="flex-1 flex flex-col border-white/5 bg-white/[0.02] shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.03] py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold">AI Zaya Assistant</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-xs text-muted-foreground">Powered by SkillMach Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative">
          <ScrollArea className="h-full px-6 py-8" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4",
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <Avatar className={cn(
                    "h-8 w-8",
                    m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  )}>
                    <AvatarFallback>{m.role === 'assistant' ? 'ZA' : 'ME'}</AvatarFallback>
                    {m.role === 'assistant' && <AvatarImage src="https://picsum.photos/seed/zaya/40/40" />}
                  </Avatar>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 rounded-tl-none'
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback>ZA</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 text-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white/[0.03] border-t border-white/5">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
               <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-[10px] whitespace-nowrap bg-white/5 border-white/10"
                onClick={() => setInput("Suggest available CNC machines in Chennai")}
               >
                 <Sparkles className="h-3 w-3 mr-1 text-primary" /> Available CNCs
               </Button>
               <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-[10px] whitespace-nowrap bg-white/5 border-white/10"
                onClick={() => setInput("How to troubleshoot 3D printer jamming?")}
               >
                 <Wrench className="h-3 w-3 mr-1 text-accent" /> Troubleshooting
               </Button>
               <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-[10px] whitespace-nowrap bg-white/5 border-white/10"
                onClick={() => setInput("Summarize Arc Welding Safety Manual")}
               >
                 <BookOpen className="h-3 w-3 mr-1 text-primary" /> Summarize Manuals
               </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                className="bg-white/5 border-white/10 rounded-2xl h-12 pr-12 focus:ring-primary" 
                placeholder="Ask Zaya anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" className="h-10 w-10 tech-gradient border-0 rounded-xl shrink-0" onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
