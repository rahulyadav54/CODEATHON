"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, ShieldCheck, UserCircle, LayoutDashboard, ArrowRight } from 'lucide-react';
import { MockDB, UserRole } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    setLoadingRole(role);
    setTimeout(() => {
      MockDB.setCurrentUser(role);
      router.push('/dashboard');
    }, 800);
  };

  const roles = [
    { 
      id: 'Admin' as UserRole, 
      title: 'Administrator', 
      desc: 'Full system oversight, analytics, and fleet relocation tools.',
      icon: LayoutDashboard,
      color: 'text-primary'
    },
    { 
      id: 'Trainer' as UserRole, 
      title: 'Technical Trainer', 
      desc: 'Approve machine requests, monitor student progress, and log tickets.',
      icon: ShieldCheck,
      color: 'text-accent'
    },
    { 
      id: 'Student' as UserRole, 
      title: 'Student / Trainee', 
      desc: 'Book machines, access AI Zaya help, and view your training history.',
      icon: UserCircle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-headline font-bold">SkillMach AI</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold">Choose your perspective</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Select a role to enter the training management ecosystem. Each portal is tailored for specific operational tasks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button 
              key={role.id}
              onClick={() => handleLogin(role.id)}
              disabled={!!loadingRole}
              className="group text-left transition-all hover:scale-[1.02]"
            >
              <Card className={cn(
                "h-full border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/50 transition-all rounded-3xl overflow-hidden shadow-2xl relative",
                loadingRole === role.id && "ring-2 ring-primary"
              )}>
                <CardHeader className="p-6 pb-2">
                  <div className={cn("p-4 rounded-2xl bg-white/5 w-fit mb-4 group-hover:bg-primary/10 transition-colors", role.color)}>
                    <role.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {role.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-4 mt-auto">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                    {loadingRole === role.id ? 'Connecting...' : 'Enter Portal'}
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          Secure AI-Powered Infrastructure &copy; 2024
        </p>
      </div>
    </div>
  );
}
