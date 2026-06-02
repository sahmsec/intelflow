import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans overflow-x-hidden selection:bg-violet-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-slate-950/50 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
            IF
          </div>
          <span className="font-bold text-xl tracking-tight">IntelFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Button variant="primary" asChild className="rounded-full">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-4 relative z-10">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/30 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center mt-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
            IntelFlow 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Know their next move <br className="hidden md:block" />
            before they make it.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The AI-powered competitor intelligence platform for enterprise strategy teams. Monitor pricing, features, and market shifts in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" className="rounded-full h-14 px-8 text-base w-full sm:w-auto group">
              Start Tracking Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base w-full sm:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10">
              Book a Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="w-full max-w-6xl mt-24 relative z-10 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20" />
          <div className="w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
            <span className="text-slate-500">Interactive Dashboard Demo (ReactBits Aurora Integration Next)</span>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-4 bg-slate-950 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to win.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Comprehensive monitoring across all digital channels, distilled by AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Zap className="w-8 h-8 text-violet-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Get notified the second a competitor changes pricing, launches a feature, or starts hiring.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <BarChart2 className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Market Radar</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Visualize your market positioning and identify unexploited opportunities automatically.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Shield className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enterprise Ready</h3>
              <p className="text-slate-400 text-sm leading-relaxed">SSO, audit logs, role-based access control, and dedicated success managers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 px-8 mt-auto relative z-10 text-sm text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center font-bold text-white text-xs">
              IF
            </div>
            <span className="font-medium text-slate-300">IntelFlow Inc. &copy; 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
