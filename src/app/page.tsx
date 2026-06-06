"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart2, Shield, Zap, Check } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import IntelFlowLogo from '@/components/ui/IntelFlowLogo';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LiquidEther = dynamic(() => import('@/components/ui/LiquidEther'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-200/20 dark:bg-slate-950/20 animate-pulse" />
});

export default function LandingPage() {
  const { isSignedIn, user } = useAuth();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (plan: string) => {
    setLoadingPlan(plan);
    if (plan === "Free") {
      router.push(isSignedIn ? "/dashboard" : "/login");
      setLoadingPlan(null);
      return;
    }

    if (!isSignedIn) {
      router.push(`/login?callbackUrl=/settings`);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cycle: isAnnual ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initiate checkout session");
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error starting checkout session");
      setLoadingPlan(null);
    }
  };
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#7998db_0%,#cbd6f6_50%,#e5ecf9_75%,#e5ecf9_100%)] dark:bg-[linear-gradient(135deg,#2d124d_0%,#120524_50%,#07010f_75%,#07010f_100%)] text-slate-800 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-violet-500/20 relative transition-colors duration-300">
      
      {/* LiquidEther WebGL Background Fluid Simulation matching mock palette */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-50 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={22}
          cursorSize={110}
          isViscous={false}
          viscous={30}
          iterationsViscous={12}
          iterationsPoisson={12}
          resolution={0.25}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.2}
          autoIntensity={1.2}
          dt={0.008}
          takeoverDuration={0.25}
          autoResumeDelay={2000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Decorative Background Blobs for depth */}
      <div className="fixed top-[10%] left-[15%] w-[600px] h-[600px] bg-violet-500 rounded-full filter blur-[120px] opacity-15 dark:opacity-20 pointer-events-none" />
      <div className="fixed bottom-[5%] right-[10%] w-[700px] h-[700px] bg-blue-400 rounded-full filter blur-[120px] opacity-15 dark:opacity-20 pointer-events-none" />
      <div className="fixed top-[40%] left-[40%] w-[500px] h-[500px] bg-pink-400 rounded-full filter blur-[100px] opacity-8 dark:opacity-12 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-lg bg-white/10 dark:bg-slate-950/20 border-b border-white/20 dark:border-white/10 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-950 dark:bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-md border border-white/10">
            <IntelFlowLogo size={16} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-950 dark:text-white">IntelFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700 dark:text-slate-350">
          <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">Pricing</a>
          <Link href={isSignedIn ? "/dashboard" : "/login"} className="hover:text-slate-950 dark:hover:text-white transition-colors">Console</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard"
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Go to Console
              </Link>
              <Link 
                href="/settings?tab=profile"
                className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-xs shadow-md border border-white/20 dark:border-white/10 overflow-hidden hover:scale-105 transition-transform"
                title={user?.name || "User Profile"}
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="glass-btn-solid rounded-full px-5 py-2 font-bold text-xs border border-white/10 shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-36 pb-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mt-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/[0.04] border border-white/70 dark:border-white/10 text-violet-750 dark:text-violet-300 text-xs font-bold shadow-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-violet-600 animate-pulse"></span>
            IntelFlow 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.08] text-slate-950 dark:text-white bg-clip-text bg-gradient-to-b from-slate-950 to-slate-950/70 dark:from-white dark:to-white/70">
            Know their next move <br className="hidden md:block" />
            before they make it.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            The AI-powered competitor intelligence platform for enterprise strategy teams. Monitor pricing, features, and market shifts in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={isSignedIn ? "/dashboard" : "/login"}
              className="glass-btn-solid rounded-full h-13 px-8 text-sm font-bold flex items-center justify-center gap-2 border border-white/10 group shadow-md"
            >
              Start Tracking Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={isSignedIn ? "/dashboard" : "/login"}
              className="glass-btn-transparent rounded-full h-13 px-8 text-sm font-bold flex items-center justify-center border border-white/80 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-200"
            >
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="w-full max-w-6xl mt-24 relative z-10 glass-card p-3 md:p-5 shadow-[0_20px_50px_-12px_rgba(30,41,59,0.04)] border-none">
          <div className="w-full aspect-[16/9] bg-white/20 dark:bg-slate-950/60 rounded-2xl overflow-hidden border border-white/45 dark:border-white/5 flex flex-col items-center justify-center relative shadow-sm">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 dark:bg-white/20 border border-white/60 dark:border-white/10"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 dark:bg-white/20 border border-white/60 dark:border-white/10"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-white/50 dark:bg-white/20 border border-white/60 dark:border-white/10"></span>
            </div>
            
            <IntelFlowLogo size={48} className="text-slate-700/60 dark:text-violet-400/80 animate-pulse mb-3" />
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Launch IntelFlow Console</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1 mb-6">Open the production-grade competitor analytics workspace</p>
            <Link href={isSignedIn ? "/dashboard" : "/login"} className="glass-btn-solid rounded-full px-6 py-2.5 font-bold text-xs border border-white/10">
              Open Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-4 relative z-10 border-t border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/[0.01] backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-4 font-sans">Everything you need to win.</h2>
            <p className="text-slate-650 dark:text-slate-400 font-semibold max-w-2xl mx-auto">Comprehensive monitoring across all digital channels, distilled by AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 border-none hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <Zap className="w-8 h-8 text-violet-650 dark:text-violet-400 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Real-time Alerts</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">Get notified the second a competitor changes pricing, launches a feature, or starts hiring.</p>
            </div>
            <div className="glass-card p-8 border-none hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <BarChart2 className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Market Radar</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">Visualize your market positioning and identify unexploited opportunities automatically.</p>
            </div>
            <div className="glass-card p-8 border-none hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
              <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Enterprise Ready</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">SSO, audit logs, role-based access control, and dedicated success managers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative z-10 border-t border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/[0.005] backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-750 dark:text-violet-300 text-xs font-bold shadow-sm mb-4 border border-violet-500/20">
              Pricing Plans
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-4 font-sans">Fair pricing. First 3 months free.</h2>
            <p className="text-slate-650 dark:text-slate-400 font-semibold max-w-2xl mx-auto">All plans start with a full 90-day free trial. Cancel or upgrade anytime, no questions asked.</p>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-800 p-0.5 transition-colors relative flex items-center cursor-pointer"
              >
                <motion.div 
                  layout
                  className="w-5 h-5 rounded-full bg-violet-600 shadow-sm"
                  animate={{ x: isAnnual ? '24px' : '0px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Annually
                <span className="text-[10px] bg-emerald-500/10 text-emerald-750 border border-emerald-500/20 px-2 py-0.5 rounded-full font-extrabold">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="glass-card p-8 border-none flex flex-col justify-between hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] relative">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Free</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Perfect for evaluating the platform.</p>
                <div className="mb-6">
                  <div className="flex items-baseline text-slate-900 dark:text-white gap-1">
                    <span className="text-3xl font-extrabold">$</span>
                    <span className="text-5xl font-black">0</span>
                    <span className="text-slate-500 text-sm font-bold">/mo</span>
                  </div>
                  <span className="text-xs text-violet-750 dark:text-violet-400 font-extrabold mt-1 block">Free forever (No credit card)</span>
                </div>
                <ul className="space-y-3 mb-8 border-t border-white/20 pt-6">
                  {['Track 1 competitor', 'Basic daily monitoring alerts', 'Daily email summaries', 'Community support'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Check className="w-4 h-4 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handlePlanSelect('Free')}
                disabled={loadingPlan !== null}
                className="glass-btn-transparent rounded-2xl w-full py-3 text-xs font-bold text-center border border-white/80 dark:border-white/10 text-slate-850 dark:text-slate-200 block cursor-pointer disabled:opacity-50"
              >
                {loadingPlan === 'Free' ? 'Loading...' : 'Sign Up Free'}
              </button>
            </div>

            {/* Starter Plan */}
            <div className="glass-card p-8 border-none flex flex-col justify-between hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] relative">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Starter</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Perfect for solo marketing operations.</p>
                <div className="mb-6">
                  <div className="flex items-baseline text-slate-900 dark:text-white gap-1">
                    <span className="text-3xl font-extrabold">$</span>
                    <span className="text-5xl font-black">{isAnnual ? '24' : '29'}</span>
                    <span className="text-slate-500 text-sm font-bold">/mo</span>
                  </div>
                  <span className="text-xs text-violet-750 dark:text-violet-400 font-extrabold mt-1 block">3 Months Free Trial ($0 today)</span>
                </div>
                <ul className="space-y-3 mb-8 border-t border-white/20 pt-6">
                  {['Track up to 5 competitors', 'Basic hourly monitoring alerts', 'Daily email summaries', 'Email support'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Check className="w-4 h-4 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handlePlanSelect('Starter')}
                disabled={loadingPlan !== null}
                className="glass-btn-transparent rounded-2xl w-full py-3 text-xs font-bold text-center border border-white/80 dark:border-white/10 text-slate-850 dark:text-slate-200 block cursor-pointer disabled:opacity-50"
              >
                {loadingPlan === 'Starter' ? 'Loading...' : 'Start Free Trial'}
              </button>
            </div>

            {/* Professional Plan (Featured) */}
            <div className="glass-card p-8 border-none flex flex-col justify-between bg-white/70 dark:bg-slate-950/50 hover:bg-white/80 dark:hover:bg-slate-950/65 transition-all shadow-xl relative border-2 border-violet-500/30 scale-[1.02]">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold px-4.5 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/10">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Professional</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Designed for expanding commercial teams.</p>
                <div className="mb-6">
                  <div className="flex items-baseline text-slate-900 dark:text-white gap-1">
                    <span className="text-3xl font-extrabold">$</span>
                    <span className="text-5xl font-black">{isAnnual ? '64' : '79'}</span>
                    <span className="text-slate-500 text-sm font-bold">/mo</span>
                  </div>
                  <span className="text-xs text-violet-750 dark:text-violet-400 font-extrabold mt-1 block">3 Months Free Trial ($0 today)</span>
                </div>
                <ul className="space-y-3 mb-8 border-t border-white/20 pt-6">
                  {['Track up to 15 competitors', 'Real-time alert delivery', 'AI-generated strategic insights', 'Slack integration', 'Priority support'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Check className="w-4 h-4 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handlePlanSelect('Professional')}
                disabled={loadingPlan !== null}
                className="glass-btn-solid rounded-2xl w-full py-3 text-xs font-bold text-center border border-white/10 block cursor-pointer disabled:opacity-50 scale-[1.02]"
              >
                {loadingPlan === 'Professional' ? 'Loading...' : 'Start Free Trial'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card p-8 border-none flex flex-col justify-between hover:bg-white/55 dark:hover:bg-white/[0.06] transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] relative">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Enterprise</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Built for cross-functional corporate strategy.</p>
                <div className="mb-6">
                  <div className="flex items-baseline text-slate-900 dark:text-white gap-1">
                    <span className="text-3xl font-extrabold">$</span>
                    <span className="text-5xl font-black">{isAnnual ? '159' : '199'}</span>
                    <span className="text-slate-500 text-sm font-bold">/mo</span>
                  </div>
                  <span className="text-xs text-violet-750 dark:text-violet-400 font-extrabold mt-1 block">3 Months Free Trial ($0 today)</span>
                </div>
                <ul className="space-y-3 mb-8 border-t border-white/20 pt-6">
                  {['Unlimited competitor tracking', 'Customized AI threat alert feeds', 'HubSpot & CRM API integrations', 'SSO & Advanced Security configuration', 'Dedicated Success Analyst'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Check className="w-4 h-4 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handlePlanSelect('Enterprise')}
                disabled={loadingPlan !== null}
                className="glass-btn-transparent rounded-2xl w-full py-3 text-xs font-bold text-center border border-white/80 dark:border-white/10 text-slate-850 dark:text-slate-200 block cursor-pointer disabled:opacity-50"
              >
                {loadingPlan === 'Enterprise' ? 'Loading...' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 dark:border-white/10 bg-white/10 dark:bg-slate-950/40 py-12 px-8 mt-auto relative z-10 text-sm text-slate-650 dark:text-slate-400 font-semibold">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-950 dark:bg-violet-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-sm border border-white/10">
              IF
            </div>
            <span className="font-bold text-slate-800 dark:text-white">IntelFlow Inc. &copy; 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
