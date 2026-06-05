"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart2, Shield, Zap, Rocket } from 'lucide-react';
import LiquidEther from '@/components/ui/LiquidEther';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#abbfe5] via-[#c8d7f1] to-[#dbe7f9] text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-violet-500/20 relative">
      
      {/* LiquidEther WebGL Background Fluid Simulation matching mock palette */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-50 mix-blend-multiply">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={22}
          cursorSize={110}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.6}
          autoIntensity={2.5}
          takeoverDuration={0.25}
          autoResumeDelay={2000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-950 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
            IF
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-950">IntelFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
          <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
          <Link href="/dashboard" className="hover:text-slate-950 transition-colors">Console</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors">
            Sign In
          </Link>
          <Link 
            href="/dashboard" 
            className="glass-btn-solid rounded-full px-5 py-2 font-bold text-xs border border-white/10 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-36 pb-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mt-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/70 text-violet-750 text-xs font-bold shadow-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse"></span>
            IntelFlow 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.08] text-slate-950">
            Know their next move <br className="hidden md:block" />
            before they make it.
          </h1>
          <p className="text-lg md:text-xl text-slate-700/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            The AI-powered competitor intelligence platform for enterprise strategy teams. Monitor pricing, features, and market shifts in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="glass-btn-solid rounded-full h-13 px-8 text-sm font-bold flex items-center justify-center gap-2 border border-white/10 group shadow-md"
            >
              Start Tracking Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard"
              className="glass-btn-transparent rounded-full h-13 px-8 text-sm font-bold flex items-center justify-center border border-white/80 shadow-sm text-slate-800"
            >
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="w-full max-w-6xl mt-24 relative z-10 glass-card p-3 md:p-5 shadow-[0_20px_50px_-12px_rgba(30,41,59,0.04)] border-none">
          <div className="w-full aspect-[16/9] bg-white/20 rounded-2xl overflow-hidden border border-white/40 flex flex-col items-center justify-center relative shadow-sm">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 border border-white/60"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 border border-white/60"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 border border-white/60"></span>
            </div>
            
            <Rocket size={48} className="text-slate-700/60 animate-bounce mb-3" />
            <h3 className="font-extrabold text-lg text-slate-800">Launch IntelFlow Console</h3>
            <p className="text-slate-500 text-xs font-semibold mt-1 mb-6">Open the production-grade competitor analytics workspace</p>
            <Link href="/dashboard" className="glass-btn-solid rounded-full px-6 py-2.5 font-bold text-xs border border-white/10">
              Open Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-4 relative z-10 border-t border-white/20 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 mb-4 font-sans">Everything you need to win.</h2>
            <p className="text-slate-650 font-semibold max-w-2xl mx-auto">Comprehensive monitoring across all digital channels, distilled by AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 border-none hover:bg-white/55 transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <Zap className="w-8 h-8 text-violet-600 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Real-time Alerts</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Get notified the second a competitor changes pricing, launches a feature, or starts hiring.</p>
            </div>
            <div className="glass-card p-8 border-none hover:bg-white/55 transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <BarChart2 className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Market Radar</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">Visualize your market positioning and identify unexploited opportunities automatically.</p>
            </div>
            <div className="glass-card p-8 border-none hover:bg-white/55 transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <Shield className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Enterprise Ready</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">SSO, audit logs, role-based access control, and dedicated success managers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/10 backdrop-blur-md py-12 px-8 mt-auto relative z-10 text-sm text-slate-650 font-semibold">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-950 text-white rounded flex items-center justify-center font-bold text-xs shadow-sm">
              IF
            </div>
            <span className="font-bold text-slate-800">IntelFlow Inc. &copy; 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-950 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-950 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-950 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
