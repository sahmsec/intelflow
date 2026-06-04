"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Bell, Check, Clock, Globe, Briefcase, DollarSign } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, markAlertReviewed } = useStore();

  const getAlertIcon = (type: string) => {
    // Just mock icons based on random types for the demo
    return <Globe className="w-4 h-4" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Alerts</h1>
          <p className="text-slate-500">Real-time notifications for tracked competitors.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex">
          Mark all as read
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              alert.type === 'pending' ? 'bg-white shadow-md border-violet-200' : 'bg-slate-50/50 shadow-none border-transparent'
            }`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  alert.type === 'pending' ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{alert.name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.date}
                    </span>
                  </div>
                  <p className={`text-sm ${alert.type === 'pending' ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    New activity detected on website
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  alert.type === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {alert.status}
                </span>
                
                {alert.type === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => markAlertReviewed(alert.id)}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <Check className="w-4 h-4 mr-1" /> Review
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}

        {alerts.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-white/60 rounded-2xl border border-white border-dashed">
            You're all caught up. No new alerts.
          </div>
        )}
      </div>
    </motion.div>
  );
}
