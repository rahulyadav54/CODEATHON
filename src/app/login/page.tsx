
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cpu, ShieldCheck, GraduationCap, Settings, 
  ArrowRight, Loader2, Mail, Lock, UserPlus, LogIn
} from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
        toast({ title: "Account Created", description: `Welcome to SkillMach AI as a ${role}.` });
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
          role: 'Student', // Default for Google Sign-in, can switch later
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-2 shadow-2xl">
            <div className="p-2 rounded-xl bg-primary/20">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight">SkillMach <span className="text-primary">AI</span></span>
          </div>
          <h1 className="text-4xl font-headline font-bold">
            {isSignUp ? 'Initialize Fleet Profile' : 'Command Center Access'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Securely access the centralized intelligence layer for smart machinery and training logistics.
          </p>
        </div>

        <Card className="border-white/5 bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border">
          <CardHeader className="p-8 pb-4 text-center">
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/70">
              {isSignUp ? 'New Deployment' : 'Identity Verification Required'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. John Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Select Operational Role</Label>
                    <RadioGroup 
                      value={role} 
                      onValueChange={(v: any) => setRole(v)} 
                      className="grid grid-cols-3 gap-3"
                    >
                      {[
                        { id: 'Student', label: 'Student', icon: GraduationCap },
                        { id: 'Trainer', label: 'Trainee', icon: ShieldCheck },
                        { id: 'Admin', label: 'Admin', icon: Settings }
                      ].map((item) => (
                        <div key={item.id} className="relative">
                          <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                          <Label
                            htmlFor={item.id}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all",
                              role === item.id 
                                ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", role === item.id ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-[10px] font-bold", role === item.id ? "text-primary" : "text-muted-foreground")}>
                              {item.label}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Fleet Credentials (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="operator@skillmach.ai" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Access Key (Password)</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full tech-gradient border-0 rounded-2xl h-14 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (isSignUp ? <UserPlus className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />)}
                {isSignUp ? 'Finalize Initialization' : 'Authorize Access'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-transparent px-4 text-muted-foreground/50">External Auth Channels</span></div>
            </div>

            <Button variant="outline" className="w-full border-white/10 rounded-2xl h-12 bg-white/5 hover:bg-white/10 transition-colors" onClick={loginWithGoogle} disabled={isAuthenticating}>
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Authenticate with Google
            </Button>

            <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {isSignUp ? 'Return to Access Control?' : 'New Operator in the Fleet?'}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-primary hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Register Profile'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
