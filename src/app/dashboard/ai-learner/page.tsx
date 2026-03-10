"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Sparkles, Loader2, BookOpen, CheckCircle2, HelpCircle, GraduationCap, ChevronRight } from 'lucide-react';
import { aiLearner, AiLearnerOutput } from '@/ai/flows/ai-learner-flow';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiLearnerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [includeMcqs, setIncludeMcqs] = useState(true);
  const [result, setResult] = useState<AiLearnerOutput | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const response = await aiLearner({ 
          fileDataUri: base64,
          includeMcqs 
        });
        setResult(response);
        toast({ title: "Analysis Complete", description: "Your custom study guide is ready." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "AI Error", description: "Failed to process document. Please try a clearer file." });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold">AI Learner</h1>
          <p className="text-muted-foreground text-sm">Convert technical manuals into bite-sized learning modules.</p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <Switch 
              id="mcq-mode" 
              checked={includeMcqs} 
              onCheckedChange={setIncludeMcqs} 
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="mcq-mode" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Generate MCQs</Label>
          </div>
        </div>
      </div>

      {!result && !isLoading && (
        <Card className="border-dashed border-white/20 bg-white/[0.02] rounded-[2.5rem] p-12 text-center space-y-8 group hover:border-primary/50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="mx-auto p-8 rounded-[2rem] bg-primary/5 border border-primary/10 w-fit group-hover:scale-110 transition-transform">
            <FileUp className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-headline font-bold">Upload Training Document</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Select a PDF, technical manual image, or text file. Our AI will extract important questions and create a quiz for you.
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,image/*,.txt"
            onChange={handleFileUpload} 
          />
          <Button className="tech-gradient border-0 px-8 rounded-2xl h-14 font-bold shadow-xl shadow-primary/20">
            Browse Documents
          </Button>
        </Card>
      )}

      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center gap-6 text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-headline font-bold">Neural Ingestion Active</h3>
            <p className="text-sm text-muted-foreground animate-pulse">Mapping technical nodes and generating assessment criteria...</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Summary Card */}
            <Card className="border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden border shadow-2xl">
              <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-headline">Concept Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed">
                  <ReactMarkdown>{result.summary}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Q&A Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                  <GraduationCap className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-headline font-bold uppercase tracking-widest text-accent">Critical Q&A</h3>
                </div>
                <div className="space-y-4">
                  {result.importantQuestions.map((qa, i) => (
                    <Card key={i} className="border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden hover:bg-white/[0.03] transition-all border">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex gap-4">
                          <span className="text-primary font-bold font-mono">Q.</span>
                          <p className="text-sm font-bold text-white">{qa.question}</p>
                        </div>
                        <div className="flex gap-4 pl-0 border-t border-white/5 pt-4">
                          <span className="text-accent font-bold font-mono">A.</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">{qa.answer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* MCQs Section */}
              {result.mcqs && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 ml-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-headline font-bold uppercase tracking-widest text-primary">Knowledge Check</h3>
                  </div>
                  <div className="space-y-6">
                    {result.mcqs.map((mcq, i) => (
                      <Card key={i} className="border-white/5 bg-white/[0.02] rounded-3xl border shadow-lg">
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-4">
                            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                            <CardTitle className="text-sm font-bold leading-tight">{mcq.question}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                          {mcq.options.map((opt, optIdx) => (
                            <div 
                              key={optIdx} 
                              className={cn(
                                "p-4 rounded-xl text-xs font-medium border flex items-center justify-between transition-all",
                                optIdx === mcq.correctIndex 
                                  ? "bg-green-500/10 border-green-500/30 text-green-500" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10"
                              )}
                            >
                              {opt}
                              {optIdx === mcq.correctIndex && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-10">
              <Button 
                variant="outline" 
                className="rounded-2xl border-white/10 px-8 h-14 font-bold hover:bg-white/5"
                onClick={() => setResult(null)}
              >
                Analyze Another Document
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
