"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Key, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'], icon: 'O' },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-opus'], icon: 'A' },
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'], icon: 'G' },
  { id: 'groq', name: 'Groq', models: ['llama-3.1-70b', 'mixtral-8x7b'], icon: 'Q' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('ai-providers');
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = (id: string) => {
    setSaved({ ...saved, [id]: true });
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 font-sans mb-1">Settings</h1>
        <p className="text-slate-700/80 font-medium">Manage your workspace preferences and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Nav */}
        <div className="w-full md:w-64 flex flex-col gap-1.5 shrink-0">
          {[
            { id: 'general', label: 'General Workspace' },
            { id: 'ai-providers', label: 'AI Providers' },
            { id: 'team', label: 'Team Members' },
            { id: 'billing', label: 'Billing & Usage' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm rounded-xl text-left transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md font-bold' 
                  : 'text-slate-700/80 hover:bg-white/40 hover:text-slate-900 font-semibold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'ai-providers' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-950 mb-1">AI Providers</h2>
                <p className="text-sm text-slate-650 font-semibold">Bring your own API keys. Keys are encrypted at rest.</p>
              </div>

              <div className="flex flex-col gap-4">
                {AI_PROVIDERS.map((provider) => (
                  <Card key={provider.id} className="glass-card p-5 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-4 w-48 shrink-0">
                      <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-extrabold border border-white/10 shadow-sm">
                        {provider.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-850">{provider.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{provider.models[0]}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                        <input
                          type="password"
                          placeholder="Paste API Key starting with sk-..."
                          value={keys[provider.id] || ''}
                          onChange={(e) => setKeys({ ...keys, [provider.id]: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-500 backdrop-blur-md"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-lg font-bold shadow-sm">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Not connected</span>
                        </div>
                        <button 
                          onClick={() => handleSave(provider.id)}
                          disabled={!keys[provider.id]}
                          className={`rounded-xl px-5 py-2 font-bold text-xs border border-white/15 transition-all shadow-sm ${
                            saved[provider.id] 
                              ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20' 
                              : 'glass-btn-solid disabled:opacity-50 disabled:pointer-events-none'
                          }`}
                        >
                          {saved[provider.id] ? (
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Saved</span>
                          ) : (
                            <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Key</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab !== 'ai-providers' && (
            <div className="p-12 text-center bg-white/25 backdrop-blur-md rounded-[28px] border border-white/40 border-dashed text-slate-650 font-bold shadow-sm">
              Settings panel for {activeTab} will go here.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
