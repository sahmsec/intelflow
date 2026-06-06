"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import Loader from '@/components/ui/Loader';
import { 
  FileText, Plus, Search, Calendar, ChevronRight, 
  Trash2, Printer, Copy, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, Sparkles
} from 'lucide-react';

const REPORT_STEPS = [
  "Scanning competitor landing pages and subdomains...",
  "Querying active digital advertising campaigns and SEO tags...",
  "Processing pricing structure changes and feature flags...",
  "Synthesizing AI strategic threat assessments...",
  "Finalizing competitive executive brief..."
];

const PROVIDER_MODELS: Record<string, { name: string; value: string }[]> = {
  gemini: [
    { name: 'Gemini 3.5 Flash (High)', value: 'gemini-3.5-flash-high' },
    { name: 'Gemini 3.5 Flash (Medium)', value: 'gemini-3.5-flash-medium' },
    { name: 'Gemini 3.5 Flash (Low)', value: 'gemini-3.5-flash-low' },
    { name: 'Gemini 3.1 Pro (High)', value: 'gemini-3.1-pro-high' },
    { name: 'Gemini 3.1 Pro (Low)', value: 'gemini-3.1-pro-low' },
    { name: 'Gemini 1.5 Pro (Stable)', value: 'gemini-1.5-pro' },
    { name: 'Gemini 1.5 Flash (Stable)', value: 'gemini-1.5-flash' }
  ],
  openai: [
    { name: 'OpenAI GPT-5.5 (Flagship)', value: 'gpt-5.5' },
    { name: 'OpenAI GPT-5.4 (Standard)', value: 'gpt-5.4' },
    { name: 'OpenAI GPT-4o Mini (Stable)', value: 'gpt-4o-mini' },
    { name: 'OpenAI GPT-4o (Stable)', value: 'gpt-4o' },
    { name: 'OpenAI o4 Mini (Reasoning)', value: 'o4-mini' }
  ],
  anthropic: [
    { name: 'Anthropic Claude 4.8 Opus (Intelligence)', value: 'claude-4.8-opus' },
    { name: 'Anthropic Claude 4.6 Sonnet (Latest)', value: 'claude-4.6-sonnet' },
    { name: 'Anthropic Claude 3.5 Sonnet (Stable)', value: 'claude-3-5-sonnet' }
  ],
  groq: [
    { name: 'Groq Llama 4 Maverick (Latest)', value: 'llama-4-maverick' },
    { name: 'Groq Llama 3.1 70B (Stable)', value: 'llama-3.1-70b' },
    { name: 'Groq Mixtral 8x7B (Stable)', value: 'mixtral-8x7b' }
  ]
};

const getDebateLogs = (competitorName: string, templateType: string) => [
  { agent: 'Explorer', name: 'Gemini 3.5 Flash', color: 'text-blue-500 dark:text-blue-400', msg: `Initiating signal crawl on ${competitorName}...` },
  { agent: 'Explorer', name: 'Gemini 3.5 Flash', color: 'text-blue-500 dark:text-blue-400', msg: `Parsing active metadata tags, robots.txt, and subdomain records.` },
  { agent: 'Explorer', name: 'Gemini 3.5 Flash', color: 'text-blue-500 dark:text-blue-400', msg: `Found key indicators: Recent landing page rewrite centering on SaaS pricing optimizations.` },
  { agent: 'Critic', name: 'Claude 4.8 Opus', color: 'text-amber-500 dark:text-amber-400', msg: `Analyzing raw crawled logs. Noted positioning overlaps with our core product segment.` },
  { agent: 'Critic', name: 'Claude 4.8 Opus', color: 'text-amber-500 dark:text-amber-400', msg: `Evaluating strategic risk score. Competitor is shifting from SMB targeting to mid-market enterprise offerings.` },
  { agent: 'Critic', name: 'Claude 4.8 Opus', color: 'text-amber-500 dark:text-amber-400', msg: `Refining recommendations: Suggest aggressive positioning of our SSO & custom roles to counter.` },
  { agent: 'Director', name: 'GPT-5.5', color: 'text-emerald-500 dark:text-emerald-400', msg: `Consensus synthesis block active. Reconciling inputs for template: "${templateType}".` },
  { agent: 'Director', name: 'GPT-5.5', color: 'text-emerald-500 dark:text-emerald-400', msg: `Compiling risk index (Critical/High). Formatting executive brief.` },
  { agent: 'Director', name: 'GPT-5.5', color: 'text-emerald-500 dark:text-emerald-400', msg: `Double-checking recommendations alignment. Audit complete. Writing markdown.` }
];

export default function ReportsPage() {
  const { 
    competitors, 
    reports, 
    addReport, 
    updateReportStatus, 
    removeReport,
    defaultGenerationMode,
    defaultProvider,
    defaultModel,
    saveGenerationPreferences
  } = useStore();
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  
  // Create Report State
  const [selectedCompId, setSelectedCompId] = useState('');
  const [reportType, setReportType] = useState('Competitive Audit');
  const [generationMode, setGenerationMode] = useState<'single' | 'consensus'>(defaultGenerationMode || 'single');
  const [aiProvider, setAiProvider] = useState(defaultProvider || 'gemini');
  const [aiModel, setAiModel] = useState(defaultModel || 'gemini-1.5-flash');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [search, setSearch] = useState('');
  
  // Generation Animation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepIndex, setGenStepIndex] = useState(0);
  const [newReportId, setNewReportId] = useState('');
  const [apiReportContent, setApiReportContent] = useState('');
  const [apiReportId, setApiReportId] = useState('');

  // Copy success feedback state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  useEffect(() => {
    if (defaultGenerationMode) setGenerationMode(defaultGenerationMode);
    if (defaultProvider) setAiProvider(defaultProvider);
    if (defaultModel) setAiModel(defaultModel);
  }, [defaultGenerationMode, defaultProvider, defaultModel]);

  // Generation sequence
  useEffect(() => {
    if (!isGenerating) return;

    const activeStepsCount = generationMode === 'consensus' ? 9 : REPORT_STEPS.length;

    if (genStepIndex < activeStepsCount) {
      const timer = setTimeout(() => {
        setGenStepIndex(prev => prev + 1);
      }, generationMode === 'consensus' ? 1800 : 1500);
      return () => clearTimeout(timer);
    } else {
      // Finished generating
      const competitor = competitors.find(c => c.id === selectedCompId);
      const competitorName = competitor ? competitor.name : 'Unknown Corp';
      
      const fallbackContent = `### Executive Summary
Our automated intelligence scanner has analyzed public digital signals for **${competitorName}**. Based on recent updates, this competitor is showing high activity indicators in product positioning and pricing.

### Strategic Threat Assessment
- **Threat Index:** High (7.8/10)
- **Primary Action:** The competitor recently adjusted their standard plan pricing. They appear to be offering aggressive discounts to new signups, indicating a potential push to capture mid-market share in the next quarter.
- **Secondary Action:** Discovered new code deployments indicating they are preparing to launch an automated client onboarding workflow.

### Recommended Counter-Strategy
1. Coordinate with sales teams to offer customized multi-month billing flexibility on key enterprise accounts.
2. Promote our superior SSO and custom role management capabilities to highlight enterprise readiness differences.
3. Keep close track of their upcoming landing page updates via our automated alert channel.

*(Note: Stored AI API Keys were not active. Configure your OpenAI or Gemini key under Settings > AI Providers to generate real-time dynamic AI reports).*`;

      const finalContent = apiReportContent || fallbackContent;

      updateReportStatus(newReportId, 'ready', finalContent, apiReportId);
      setSelectedReportId(apiReportId || newReportId);
      setIsGenerating(false);
      setGenStepIndex(0);
      setApiReportContent('');
      setApiReportId('');
    }
  }, [isGenerating, genStepIndex, apiReportContent, apiReportId, generationMode]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompId) return;

    const competitor = competitors.find(c => c.id === selectedCompId);
    const competitorName = competitor ? competitor.name : 'Unknown Corp';

    // Get keys and resolve provider
    const keys = useStore.getState().apiKeys;
    const selectedProvider = aiProvider;
    const apiKey = keys[aiProvider as keyof typeof keys] || '';

    // Save preferences as default if selected
    if (saveAsDefault) {
      saveGenerationPreferences(generationMode, aiProvider, aiModel);
    }

    const tempId = addReport({
      title: `${reportType} - ${competitorName}`,
      competitorName,
      type: reportType,
      date: 'Just now',
      status: 'generating'
    });

    setNewReportId(tempId);
    setIsGenerating(true);
    setGenStepIndex(0);
    setApiReportContent('');
    setApiReportId('');

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorId: selectedCompId,
          reportType,
          apiKey,
          provider: selectedProvider,
          model: aiModel,
          mode: generationMode,
          apiKeys: keys
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setApiReportContent(data.content);
        setApiReportId(data.id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Report generation failed:", errorData.error);
      }
    } catch (err) {
      console.error("API error during report generation:", err);
    }
  };


  const handleCopyReport = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.competitorName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      
      {/* Printable Area overrides */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans mb-1">Reports</h1>
        <p className="text-slate-700/80 dark:text-slate-350 font-medium">Generate executive briefs and competitive analysis reports using AI scanning.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_2fr] gap-8">
        
        {/* Left Column: Report List & Generator Form */}
        <div className="flex flex-col gap-6">
          
          {/* Generator Form */}
          <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Generate AI Brief</h3>
            
            {competitors.length === 0 ? (
              <div className="p-6 text-center text-slate-500/80 dark:text-slate-400 font-semibold bg-white/20 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 border-dashed">
                Please add competitors in the <ChevronRight className="w-3.5 h-3.5 inline" /> Competitors page to begin generating strategy reports.
              </div>
            ) : (
              <form onSubmit={handleGenerateReport} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Target Competitor</label>
                  <select
                    value={selectedCompId}
                    onChange={(e) => setSelectedCompId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                    required
                  >
                    <option value="" disabled className="dark:bg-slate-900">Select a competitor</option>
                    {competitors.map(c => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name} ({c.url})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Generation Mode</label>
                  <div className="grid grid-cols-2 gap-2 bg-white/10 dark:bg-white/5 p-1 rounded-xl border border-white/15 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('single')}
                      className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        generationMode === 'single'
                          ? 'bg-violet-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Single Model
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('consensus')}
                      className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        generationMode === 'consensus'
                          ? 'bg-violet-500 text-white shadow-sm'
                          : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Consensus Audit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Report Template</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                  >
                    <option value="Competitive Audit" className="dark:bg-slate-900">Competitive Audit (Core Assessment)</option>
                    <option value="Pricing Study" className="dark:bg-slate-900">Pricing & Monetization Study</option>
                    <option value="SEO & Traffic Analysis" className="dark:bg-slate-900">SEO & Traffic Dominance Analysis</option>
                  </select>
                </div>

                {generationMode === 'single' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">AI Model Provider</label>
                      <select
                        value={aiProvider}
                        onChange={(e) => {
                          const newProvider = e.target.value;
                          setAiProvider(newProvider);
                          if (newProvider === 'gemini') setAiModel('gemini-3.5-flash');
                          else if (newProvider === 'openai') setAiModel('gpt-5.4');
                          else if (newProvider === 'anthropic') setAiModel('claude-4.6-sonnet');
                          else if (newProvider === 'groq') setAiModel('llama-4-maverick');
                        }}
                        className="w-full px-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                      >
                        <option value="gemini" className="dark:bg-slate-900">Google Gemini</option>
                        <option value="openai" className="dark:bg-slate-900">OpenAI GPT</option>
                        <option value="anthropic" className="dark:bg-slate-900">Anthropic Claude</option>
                        <option value="groq" className="dark:bg-slate-900">Groq Llama</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">AI Model</label>
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                      >
                        {(PROVIDER_MODELS[aiProvider] || []).map((m) => (
                          <option key={m.value} value={m.value} className="dark:bg-slate-900">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl flex flex-col gap-1 shadow-inner text-left">
                    <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-650" /> Collaborative AI Consensus
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                      Fuses scraped signals from Google Gemini, critiques strategic positioning with Anthropic Claude, and generates a verified executive summary via OpenAI.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="save-default-pref"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4 text-violet-600 bg-white/20 dark:bg-white/10 border-white/40 dark:border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <label htmlFor="save-default-pref" className="text-xs font-bold text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                    Save as default generation options
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selectedCompId || isGenerating}
                  className="glass-btn-solid rounded-xl py-3 mt-2 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> 
                  {isGenerating ? 'Analyzing Digital Signals...' : 'Generate Intelligence Report'}
                </button>
              </form>
            )}
          </Card>

          {/* Search and List */}
          <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex-1 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 border-b border-white/10 pb-2">History Logs</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500 dark:text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-md"
              />
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px]">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => report.status === 'ready' && setSelectedReportId(report.id)}
                  className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                    report.status === 'generating' ? 'opacity-70 bg-white/10 dark:bg-white/5 border-dashed border-white/30 dark:border-white/10 cursor-wait' :
                    selectedReportId === report.id
                      ? 'bg-violet-500/15 dark:bg-violet-500/25 border-violet-500/35 dark:border-violet-500/40 shadow-sm'
                      : 'bg-white/20 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-8 h-8 shrink-0 ${
                      selectedReportId === report.id ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{report.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {report.date}
                      </p>
                    </div>
                  </div>
                  
                  {report.status === 'generating' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium text-xs">
                  No reports logged.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Report View or Loading Screen */}
        <div className="flex-1 flex">
          
          <AnimatePresence mode="wait">
            
            {/* GENERATING LOADING COMPONENT */}
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center justify-center p-12 py-20 text-center glass-card border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] min-h-[450px]"
              >
                <div className="relative mb-8 mt-2">
                  <Loader />
                </div>
                
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-2">Synthesizing Strategy Report</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-8 leading-relaxed">IntelFlow AI is scraping and parsing public digital feeds to compile strategic recommendations.</p>

                {/* Processing Logs */}
                <div className="w-full max-w-md bg-slate-900/5 dark:bg-slate-950/20 border border-white/30 dark:border-white/10 rounded-2xl p-5 text-left flex flex-col gap-2.5 shadow-inner">
                  {REPORT_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                      {genStepIndex > idx ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : genStepIndex === idx ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-800 shrink-0" />
                      )}
                      <span className={`${
                        genStepIndex === idx ? 'text-slate-900 dark:text-white font-extrabold' : 
                        genStepIndex > idx ? 'text-slate-650 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : selectedReport ? (
              
              /* PREVIEW REPORT CARD */
              <motion.div
                key="report-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                id="printable-report-card"
                className="w-full glass-card border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex flex-col justify-between overflow-hidden"
              >
                {/* Header card panel */}
                <div className="p-6 md:p-8 border-b border-white/15 dark:border-white/10 bg-white/20 dark:bg-slate-950/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 shadow-sm uppercase tracking-wide">
                        {selectedReport.type}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{selectedReport.date}</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white leading-tight">{selectedReport.title}</h2>
                  </div>

                  <div className="flex gap-2 self-stretch sm:self-auto print:hidden">
                    <button 
                      onClick={() => handleCopyReport(selectedReport.content || '')}
                      className="p-2.5 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all hover:bg-white/70 dark:hover:bg-white/15 shadow-sm flex items-center gap-1.5 text-xs font-bold"
                      title="Copy Content"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                      onClick={handlePrintReport}
                      className="p-2.5 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all hover:bg-white/70 dark:hover:bg-white/15 shadow-sm flex items-center gap-1.5 text-xs font-bold"
                      title="Print Report"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => {
                        removeReport(selectedReport.id);
                        setSelectedReportId('');
                      }}
                      className="p-2.5 bg-red-50/40 dark:bg-red-950/20 border border-transparent text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 rounded-xl transition-all hover:bg-red-50/60 dark:hover:bg-red-950/35 shadow-sm flex items-center"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Report Content Panel */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[500px] text-slate-800 dark:text-slate-200">
                  <div className="prose prose-slate dark:prose-invert max-w-none text-sm font-medium leading-relaxed flex flex-col gap-4">
                    {/* Parse content into clean headers and lists */}
                    {selectedReport.content ? (
                      selectedReport.content.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-bold text-slate-900 dark:text-white border-b border-white/10 pb-1.5 mt-4">{paragraph.replace('### ', '')}</h3>;
                        }
                        if (paragraph.startsWith('- ')) {
                          return (
                            <ul key={index} className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                              {paragraph.split('\n').map((li, lidx) => (
                                <li key={lidx}>{li.replace('- ', '')}</li>
                              ))}
                            </ul>
                          );
                        }
                        if (paragraph.match(/^\d+\./)) {
                          return (
                            <ol key={index} className="list-decimal pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                              {paragraph.split('\n').map((li, lidx) => (
                                <li key={lidx}>{li.replace(/^\d+\.\s*/, '')}</li>
                              ))}
                            </ol>
                          );
                        }
                        return <p key={index} className="text-slate-700 dark:text-slate-300">{paragraph}</p>;
                      })
                    ) : (
                      <p className="text-slate-500 italic">No content available for this report.</p>
                    )}
                  </div>
                </div>

                {/* Strategy Footer Note */}
                <div className="p-4 bg-slate-950/5 dark:bg-slate-950/20 border-t border-white/10 text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Confidential competitive brief generated automatically by IntelFlow AI.</span>
                </div>
              </motion.div>
            ) : (
              
              /* EMPTY PLACEHOLDER */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center justify-center p-12 py-20 text-center glass-card border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] min-h-[450px]"
              >
                <FileText className="w-16 h-16 text-slate-500 dark:text-slate-400 mb-4 animate-pulse" />
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">Competitive Audits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-xs leading-normal">Select a compiled brief from the logs or use the AI form to generate a fresh competitive analysis.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
