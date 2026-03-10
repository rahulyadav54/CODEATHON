
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cpu, GraduationCap, Wrench, ShieldAlert,
  Loader2, Mail, Lock, User as UserIcon
} from 'lucide-react';
import { auth, db, useUser } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Trainee' | 'Technician' | 'Admin'>('Trainee');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Redirection logic based on role
  const redirectBasedOnRole = (userRole: string) => {
    toast({ title: "Access Granted", description: `Synchronizing ${userRole} portal...` });
    router.push('/dashboard');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing Credentials", description: "Email and password are required." });
      return;
    }

    setIsAuthenticating(true);

    try {
      if (isSignUp) {
        if (!name) {
          toast({ variant: "destructive", title: "Missing Name", description: "Please enter your full name." });
          setIsAuthenticating(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          id: userCredential.user.uid,
          name: name,
          email: userCredential.user.email,
          role: role,
          skillLevel: 'Beginner',
          totalHours: 0,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        redirectBasedOnRole(role);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const fetchedRole = userDoc.data().role;
          redirectBasedOnRole(fetchedRole || 'Trainee');
        } else {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            role: 'Trainee',
            skillLevel: 'Beginner',
            totalHours: 0,
            createdAt: new Date().toISOString()
          });
          redirectBasedOnRole('Trainee');
        }
      }
    } catch (error: any) {
      setIsAuthenticating(false);
      let errorMessage = "Access denied. Credentials mismatch.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Operator ID already exists.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') errorMessage = "Identity verification failed.";
      
      toast({ variant: "destructive", title: "Security Alert", description: errorMessage });
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole = 'Trainee';
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: result.user.uid,
          name: result.user.displayName || 'Operator',
          email: result.user.email,
          role: 'Trainee',
          skillLevel: 'Beginner',
          totalHours: 0,
          createdAt: new Date().toISOString()
        });
      } else {
        finalRole = userDoc.data().role || 'Trainee';
      }
      redirectBasedOnRole(finalRole);
    } catch (error: any) {
      setIsAuthenticating(false);
      toast({ variant: "destructive", title: "Auth Error", description: error.message });
    }
  };

  if (authLoading && !isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-body">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center space-y-6 mb-10">
          <div className="inline-flex items-center gap-3 p-2 px-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Cpu className="h-5 w-5 text-blue-400" />
            <span className="text-xl font-headline font-bold tracking-widest text-white uppercase">CODEATHON <span className="text-blue-400">AI</span></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tighter">
            {isSignUp ? 'Operator Enrollment' : 'Operator Uplink'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Access the decentralized machine management infrastructure.</p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl border">
          <CardContent className="p-8 md:p-14 space-y-8">
            <form onSubmit={handleAuth} className="space-y-7">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-7 overflow-hidden">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-blue-400/60 tracking-[0.2em]">Full Legal Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                        <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-14 bg-white/[0.03] border-white/10 rounded-2xl h-14 focus:border-blue-500/50 transition-all shadow-inner" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-bold text-blue-400/60 tracking-[0.2em]">Designated Role</Label>
                      <RadioGroup value={role} onValueChange={(v: any) => setRole(v)} className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'Trainee', label: 'Student', icon: GraduationCap },
                          { id: 'Technician', label: 'Teacher', icon: Wrench },
                          { id: 'Admin', label: 'Admin', icon: ShieldAlert }
                        ].map((item) => (
                          <div key={item.id}>
                            <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                            <Label htmlFor={item.id} className={cn("flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all", role === item.id ? "bg-blue-600/10 border-blue-500/50 text-blue-400" : "bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/5")}>
                              <item.icon className="h-6 w-6" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
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
                  <Label className="text-[10px] uppercase font-bold text-blue-400/60 tracking-[0.2em]">Operator Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input type="email" placeholder="name@codeathon.ai" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-14 bg-white/[0.03] border-white/10 rounded-2xl h-14 focus:border-blue-500/50 transition-all shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-blue-400/60 tracking-[0.2em]">Security Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-14 bg-white/[0.03] border-white/10 rounded-2xl h-14 focus:border-blue-500/50 transition-all shadow-inner" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 border-0 rounded-2xl h-16 font-bold text-white group transition-all shadow-xl" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="tracking-widest uppercase text-xs">{isSignUp ? 'Initiate Enrollment' : 'Establish Uplink'}</span>}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.3em]"><span className="bg-black/80 px-4 text-white/20">OR PROVIDER ACCESS</span></div>
            </div>

            <Button variant="outline" className="w-full border-white/10 rounded-2xl h-14 bg-white/[0.02] hover:bg-white/5 text-white/60 flex items-center justify-center gap-3 transition-colors" onClick={loginWithGoogle} disabled={isAuthenticating}>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Auth Bridge
            </Button>

            <div className="text-center">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 hover:text-blue-400 transition-colors">
                {isSignUp ? 'Already Enrolled? Secure Link' : 'New Operator? Request Enrollment'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
