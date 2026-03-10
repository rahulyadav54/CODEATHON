import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, BarChart3, ShieldCheck, ArrowRight, Building2, Factory, GraduationCap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-bold">SkillMach <span className="text-primary">AI</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#use-cases">
            Use Cases
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full px-6">Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-6 tech-gradient border-0">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-4 animate-pulse">
                <Zap className="mr-2 h-4 w-4" />
                <span>Next-Gen Machine Management</span>
              </div>
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                Optimize Your <span className="text-primary">Training Infrastructure</span> with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl font-light">
                A data-driven platform for smart management, real-time monitoring, and predictive maintenance of machinery across skill development centers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 h-12 text-lg tech-gradient border-0 hover:scale-105 transition-transform">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#use-cases">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-lg hover:bg-white/5">
                    Explore Use Cases
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="w-full py-20 bg-white/[0.02]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-headline font-bold mb-4">Where can you use SkillMach AI?</h2>
               <p className="text-muted-foreground max-w-2xl mx-auto">Our platform scales to support various types of technical training environments.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Vocational Institutes", icon: GraduationCap, desc: "Manage CNCs and 3D printers across multiple city campuses." },
                { title: "Industrial Training", icon: Factory, desc: "Track student machine hours for government certifications." },
                { title: "Corporate Hubs", icon: Building2, desc: "Internal workforce training for large-scale manufacturing firms." },
                { title: "Government Missions", icon: Globe, desc: "Scaling training infrastructure with centralized AI monitoring." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-center">
                   <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <item.icon className="h-6 w-6" />
                   </div>
                   <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/50 transition-all">
                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold">Real-time Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Monitor machine utilization, health, and demand across all centers with live data dashboards.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/50 transition-all">
                <div className="p-3 rounded-xl bg-accent/20 text-accent">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold">AI Predictive Maintenance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Prevent breakdowns before they happen using our AI model that analyzes usage and sensor logs.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/50 transition-all">
                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold">AI Zaya Assistant</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A smart chatbot that answers student queries, suggests machines, and explains operations.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/50 transition-all">
                <div className="p-3 rounded-xl bg-accent/20 text-accent">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold">Role-Based Access</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Secure permissions for Admins, Trainers, and Students to manage bookings and resources.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-white/10 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <p className="text-sm font-headline font-bold">SkillMach AI &copy; 2024</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Smart Infrastructure for Smarter Training.
          </p>
          <div className="flex gap-4">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Terms</Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
