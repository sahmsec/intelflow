"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Lightbulb, BarChart3, Search, Clock, ArrowRight } from 'lucide-react';

export default function InsightsPage() {
  const { insights, competitors } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredInsights = insights.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || i.category === filter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'threat': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-emerald-600" />;
      default: return <BarChart3 className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans mb-1">AI Insights Center</h1>
          <p className="text-slate-700/80 font-medium">Strategic recommendations generated automatically.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search insights..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/20 rounded-xl border border-white/50 text-sm font-semibold focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 placeholder-slate-500 backdrop-blur-md"
          />
        </div>
        <div className="flex gap-1 bg-white/20 p-1 rounded-xl border border-white/40">
          {['all', 'threat', 'opportunity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                filter === cat 
                  ? 'bg-white/80 text-slate-800 shadow-sm border border-white/90' 
                  : 'text-slate-650 hover:text-slate-850 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredInsights.map((insight, idx) => {
          const comp = competitors.find(c => c.id === insight.competitorId);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="glass-card p-6 border-none overflow-hidden relative group shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]" 
                style={{
                  borderLeft: `5px solid ${insight.category === 'threat' ? '#ef4444' : insight.category === 'opportunity' ? '#10b981' : '#3b82f6'}`,
                  borderRadius: '28px'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 shrink-0 ${
                    insight.category === 'threat' ? 'bg-red-500/10 text-red-700 border border-red-500/15' : 
                    insight.category === 'opportunity' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/15' : 
                    'bg-blue-500/10 text-blue-700 border border-blue-500/15'
                  }`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-white/60 border-white/80 text-slate-600 shadow-sm">
                          {comp ? comp.name : 'Unknown'}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {insight.time}
                      </div>
                    </div>
                    
                    <p className="text-slate-700/90 text-sm leading-relaxed mb-4 font-medium">
                      {insight.content}
                    </p>

                    {insight.recommendation && (
                      <div className="bg-violet-500/10 border border-violet-500/25 rounded-2xl p-4 mt-3">
                        <h4 className="text-xs font-bold text-violet-750 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                          Action Recommended
                        </h4>
                        <p className="text-sm text-violet-900 font-semibold leading-relaxed">
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Dismiss <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {filteredInsights.length === 0 && (
          <div className="py-12 text-center text-slate-600 font-medium">
            No insights found for the selected criteria.
          </div>
        )}
      </div>
    </motion.div>
  );
}
