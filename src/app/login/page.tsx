
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, ShieldCheck, UserCircle, LayoutDashboard, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
        // Default new users to Student
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name: name || userCredential.user.email?.split('@')[0] || 'Trainee',
          email: userCredential.user.email,
          role: 'Student',
          skillLevel: 'Beginner',
          totalHours: 0
        });
        toast({ title: "Account Created", description: "Welcome to SkillMach AI." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome Back", description: "Successfully logged in." });
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
          totalHours: 0
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-headline font-bold">SkillMach AI</span>
          </div>
          <h1 className="text-3xl font-headline font-bold">
            {isSignUp ? 'Join the Fleet' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Access the smart training machinery ecosystem.
          </p>
        </div>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-6 pb-2 text-center">
            <CardDescription>
              {isSignUp ? 'Create your professional training profile.' : 'Sign in to your secure portal.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 rounded-xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full tech-gradient border-0 rounded-xl h-11" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>

            <Button variant="outline" className="w-full border-white/10 rounded-xl h-11 bg-white/5" onClick={loginWithGoogle} disabled={isAuthenticating}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {isSignUp ? 'Already have an account?' : 'New to SkillMach AI?'}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 text-primary hover:underline font-bold"
              >
                {isSignUp ? 'Sign In' : 'Create an Account'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
