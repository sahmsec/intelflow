"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { Bell, Check, Clock, Globe } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, markAlertReviewed } = useStore();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans mb-1">Alerts</h1>
          <p className="text-slate-700/80 font-medium">Real-time notifications for tracked competitors.</p>
        </div>
        <button className="hidden sm:flex glass-btn-transparent rounded-full px-5 py-2 font-bold text-xs border border-white/80">
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`glass-card p-5 border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] ${
              alert.type === 'pending' ? 'bg-white/60 hover:bg-white/70' : 'bg-white/30 hover:bg-white/40'
            }`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  alert.type === 'pending' 
                    ? 'bg-violet-500/10 text-violet-700 border-violet-500/15' 
                    : 'bg-white/50 text-slate-500 border-white/60'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm text-slate-850">{alert.name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {alert.date}
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${alert.type === 'pending' ? 'text-slate-800' : 'text-slate-600'}`}>
                    New activity detected on website
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider ${
                  alert.type === 'pending' 
                    ? 'bg-blue-500 text-white shadow-blue-500/20' 
                    : 'bg-white/70 text-slate-600 border border-white/80'
                }`}>
                  {alert.status}
                </span>
                
                {alert.type === 'pending' && (
                  <button 
                    onClick={() => markAlertReviewed(alert.id)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Review
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}

        {alerts.length === 0 && (
          <div className="py-12 text-center text-slate-650 font-bold bg-white/25 backdrop-blur-md rounded-[28px] border border-white/40 border-dashed shadow-sm">
            You're all caught up. No new alerts.
          </div>
        )}
      </div>
    </motion.div>
  );
}
