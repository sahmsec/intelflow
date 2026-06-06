"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, Bell, FileText, Settings, Menu, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import IntelFlowLogo from '@/components/ui/IntelFlowLogo';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/store/useStore';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, title: 'Overview', exact: true },
  { href: '/competitors', icon: Users, title: 'Competitors' },
  { href: '/insights', icon: Activity, title: 'AI Insights' },
  { href: '/reports', icon: FileText, title: 'Reports' },
  { href: '/alerts', icon: Bell, title: 'Alerts' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { subscription, updateWorkspaceSettings } = useStore();
  const [loadingUpgrade, setLoadingUpgrade] = useState<string | null>(null);
  const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(true);

  // Sync workspace state on mount
  useEffect(() => {
    const syncWorkspace = async () => {
      try {
        // Intercept checkout success parameters to prevent race conditions
        const searchParams = new URLSearchParams(window.location.search);
        const isSuccess = searchParams.get('checkout') === 'success';
        const successPlan = searchParams.get('plan');
        
        if (isSuccess && successPlan) {
          await fetch('/api/workspace', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planSelected: true, plan: successPlan }),
          });
        }

        const res = await fetch('/api/workspace');
        if (res.ok) {
          const ws = await res.json();
          let trialDaysLeft = 90;
          if (ws.stripeCurrentPeriodEnd) {
            const diffTime = new Date(ws.stripeCurrentPeriodEnd).getTime() - Date.now();
            trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          useStore.setState({
            workspaceName: ws.name,
            subscription: {
              plan: ws.plan,
              cycle: ws.stripePriceId?.includes('yr') || ws.stripePriceId?.includes('yearly') ? 'yearly' : 'monthly',
              trialDaysLeft,
              status: ws.status,
              planSelected: ws.planSelected,
            }
          });
        }
      } catch (err) {
        console.error("Failed to sync workspace details with database:", err);
      } finally {
        setIsSyncingWorkspace(false);
      }
    };
    syncWorkspace();
  }, []);

  const handleSelectPlanOnboarding = async (planName: string) => {
    setLoadingUpgrade(planName);
    try {
      if (planName === "Free") {
        const res = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "Free", planSelected: true }),
        });
        if (res.ok) {
          const ws = await res.json();
          useStore.setState((state) => ({
            subscription: {
              ...state.subscription,
              plan: "Free",
              planSelected: true,
              status: "active",
              trialDaysLeft: 0,
            }
          }));
        } else {
          alert("Failed to activate Free plan");
        }
        setLoadingUpgrade(null);
        return;
      }

      // Paid plan upgrade logic -> redirect to checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, cycle: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.mocked) {
          // Sync planSelected directly if running in database mock sandbox mode
          await fetch("/api/workspace", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planSelected: true }),
          });
        }
        window.location.href = data.url;
      } else {
        alert("Failed to initiate checkout");
        setLoadingUpgrade(null);
      }
    } catch (e) {
      console.error(e);
      alert("Error starting checkout session");
      setLoadingUpgrade(null);
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#7998db_0%,#cbd6f6_50%,#e5ecf9_75%,#e5ecf9_100%)] dark:bg-[linear-gradient(135deg,#2d124d_0%,#120524_50%,#07010f_75%,#07010f_100%)] text-slate-800 dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm text-slate-700 dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-200"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="md:hidden fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-[100dvh] w-[90px] border-r border-white/20 dark:border-white/5 bg-white/10 dark:bg-slate-950/20 backdrop-blur-2xl flex flex-col items-center pt-4 pb-6 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/dashboard" className="mb-5 p-3 text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 group">
          <IntelFlowLogo size={24} className="group-hover:scale-105 transition-transform" />
        </Link>
        
        <nav className="flex-1 flex flex-col gap-2 w-full px-4 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-250 ${
                isActive(item.href, item.exact)
                  ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md dark:bg-slate-800/40 dark:text-slate-100 dark:border-white/10 dark:shadow-none'
                  : 'text-slate-700/80 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/20 dark:hover:text-slate-200'
              }`}
              title={item.title}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </nav>

        <div className="mt-auto shrink-0 pt-6 border-t border-white/20 dark:border-white/10 w-full px-4 flex flex-col gap-4 items-center">
          <ThemeToggle />

          <Link
            href="/settings"
            onClick={closeMenu}
            className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-250 ${
              isActive('/settings')
                ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md dark:bg-slate-800/40 dark:text-slate-100 dark:border-white/10 dark:shadow-none'
                : 'text-slate-700/80 hover:bg-white/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/20 dark:hover:text-slate-200'
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </Link>

          <Link 
            href="/settings?tab=profile"
            className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer border border-white/20 dark:border-white/10 overflow-hidden hover:scale-105 transition-transform"
            title={user?.name || 'User Profile'}
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-6 pt-16 md:pt-6 md:pl-[122px] md:pr-8 md:pb-8 lg:pt-8 lg:pl-[138px] lg:pr-12 lg:pb-12 max-w-[1600px] mx-auto w-full">
        {children}
      </main>

      {/* Onboarding Plan Selection Modal Overlay */}
      <AnimatePresence>
        {!isSyncingWorkspace && !subscription.planSelected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-5xl glass-card p-6 md:p-8 text-slate-800 dark:text-slate-100 my-auto shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex p-3.5 bg-violet-500/10 border border-violet-500/20 text-violet-650 dark:text-violet-400 rounded-3xl mb-4 shadow-sm">
                  <Activity size={28} />
                </div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white leading-tight font-sans">
                  Welcome to IntelFlow Pro
                </h2>
                <p className="text-sm text-slate-650 dark:text-slate-400 font-semibold mt-2 max-w-xl mx-auto">
                  Activate your workspace to unlock AI-powered competitor intelligence feeds. Start with a 90-day free trial on any paid tier.
                </p>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    name: 'Free',
                    price: '$0',
                    features: ['1 Tracked Competitor', 'Daily Email Summaries', 'Standard AI Insights'],
                    highlight: false,
                    badge: 'Get Started'
                  },
                  {
                    name: 'Starter',
                    price: '$29',
                    features: ['5 Tracked Competitors', 'Daily Email Summaries', 'Slack Alerts Integration', '90-Day Free Trial ($0 Today)'],
                    highlight: false,
                    badge: 'Most Popular'
                  },
                  {
                    name: 'Professional',
                    price: '$79',
                    features: ['15 Tracked Competitors', 'Real-Time Alert Feed', 'Advanced AI Reports', 'HubSpot & Slack Sync', '90-Day Free Trial ($0 Today)'],
                    highlight: true,
                    badge: 'Best Value'
                  },
                  {
                    name: 'Enterprise',
                    price: '$199',
                    features: ['Unlimited Competitors', 'Custom Frequency Feeds', 'Priority AI Models', 'Dedicated Strategy Support', '90-Day Free Trial ($0 Today)'],
                    highlight: false,
                    badge: 'Custom Power'
                  }
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`relative p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-sm ${
                      p.highlight
                        ? 'bg-violet-500/15 border-violet-500/50 shadow-md ring-2 ring-violet-500/20'
                        : 'bg-white/20 dark:bg-slate-950/20 border-white/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-slate-950/35'
                    }`}
                  >
                    {p.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                        {p.badge}
                      </span>
                    )}
                    
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">{p.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-950 dark:text-white">{p.price}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/month</span>
                      </div>
                      
                      <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold border-t border-white/10 pt-4">
                        {p.features.map((f, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlanOnboarding(p.name)}
                      disabled={loadingUpgrade !== null}
                      className={`w-full py-3 mt-6 text-xs font-black rounded-xl border transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
                        p.highlight
                          ? 'bg-violet-600 hover:bg-violet-750 text-white border-transparent'
                          : 'glass-btn-solid border-white/10 text-slate-800 dark:text-white'
                      }`}
                    >
                      {loadingUpgrade === p.name ? (
                        <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                      ) : (
                        `Select ${p.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                <span>Select a plan to configure your brand dashboard. Downgrade or cancel anytime.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
