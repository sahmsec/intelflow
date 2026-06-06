"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, ExternalLink, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CompetitorsPage() {
  const { competitors, removeCompetitor, addCompetitor } = useStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const filtered = competitors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (newName && newUrl) {
      addCompetitor(newName, newUrl);
      setNewName('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans mb-1">Competitors</h1>
          <p className="text-slate-700/80 dark:text-slate-400 font-medium">Track and manage your competitive landscape.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="glass-btn-solid rounded-full px-6 py-2.5 font-bold text-xs flex items-center gap-2 border border-white/10"
        >
          <Plus className="w-4 h-4" /> Add Competitor
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
          <Card className="glass-card p-6 border-none shadow-[0_20px_50px_-12px_rgba(30,41,59,0.03)]">
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-4">Track a new competitor</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                placeholder="Company Name (e.g. Acme Corp)" 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 dark:bg-slate-900/40 border border-white/50 dark:border-white/10 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
              <input 
                placeholder="Website URL (e.g. acme.com)" 
                value={newUrl} onChange={e => setNewUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 dark:bg-slate-900/40 border border-white/50 dark:border-white/10 focus:bg-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
              <button 
                onClick={handleAdd} 
                disabled={!newName || !newUrl}
                className="glass-btn-solid rounded-xl px-6 py-2.5 font-bold text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                Start Tracking
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search competitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white/20 dark:bg-slate-900/40 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-semibold backdrop-blur-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((comp, idx) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-card border-none hover:bg-white/55 dark:hover:bg-white/10 transition-all shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] group overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white/60 dark:bg-slate-800/60 rounded-xl flex items-center justify-center font-extrabold text-lg text-slate-800 dark:text-white border border-white/80 shadow-sm">
                    {comp.logo}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/60 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-white/40">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeCompetitor(comp.id)} className="p-2 hover:bg-red-50/50 hover:text-red-600 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-white/40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">{comp.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{comp.url}</p>

                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Risk</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                      comp.risk === 'critical' ? 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/15 dark:border-red-500/30' : 
                      comp.risk === 'moderate' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/15 dark:border-amber-500/30' : 
                      'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15 dark:border-emerald-500/30'
                    }`}>
                      {comp.risk}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Trend</span>
                    <div className="flex items-center gap-1 bg-white/40 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/70 dark:border-white/10 shadow-sm">
                      {getTrendIcon(comp.trend)}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{comp.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-600 dark:text-slate-400 font-medium">
            No competitors found matching "{search}".
          </div>
        )}
      </div>
    </motion.div>
  );
}
