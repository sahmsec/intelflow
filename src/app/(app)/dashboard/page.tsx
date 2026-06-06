"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Search, Plus, ArrowUpRight, Activity, TrendingUp, RotateCw } from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value, count, rounded, duration]);

  return <>{display}</>;
}

/* ── Stagger container ── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

/* ── Animated Bar ── */
function AnimatedBar({ height, isHighlight, label, alertCount }: { height: number; isHighlight: boolean; label: string; alertCount?: number }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full h-[130px] flex items-end justify-center">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${height}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          className={`w-9 rounded-full relative ${
            isHighlight 
              ? 'bg-gradient-to-t from-blue-500 via-indigo-400 to-indigo-500 shadow-md shadow-indigo-500/20 border border-white/20' 
              : 'bg-white/25 border border-white/40 shadow-sm backdrop-blur-sm'
          }`}
        >
          {isHighlight && alertCount !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4, ease: 'backOut' }}
              className="absolute -top-[34px] left-1/2 -translate-x-1/2 bg-black text-white px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-md shadow-black/10"
            >
              {alertCount} alerts
            </motion.div>
          )}
        </motion.div>
      </div>
      <span className={`text-[11px] ${isHighlight ? 'text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400 font-normal'}`}>{label}</span>
    </div>
  );
}

/* ── Animated SVG Line with Glow ── */
function AnimatedLine() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <motion.path
        d="M 0 60 Q 30 60 50 30 T 100 40 T 150 10 T 200 30"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ filter: 'url(#glow)' }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.circle
        cx="150" cy="10" r="4.5" fill="white"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.4, ease: 'backOut' }}
      />
      <motion.text
        x="155" y="25" fill="rgba(255,255,255,0.95)" fontSize="10" fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        88%
      </motion.text>
    </svg>
  );
}

/* ── Floating Blob ── */
function FloatingBlob({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20, 
        delay: 0.2 + delay 
      }}
      className={`${className} cursor-pointer`}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardOverview() {
  const { competitors, insights, alerts, addCompetitor, workspaceName, subscription } = useStore();
  const [newCompetitorName, setNewCompetitorName] = useState('');
  
  useEffect(() => {
    const syncWorkspace = async () => {
      try {
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
        console.error("Failed to sync workspace details on dashboard:", err);
      }
    };
    syncWorkspace();
  }, []);

  const handleQuickAdd = () => {
    if (newCompetitorName.trim()) {
      addCompetitor(newCompetitorName, `${newCompetitorName.toLowerCase().replace(/\s+/g, '')}.com`);
      setNewCompetitorName('');
    }
  };

  const criticalCount = competitors.filter(c => c.risk === 'critical' || c.risk === 'moderate').length;
  const activeCount = competitors.length;
  const barData = [
    { h: 40, label: 'MON' }, { h: 50, label: 'TUE' }, { h: 90, label: 'WED' },
    { h: 60, label: 'THU' }, { h: 45, label: 'FRI' }
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="text-slate-800 dark:text-slate-100"
    >
      {/* Expiry alerts */}
      {subscription.plan !== 'Free' && subscription.trialDaysLeft === 0 && (
        <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0"></span>
            <span className="text-xs font-bold text-red-700 dark:text-red-400">Your 3-month free trial has expired! Please select a subscription in settings to continue.</span>
          </div>
          <Link href="/settings" className="px-4 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
            Update Subscription
          </Link>
        </div>
      )}

      {subscription.trialDaysLeft > 0 && subscription.trialDaysLeft <= 10 && (
        <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Your free trial is ending soon! Only {subscription.trialDaysLeft} days remaining.</span>
          </div>
            <Link href="/settings" className="px-4 py-1.5 bg-slate-950 dark:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
            Review Billing
          </Link>
        </div>
      )}

      {/* Header */}
      <motion.header variants={fadeUp} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans">{workspaceName}</h1>
          <p className="text-slate-700/80 dark:text-slate-400 text-sm mt-1 font-medium">Start monitoring your competitors</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
            {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
          </span>
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs px-3.5 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/25 dark:border-emerald-500/30"
          >
            Active
          </motion.span>
        </motion.div>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Total Tracked Card */}
          <motion.div variants={fadeUp}>
            <Card className="glass-card p-8 relative overflow-hidden border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.03)]">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-slate-650 dark:text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Total tracked</p>
                  <h2 className="text-5xl font-extrabold tracking-tight text-slate-950 leading-none">
                    <AnimatedNumber value={activeCount} />
                  </h2>
                </div>
                <div className="flex gap-1.5 bg-white/20 p-1 rounded-full border border-white/40">
                  <span className="text-[10px] font-bold px-3 py-1 bg-white/70 dark:bg-white/15 text-slate-800 dark:text-slate-200 rounded-full shadow-sm">PRO</span>
                  <span className="text-[10px] font-bold px-3 py-1 text-slate-600 dark:text-slate-400 rounded-full">ENT</span>
                </div>
              </div>

              {/* Floating Blobs Container */}
              <div className="relative h-[150px] mt-8 z-0 flex items-center justify-start pl-2 hidden sm:flex">
                <FloatingBlob delay={0} className="w-[125px] h-[125px] rounded-full glass-sphere absolute left-0 z-30 flex flex-col items-center justify-center">
                  <span className="font-extrabold text-2xl text-slate-800 dark:text-white leading-tight"><AnimatedNumber value={activeCount} /></span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Active</span>
                </FloatingBlob>
                
                <FloatingBlob delay={0.15} className="w-[145px] h-[145px] rounded-full glass-sphere-glow absolute left-[90px] z-20 flex flex-col items-center justify-center">
                  <span className="font-extrabold text-3xl text-white leading-tight"><AnimatedNumber value={criticalCount} /></span>
                  <span className="text-[11px] text-white/80 font-semibold uppercase tracking-wider">Critical</span>
                </FloatingBlob>

                <FloatingBlob delay={0.3} className="w-[125px] h-[125px] rounded-full glass-sphere absolute left-[200px] z-10 flex flex-col items-center justify-center">
                  <span className="font-extrabold text-2xl text-slate-800 dark:text-white leading-tight">0</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Dormant</span>
                </FloatingBlob>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-45"
                >
                  <Link href="/competitors" className="glass-btn-transparent rounded-full px-6 py-2.5 font-bold text-xs text-center text-slate-800 dark:text-slate-100 border border-white/85 transition-all">Add Competitor</Link>
                  <Link href="/reports" className="glass-btn-solid rounded-full px-6 py-2.5 font-bold text-xs text-center border border-white/10 transition-all">View Report</Link>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Statistic */}
            <Card className="glass-card p-6 border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.03)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Activity statistic</h3>
                <span className="text-[11px] font-semibold px-3 py-1.5 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full">Weekly</span>
              </div>
              <div className="flex items-end gap-2 h-[130px] mt-6">
                {barData.map((bar, i) => (
                  <AnimatedBar key={i} height={bar.h} isHighlight={i === 2} label={bar.label} alertCount={i === 2 ? alerts.length : undefined} />
                ))}
              </div>
            </Card>

            {/* Market Health */}
            <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
              <Card className="p-6 bg-gradient-to-br from-[#3d70f6] to-[#7766ef] border-none rounded-[32px] text-white shadow-xl shadow-indigo-500/25">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-white/90">Market health</h3>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    <Activity size={14} />
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold leading-none">
                    <AnimatedNumber value={85} />%
                  </h2>
                  <div className="flex items-center gap-1 mt-1.5">
                    <TrendingUp size={14} className="text-white/85" />
                    <p className="text-xs text-white/80 font-medium">+3.2% since last month</p>
                  </div>
                </div>
                <div className="h-[90px] mt-4 relative">
                  <AnimatedLine />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Movements */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Movements</h3>
              <Link href="/insights" className="px-4 py-2 text-xs bg-slate-950 text-white rounded-xl font-bold border border-white/10 hover:bg-slate-900 transition-colors">
                View All
              </Link>
            </div>
            
            {insights.slice(0, 3).map((insight, idx) => {
              const comp = competitors.find(c => c.id === insight.competitorId);
              return (
                <motion.div key={insight.id} variants={slideRight} whileHover={{ x: 4, transition: { duration: 0.15 } }}>
                  <Card className="glass-card p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/50 border-none transition-all shadow-[0_10px_25px_-5px_rgba(30,41,59,0.02)]">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-white dark:border-slate-700 flex items-center justify-center font-extrabold text-sm text-slate-800 dark:text-white shrink-0 shadow-sm">
                        {comp ? comp.logo : '?'}
                      </div>
                      <span className="font-bold text-sm text-slate-850 truncate pr-4">
                        {insight.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          animate={insight.category === 'threat' ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-1.5 h-1.5 rounded-full ${insight.category === 'threat' ? 'bg-red-500' : insight.category === 'opportunity' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                        />
                        <span className="text-slate-600 dark:text-slate-300 text-xs capitalize font-bold">{insight.category}</span>
                      </div>
                      <span className="text-xs px-3 py-1 bg-white/60 border border-white/70 text-slate-600 dark:text-slate-300 rounded-full font-semibold">
                        {insight.time}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

        </div>

        {/* Right Column */}
        <motion.div variants={fadeUp} className="flex flex-col gap-8">
          
          {/* Latest Alerts */}
          <Card className="glass-card p-6 border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.03)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-850 dark:text-white">Latest Alerts</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Recent competitor updates</p>
              </div>
              {alerts.length > 0 && (
                <div className="flex gap-2.5 items-center">
                  <Search size={16} className="text-slate-500" />
                  <Link href="/alerts" className="px-4 py-1.5 text-xs bg-slate-950 text-white rounded-lg font-bold border border-white/10 hover:bg-slate-900 transition-colors">
                    View All
                  </Link>
                </div>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <p className="font-medium">No alerts yet. Add competitors to start tracking.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {alerts.slice(0, 5).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between py-2 border-b border-white/10 last:border-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-[45%]">
                      <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/10 flex items-center justify-center shadow-sm">
                        <ArrowUpRight size={14} className="text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-[25%] font-medium">{item.date}</span>
                    <div className="w-[30%] text-right">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${
                        item.status === 'Pending' 
                          ? 'bg-blue-500 text-white shadow-blue-500/20' 
                          : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-white/80'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="px-2"
          >
            <h3 className="text-base font-bold text-slate-850 dark:text-white">How to outsmart competitors?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              View these useful tips to strengthen your market positioning.<br />
              <Link href="/insights" className="text-slate-900 dark:text-violet-400 underline font-extrabold mt-1.5 inline-block">Learn more</Link>
            </p>
          </motion.div>

          {/* Quick Add / Quick Transfer component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card className="glass-card p-6 border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.03)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quick add</h3>
                <div className="flex gap-1 bg-white/20 p-0.5 rounded-full border border-white/40">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white/70 dark:bg-white/15 text-slate-800 dark:text-slate-200 rounded-full shadow-sm">All</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 text-slate-600 dark:text-slate-400 rounded-full">Suggested</span>
                </div>
              </div>
              
              {/* Avatars Row - matching Quick Transfer avatar layout */}
              <div className="flex gap-4 items-center justify-start mb-6 overflow-x-auto py-1">
                {/* Column 1: Add new / Plus */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => document.getElementById('quick-add-input')?.focus()}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full border border-dashed border-slate-500/60 dark:border-slate-400/30 bg-white/20 dark:bg-white/5 flex items-center justify-center shadow-sm"
                  >
                    <Plus size={18} className="text-slate-650 dark:text-slate-400" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Add new</span>
                </div>

                {/* Column 2: Acme */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setNewCompetitorName('Acme Corp')}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 dark:border-indigo-400/20 flex items-center justify-center shadow-sm text-indigo-700 dark:text-indigo-400 font-extrabold text-sm"
                  >
                    A
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Acme</span>
                </div>

                {/* Column 3: Globex */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setNewCompetitorName('Globex Inc')}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 dark:border-emerald-400/20 flex items-center justify-center shadow-sm text-emerald-700 dark:text-emerald-400 font-extrabold text-sm"
                  >
                    G
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Globex</span>
                </div>

                {/* Column 4: Soylent */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setNewCompetitorName('Soylent Corp')}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 dark:border-amber-400/20 flex items-center justify-center shadow-sm text-amber-700 dark:text-amber-400 font-extrabold text-sm"
                  >
                    S
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Soylent</span>
                </div>
              </div>

              <div className="flex gap-3 items-center mb-6">
                <input 
                  id="quick-add-input"
                  type="text" 
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  placeholder="Enter Competitor Name"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/10 focus:bg-white/40 dark:focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Tracking</span>
                <button 
                  onClick={handleQuickAdd}
                  className="glass-btn-solid rounded-full px-6 py-2.5 font-bold text-xs border border-white/10 hover:shadow-lg transition-all"
                >
                  Track
                </button>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
