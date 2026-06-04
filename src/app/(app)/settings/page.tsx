"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    // In production, this would securely send to the server action
    setSaved({ ...saved, [id]: true });
    setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your workspace preferences and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Nav */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {[
            { id: 'general', label: 'General Workspace' },
            { id: 'ai-providers', label: 'AI Providers' },
            { id: 'team', label: 'Team Members' },
            { id: 'billing', label: 'Billing & Usage' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-violet-600 shadow-sm border border-slate-100' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
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
                <h2 className="text-xl font-semibold text-slate-900 mb-1">AI Providers</h2>
                <p className="text-sm text-slate-500">Bring your own API keys. Keys are encrypted at rest.</p>
              </div>

              <div className="flex flex-col gap-4">
                {AI_PROVIDERS.map((provider) => (
                  <Card key={provider.id} className="p-5 flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-4 w-48 shrink-0">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                        {provider.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{provider.models[0]}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                          type="password"
                          placeholder="Paste API Key starting with sk-..."
                          value={keys[provider.id] || ''}
                          onChange={(e) => setKeys({ ...keys, [provider.id]: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          <AlertCircle className="w-3 h-3" />
                          <span>Not connected</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => handleSave(provider.id)}
                          disabled={!keys[provider.id]}
                          className={saved[provider.id] ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                        >
                          {saved[provider.id] ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Key</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab !== 'ai-providers' && (
            <div className="p-8 text-center bg-white/60 rounded-2xl border border-white border-dashed text-slate-500">
              Settings panel for {activeTab} will go here.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
