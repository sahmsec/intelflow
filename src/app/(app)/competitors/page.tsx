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
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Competitors</h1>
          <p className="text-slate-500">Track and manage your competitive landscape.</p>
        </div>
        <Button variant="primary" onClick={() => setIsAdding(!isAdding)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Add Competitor
        </Button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
          <Card className="p-6 border-violet-200 shadow-violet-100">
            <h3 className="font-semibold mb-4">Track a new competitor</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                placeholder="Company Name (e.g. Acme Corp)" 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input 
                placeholder="Website URL (e.g. acme.com)" 
                value={newUrl} onChange={e => setNewUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <Button variant="primary" onClick={handleAdd} disabled={!newName || !newUrl}>Start Tracking</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search competitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
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
            <Card className="overflow-hidden group hover:border-violet-300 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 border border-slate-200">
                    {comp.logo}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeCompetitor(comp.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900">{comp.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{comp.url}</p>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Risk</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      comp.risk === 'critical' ? 'bg-red-100 text-red-700' : 
                      comp.risk === 'moderate' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {comp.risk}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Trend</span>
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      {getTrendIcon(comp.trend)}
                      <span className="text-xs font-medium text-slate-600 capitalize">{comp.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No competitors found matching "{search}".
          </div>
        )}
      </div>
    </motion.div>
  );
}
