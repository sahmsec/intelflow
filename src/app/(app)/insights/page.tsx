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
      case 'threat': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-emerald-500" />;
      default: return <BarChart3 className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">AI Insights Center</h1>
          <p className="text-slate-500">Strategic recommendations generated automatically.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search insights..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-lg">
          {['all', 'threat', 'opportunity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
              <Card className="p-6 border-l-4 overflow-hidden relative group" style={{
                borderLeftColor: insight.category === 'threat' ? '#ef4444' : insight.category === 'opportunity' ? '#10b981' : '#3b82f6'
              }}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 shrink-0 ${
                    insight.category === 'threat' ? 'bg-red-50 text-red-600' : 
                    insight.category === 'opportunity' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-600">
                          {comp ? comp.name : 'Unknown'}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {insight.time}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {insight.content}
                    </p>

                    {insight.recommendation && (
                      <div className="bg-violet-50/50 border border-violet-100 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                          Action Recommended
                        </h4>
                        <p className="text-sm text-violet-900 leading-relaxed">
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-900">
                    Dismiss <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {filteredInsights.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No insights found for the selected criteria.
          </div>
        )}
      </div>
    </motion.div>
  );
}
