
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cpu, ShieldCheck, GraduationCap, Settings, 
  ArrowRight, Loader2, Mail, Lock, UserPlus, LogIn, Sparkles
} from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading } = useUser();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Student' | 'Trainer' | 'Admin'>('Student');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user && !isAuthenticating) {
      router.push('/dashboard');
    }
  }, [user, isAuthenticating, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setIsAuthenticating(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name: name || userCredential.user.email?.split('@')[0] || 'Trainee',
          email: userCredential.user.email,
          role: role,
          skillLevel: 'Beginner',
          totalHours: 0,
          createdAt: new Date().toISOString()
        });
        toast({ title: "Account Created", description: `Welcome to CODEATHON AI as a ${role}.` });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Access Granted", description: "Successfully authenticated to the command center." });
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Please check your credentials."
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) return;
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          id: result.user.uid,
          name: result.user.displayName || 'Trainee',
          email: result.user.email,
          role: 'Student',
          skillLevel: 'Beginner',
          totalHours: 0,
          createdAt: new Date().toISOString()
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Login Failed", description: error.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden font-body">
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-accent/20 rounded-full blur-[140px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-10"
        >
          <div className="inline-flex items-center gap-3 p-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="p-1.5 rounded-full bg-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-headline font-bold tracking-tight">CODEATHON <span className="text-primary">AI</span></span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">
              {isSignUp ? 'New Operational Deployment' : 'System Authorization'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Authenticate to the centralized intelligence layer managing next-gen skill development infrastructure.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border">
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <CardContent className="p-8 md:p-12 space-y-8">
              <form onSubmit={handleAuth} className="space-y-6">
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Full Operator Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. Commander Shepard" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm focus:ring-primary/50 transition-all shadow-inner"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Select Security Clearance (Role)</Label>
                        <RadioGroup 
                          value={role} 
                          onValueChange={(v: any) => setRole(v)} 
                          className="grid grid-cols-3 gap-3"
                        >
                          {[
                            { id: 'Student', label: 'Trainee', icon: GraduationCap },
                            { id: 'Trainer', label: 'Shield', icon: ShieldCheck },
                            { id: 'Admin', label: 'Overlord', icon: Settings }
                          ].map((item) => (
                            <div key={item.id} className="relative group">
                              <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                              <Label
                                htmlFor={item.id}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300",
                                  role === item.id 
                                    ? "bg-primary/20 border-primary ring-2 ring-primary/20 shadow-lg" 
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}
                              >
                                <item.icon className={cn("h-6 w-6 transition-transform duration-300", role === item.id ? "text-primary scale-110" : "text-muted-foreground")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", role === item.id ? "text-primary" : "text-muted-foreground")}>
                                  {item.label}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Fleet Credential (Email)</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-4.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="operator@codeathon.ai" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-14 bg-white/5 border-white/10 rounded-2xl h-14 text-sm focus:ring-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Neural Key (Password)</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-4.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-14 bg-white/5 border-white/10 rounded-2xl h-14 text-sm focus:ring-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full tech-gradient border-0 rounded-2xl h-16 font-bold shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-white relative overflow-hidden group" disabled={isAuthenticating}>
                  {isAuthenticating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                      <span>{isSignUp ? 'Initialize Deployment' : 'Authorize Connection'}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em]"><span className="bg-transparent px-4 text-muted-foreground/40">Secure External Auth</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-white/10 rounded-2xl h-14 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 font-semibold text-sm group" 
                onClick={loginWithGoogle} 
                disabled={isAuthenticating}
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google Engine
              </Button>

              <div className="text-center">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Sparkles className="h-3 w-3" />
                  {isSignUp ? 'Already authorized? Access Command' : 'New operator? Initialize Deployment'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em] font-medium"
        >
          Secure Node Connection Protocol v2.4.9 // CODEATHON AI
        </motion.p>
      </div>
    </div>
  );
}
