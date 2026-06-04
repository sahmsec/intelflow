"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowUpRight, Activity, TrendingUp } from 'lucide-react';
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
      <div className="w-full h-[120px] flex items-end justify-center">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${height}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          className={`w-8 rounded-lg relative ${isHighlight ? 'bg-gradient-to-t from-blue-400 to-blue-500' : 'bg-white/80'}`}
        >
          {isHighlight && alertCount !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4, ease: 'backOut' }}
              className="absolute -top-[30px] left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
            >
              {alertCount} alerts
            </motion.div>
          )}
        </motion.div>
      </div>
      <span className={`text-xs ${isHighlight ? 'text-slate-900 font-bold' : 'text-slate-500 font-normal'}`}>{label}</span>
    </div>
  );
}

/* ── Animated SVG Line ── */
function AnimatedLine() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
      <motion.path
        d="M 0 60 Q 30 60 50 30 T 100 40 T 150 10 T 200 30"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.circle
        cx="150" cy="10" r="4" fill="white"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.4, ease: 'backOut' }}
      />
      <motion.text
        x="155" y="25" fill="rgba(255,255,255,0.9)" fontSize="10"
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
      className={`${className} cursor-pointer transition-shadow duration-300 hover:shadow-2xl`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
}

/* ══════════════════════ MAIN ══════════════════════ */
export default function DashboardOverview() {
  const { competitors, insights, alerts, addCompetitor } = useStore();
  const [newCompetitorName, setNewCompetitorName] = useState('');
  
  const handleQuickAdd = () => {
    if (newCompetitorName.trim()) {
      addCompetitor(newCompetitorName, `${newCompetitorName.toLowerCase().replace(/\s+/g, '')}.com`);
      setNewCompetitorName('');
    }
  };

  const criticalCount = competitors.filter(c => c.risk === 'critical' || c.risk === 'high').length;
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
      className="text-slate-800"
    >
      {/* Header */}
      <motion.header variants={fadeUp} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your competitive intelligence overview</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="text-sm text-slate-500">
            {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
          </span>
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-semibold"
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
            <Card className="p-8 relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-slate-500 text-sm mb-2 font-medium">Total tracked</p>
                  <h2 className="text-5xl font-bold tracking-tight text-slate-900 leading-none">
                    <AnimatedNumber value={activeCount} />
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-white/80 rounded-full border border-white">PRO</span>
                  <span className="text-xs font-semibold px-3 py-1 bg-white/50 text-slate-500 rounded-full">ENT</span>
                </div>
              </div>

              {/* Floating Blobs Container */}
              <div className="relative h-[140px] mt-6 z-0 flex items-center justify-start pl-5 hidden sm:flex">
                <FloatingBlob delay={0} className="w-[120px] h-[120px] rounded-full bg-white/90 shadow-xl shadow-slate-200/50 absolute left-0 z-30 border border-white">
                  <span className="font-bold text-xl"><AnimatedNumber value={activeCount} /></span>
                  <span className="text-xs text-slate-500">Active</span>
                </FloatingBlob>
                
                <FloatingBlob delay={0.15} className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-xl shadow-violet-500/30 absolute left-[90px] z-20">
                  <span className="font-bold text-2xl text-white"><AnimatedNumber value={criticalCount} /></span>
                  <span className="text-xs text-white/80">Critical</span>
                </FloatingBlob>

                <FloatingBlob delay={0.3} className="w-[120px] h-[120px] rounded-full bg-white/90 shadow-xl shadow-slate-200/50 absolute left-[200px] z-10 border border-white">
                  <span className="font-bold text-xl">0</span>
                  <span className="text-xs text-slate-500">Dormant</span>
                </FloatingBlob>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40"
                >
                  <Link href="/competitors" className="rounded-full px-6 py-3 bg-white/80 text-slate-900 font-medium text-sm text-center hover:bg-white transition-colors shadow-sm">Add Competitor</Link>
                  <Link href="/reports" className="rounded-full px-6 py-3 bg-slate-900 text-white font-medium text-sm text-center hover:bg-slate-800 transition-colors shadow-sm">View Report</Link>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Statistic */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">Activity statistic</h3>
                <span className="text-xs px-3 py-1 bg-white/80 rounded-full">Weekly</span>
              </div>
              <div className="flex items-end gap-2">
                {barData.map((bar, i) => (
                  <AnimatedBar key={i} height={bar.h} isHighlight={i === 2} label={bar.label} alertCount={i === 2 ? alerts.length : undefined} />
                ))}
              </div>
            </Card>

            {/* Market Health */}
            <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
              <Card className="p-6 bg-gradient-to-br from-blue-400 to-blue-500 border-none rounded-3xl text-white shadow-xl shadow-blue-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-medium text-white/90">Market health</h3>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Activity size={14} />
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold leading-none">
                    <AnimatedNumber value={85} />%
                  </h2>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={14} className="text-white/80" />
                    <p className="text-xs text-white/70">+3.2% since last month</p>
                  </div>
                </div>
                <div className="h-[80px] mt-4 relative">
                  <AnimatedLine />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Movements */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-base font-semibold">Recent Movements</h3>
              <Link href="/insights" className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-lg font-medium">
                View All
              </Link>
            </div>
            
            {insights.slice(0, 3).map((insight, idx) => {
              const comp = competitors.find(c => c.id === insight.competitorId);
              return (
                <motion.div key={insight.id} variants={slideRight} whileHover={{ x: 4, transition: { duration: 0.15 } }}>
                  <Card className="p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-sm text-slate-900 border border-slate-100 shrink-0">
                        {comp ? comp.logo : '?'}
                      </div>
                      <span className="font-semibold text-sm truncate pr-4">
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
                        <span className="text-slate-500 text-xs capitalize font-medium">{insight.category}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-white/80 text-slate-500 rounded-full font-medium border border-slate-100">
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
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Latest Alerts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Recent competitor updates</p>
              </div>
              {alerts.length > 0 && (
                <div className="flex gap-3 items-center">
                  <Search size={18} className="text-slate-500" />
                  <Link href="/alerts" className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-lg font-medium">
                    View All
                  </Link>
                </div>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <p>No alerts yet. Add competitors to start receiving intelligence updates.</p>
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
                    className="flex items-center justify-between py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-2/5">
                      <div className="w-8 h-8 rounded-full bg-white/60 border border-white flex items-center justify-center">
                        <ArrowUpRight size={14} className="text-slate-500" />
                      </div>
                      <span className="font-medium text-sm truncate">{item.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 w-1/5">{item.date}</span>
                    <div className="w-1/5 text-right">
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                        item.type === 'pending' ? 'bg-blue-400 text-white' : 'bg-white/80 text-slate-500 border border-white'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <h3 className="text-base font-bold mb-2">How to outsmart competitors?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              View these useful tips to strengthen your market positioning.<br />
              <Link href="/insights" className="text-slate-900 underline font-semibold mt-1 inline-block">Learn more</Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card className="p-6 mt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold">Quick add</h3>
                <div className="flex gap-2">
                  <span className="text-xs text-blue-500 font-medium">All</span>
                  <span className="text-xs px-2 py-0.5 bg-white/80 rounded-full text-slate-500">Suggested</span>
                </div>
              </div>
              
              <div className="flex gap-4 items-center mb-8">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1, borderColor: '#7C3AED' }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full border border-dashed border-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus size={20} className="text-slate-500" />
                  </motion.div>
                  <span className="text-[11px] font-semibold">Add new</span>
                </div>
                
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    placeholder="Competitor Name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold tracking-tight">Tracking</span>
                <Button variant="primary" className="rounded-full px-6" onClick={handleQuickAdd}>Track</Button>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
