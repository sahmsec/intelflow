"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { authClient } from '@/lib/auth-client';
import { 
  Key, Save, CheckCircle2, AlertCircle, Trash2, Plus, 
  Users, CreditCard, Layers, Globe, Mail, ShieldAlert,
  Calendar, Check, RefreshCw, LogOut
} from 'lucide-react';

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-5.5', 'gpt-5.4', 'gpt-4o', 'gpt-4o-mini', 'o4-mini'], icon: 'O' },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-4.8-opus', 'claude-4.6-sonnet', 'claude-3-5-sonnet'], icon: 'A' },
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-3.1-pro', 'gemini-3.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'], icon: 'G' },
  { id: 'groq', name: 'Groq', models: ['llama-4-maverick', 'llama-3.1-70b', 'mixtral-8x7b'], icon: 'Q' },
] as const;

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { 
    workspaceName, 
    timezone, 
    subscription, 
    teamMembers, 
    reports, 
    connectedSlack, 
    slackChannel, 
    connectedHubspot, 
    apiKeys,
    defaultGenerationMode,
    defaultProvider,
    defaultModel,
    updateWorkspaceSettings,
    updateSubscription,
    inviteTeamMember,
    removeTeamMember,
    connectSlack,
    disconnectSlack,
    connectHubspot,
    disconnectHubspot,
    saveApiKey,
    saveGenerationPreferences,
    fastForwardTrial
  } = useStore();

  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingUpgrade, setLoadingUpgrade] = useState<string | null>(null);

  // Profile States
  const [profName, setProfName] = useState(user?.name || '');
  const [profEmail, setProfEmail] = useState(user?.email || '');
  const [profSaved, setProfSaved] = useState(false);
  const [profError, setProfError] = useState('');
  const [profLoading, setProfLoading] = useState(false);

  // Password Reset States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Logout Confirmation States
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Sync active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync profile details when user loads
  useEffect(() => {
    if (user) {
      setProfName(user.name);
      setProfEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfError('');
    setProfSaved(false);
    setProfLoading(true);

    try {
      const { error: err } = await authClient.updateUser({
        name: profName,
      });

      if (err) {
        setProfError(err.message || "Failed to update profile details");
      } else {
        setProfSaved(true);
        setTimeout(() => setProfSaved(false), 2000);
      }
    } catch (err: any) {
      setProfError(err?.message || "An unexpected error occurred");
    } finally {
      setProfLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSaved(false);
    setPassLoading(true);

    try {
      const { error: err } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (err) {
        setPassError(err.message || "Failed to update password");
      } else {
        setPassSaved(true);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPassSaved(false), 3000);
      }
    } catch (err: any) {
      setPassError(err?.message || "An unexpected error occurred");
    } finally {
      setPassLoading(false);
    }
  };

  useEffect(() => {
    const syncWorkspace = async () => {
      try {
        const res = await fetch('/api/workspace');
        if (res.ok) {
          const ws = await res.json();
          updateWorkspaceSettings(ws.name, timezone);
          
          let trialDaysLeft = 90;
          if (ws.stripeCurrentPeriodEnd) {
            const diffTime = new Date(ws.stripeCurrentPeriodEnd).getTime() - Date.now();
            trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          useStore.setState({
            workspaceName: ws.name,
            subscription: {
              plan: ws.plan,
              cycle: ws.stripePriceId?.includes('yr') || ws.stripePriceId?.includes('yearly') ? 'yearly' : 'monthly',
              trialDaysLeft,
              status: ws.status,
              planSelected: ws.planSelected,
            }
          });
        }
      } catch (err) {
        console.error("Failed to sync workspace details with database:", err);
      }
    };
    syncWorkspace();
  }, []);

  const handlePlanUpgrade = async (planName: string) => {
    setLoadingUpgrade(planName);
    try {
      const isFree = planName === 'Free';
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isFree 
            ? { action: 'cancel' } 
            : { plan: planName, cycle: subscription.cycle }
        ),
      });
      const data = await res.json();
      if (isFree) {
        if (data.success) {
          updateSubscription('Free', 'monthly');
          window.location.reload();
        } else {
          alert("Failed to cancel subscription");
        }
        setLoadingUpgrade(null);
      } else {
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Failed to initiate checkout");
          setLoadingUpgrade(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error starting checkout session");
      setLoadingUpgrade(null);
    }
  };
  
  // General State
  const [wName, setWName] = useState(workspaceName);
  const [tZone, setTZone] = useState(timezone);
  const [generalSaved, setGeneralSaved] = useState(false);

  // Team Invite State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member' | 'viewer'>('member');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // API Provider Keys state
  const [savedKey, setSavedKey] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({
    openai: apiKeys.openai || '',
    anthropic: apiKeys.anthropic || '',
    gemini: apiKeys.gemini || '',
    groq: apiKeys.groq || '',
  });

  // Report Preference States
  const [prefMode, setPrefMode] = useState<'single' | 'consensus'>(defaultGenerationMode);
  const [prefProvider, setPrefProvider] = useState<string>(defaultProvider);
  const [prefModel, setPrefModel] = useState<string>(defaultModel);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    setPrefMode(defaultGenerationMode);
    setPrefProvider(defaultProvider);
    setPrefModel(defaultModel);
  }, [defaultGenerationMode, defaultProvider, defaultModel]);

  const handlePrefProviderChange = (providerId: string) => {
    setPrefProvider(providerId);
    const p = AI_PROVIDERS.find(p => p.id === providerId);
    if (p && p.models.length > 0) {
      setPrefModel(p.models[0]);
    }
  };

  const handleSavePreferences = () => {
    saveGenerationPreferences(prefMode, prefProvider, prefModel);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  };

  // Slack state
  const [slackChan, setSlackChan] = useState(slackChannel);

  const handleSaveGeneral = async () => {
    updateWorkspaceSettings(wName, tZone);
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2000);

    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: wName }),
      });
    } catch (err) {
      console.error("Failed to save workspace general settings to database:", err);
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess(false);

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Please fill out all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    inviteTeamMember(inviteName, inviteEmail, inviteRole);
    setInviteName('');
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleSaveKey = (provider: typeof AI_PROVIDERS[number]['id']) => {
    saveApiKey(provider, localKeys[provider]);
    setSavedKey({ ...savedKey, [provider]: true });
    setTimeout(() => setSavedKey((s) => ({ ...s, [provider]: false })), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans mb-1">Settings</h1>
        <p className="text-slate-700/80 dark:text-slate-350 font-medium">Manage your workspace preferences, team, integrations, and subscriptions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Nav */}
        <div className="w-full md:w-64 flex flex-col gap-1.5 shrink-0">
          {[
            { id: 'profile', label: 'My Profile' },
            { id: 'general', label: 'General Workspace' },
            { id: 'ai-providers', label: 'AI Providers' },
            { id: 'team', label: 'Team Members' },
            { id: 'integrations', label: 'Integrations' },
            { id: 'billing', label: 'Billing & Usage' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm rounded-xl text-left transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/70 text-slate-800 border border-white/80 shadow-[0_8px_20px_rgba(31,38,135,0.04)] backdrop-blur-md font-bold dark:bg-slate-800/40 dark:text-slate-100 dark:border-white/10 dark:shadow-none' 
                  : 'text-slate-755/90 dark:text-slate-400 hover:bg-white/40 hover:text-slate-950 dark:hover:bg-slate-800/20 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">My Profile</h2>
                <p className="text-sm text-slate-650 dark:text-slate-350 font-semibold">Manage your personal profile information and security settings.</p>
              </div>

              {/* Profile details */}
              <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                  {profError && (
                    <div className="p-3 text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl">
                      {profError}
                    </div>
                  )}
                  {profSaved && (
                    <div className="p-3 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-xl">
                      Profile updated successfully!
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md border border-white/20 dark:border-white/10 overflow-hidden shrink-0">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{user?.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{user?.email}</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowSignOutModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-sm"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={profEmail}
                        className="w-full px-4 py-2.5 bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/35 dark:bg-white/[0.04] border border-white/60 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-sm">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path
                          fill="#EA4335"
                          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.27 2.705 1.34 6.66l3.926 3.105z"
                         />
                        <path
                          fill="#4285F4"
                          d="M24 12.273c0-.818-.073-1.609-.209-2.373H12v4.51h6.727a5.753 5.753 0 0 1-2.49 3.773l3.605 3.59c2.109-1.945 3.327-4.8 3.327-8.155z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.955-1.073 7.945-2.91l-3.605-3.59c-.99.664-2.264 1.064-3.79 1.064-2.91 0-5.382-1.964-6.264-4.609L1.33 17.027A11.995 11.995 0 0 0 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.736 13.955a7.16 7.16 0 0 1 0-4.364L1.33 6.486A11.967 11.967 0 0 0 0 12c0 1.94.464 3.782 1.282 5.418l4.454-3.463z"
                        />
                      </svg>
                      <span>Google Authenticated Session</span>
                    </div>

                    <button
                      type="submit"
                      disabled={profLoading}
                      className="glass-btn-solid rounded-xl px-5 py-2.5 font-bold text-xs border border-white/10 cursor-pointer disabled:opacity-50"
                    >
                      {profLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                 </form>
               </Card>

               {/* Password update form */}
               <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                 <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-white/10 pb-2">Change Password</h3>
                 <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                   {passError && (
                     <div className="p-3 text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl">
                       {passError}
                     </div>
                   )}
                   {passSaved && (
                     <div className="p-3 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-xl">
                       Password updated successfully!
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Current Password</label>
                       <input
                         type="password"
                         required
                         placeholder="••••••••"
                         value={currentPassword}
                         onChange={(e) => setCurrentPassword(e.target.value)}
                         className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500"
                       />
                     </div>

                     <div>
                       <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">New Password</label>
                       <input
                         type="password"
                         required
                         placeholder="••••••••"
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500"
                       />
                     </div>
                   </div>

                   <div className="flex justify-end pt-2">
                     <button
                       type="submit"
                       disabled={passLoading}
                       className="glass-btn-solid rounded-xl px-5 py-2.5 font-bold text-xs border border-white/10 cursor-pointer disabled:opacity-50"
                     >
                       {passLoading ? "Updating..." : "Update Password"}
                     </button>
                   </div>
                 </form>
               </Card>

                {/* Danger Zone / Log Out */}
                 <Card className="glass-card p-6 border border-red-500/15 dark:border-red-500/5 bg-red-500/[0.02] dark:bg-red-500/[0.01] shadow-[0_15px_35px_-5px_rgba(239,68,68,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                   <div>
                     <h3 className="font-bold text-sm text-red-650 dark:text-red-400 uppercase tracking-wider mb-1">Danger Zone</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Sign out of your active session. You will need to authenticate again to access your workspace.</p>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                     <button
                       type="button"
                       onClick={() => setShowSignOutModal(true)}
                       className="px-5 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer"
                     >
                       Sign Out
                     </button>
                   </div>
                 </Card>
              </motion.div>
            )}

           {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">General Workspace</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Update your company name and localize your schedule settings.</p>
              </div>

              <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex flex-col gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-2 block">Workspace Name</label>
                  <input
                    type="text"
                    value={wName}
                    onChange={(e) => setWName(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500 backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-2 block">Timezone</label>
                  <select
                    value={tZone}
                    onChange={(e) => setTZone(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                  >
                    <option value="UTC">UTC (Greenwich Mean Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Dhaka">Dhaka (BST)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-2">
                  <button
                    onClick={handleSaveGeneral}
                    className="glass-btn-solid rounded-xl px-5 py-2.5 font-bold text-xs border border-white/10 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Workspace Settings
                  </button>
                  <AnimatePresence>
                    {generalSaved && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0 }}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Changes Saved!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )}

          {/* AI PROVIDERS TAB */}
          {activeTab === 'ai-providers' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">AI Providers</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Bring your own API keys to run intelligence reports. Keys are encrypted at rest.</p>
              </div>

              <div className="flex flex-col gap-4">
                {AI_PROVIDERS.map((provider) => (
                  <Card key={provider.id} className="glass-card p-5 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-4 w-48 shrink-0">
                      <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-extrabold border border-white/10 shadow-sm dark:bg-indigo-600">
                        {provider.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-850 dark:text-white">{provider.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{provider.models[0]}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                        <input
                          type="password"
                          placeholder="Paste API Key starting with sk-..."
                          value={localKeys[provider.id]}
                          onChange={(e) => setLocalKeys({ ...localKeys, [provider.id]: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-md"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold shadow-sm ${
                          apiKeys[provider.id]
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/15 dark:border-emerald-500/30'
                            : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/15 dark:border-amber-500/30'
                        }`}>
                          {apiKeys[provider.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{apiKeys[provider.id] ? 'Connected' : 'Not connected'}</span>
                        </div>
                        <button 
                          onClick={() => handleSaveKey(provider.id)}
                          disabled={!localKeys[provider.id]}
                          className={`rounded-xl px-5 py-2 font-bold text-xs border border-white/15 transition-all shadow-sm ${
                            savedKey[provider.id] 
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border-emerald-500/20 dark:border-emerald-500/30' 
                              : 'glass-btn-solid disabled:opacity-50 disabled:pointer-events-none'
                          }`}
                        >
                          {savedKey[provider.id] ? (
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

              {/* REPORT PREFERENCES */}
              <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] mt-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Report Preferences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure global defaults for newly compiled strategic reports.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Default Generation Mode</label>
                    <select
                      value={prefMode}
                      onChange={(e) => setPrefMode(e.target.value as 'single' | 'consensus')}
                      className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                    >
                      <option value="single" className="dark:bg-slate-900">Single Model (Fast)</option>
                      <option value="consensus" className="dark:bg-slate-900">Multi-Agent Consensus (Deep)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Default AI Provider</label>
                    <select
                      value={prefProvider}
                      onChange={(e) => handlePrefProviderChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                    >
                      {AI_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Default Target Model</label>
                    <select
                      value={prefModel}
                      onChange={(e) => setPrefModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                    >
                      {(AI_PROVIDERS.find(p => p.id === prefProvider)?.models || []).map((m) => (
                        <option key={m} value={m} className="dark:bg-slate-900">{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end border-t border-white/10 pt-4 mt-2">
                  <button
                    onClick={handleSavePreferences}
                    className={`rounded-xl px-6 py-2.5 font-bold text-xs border border-white/15 transition-all shadow-sm flex items-center gap-1.5 ${
                      prefSaved
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border-emerald-500/20 dark:border-emerald-500/30'
                        : 'glass-btn-solid'
                    }`}
                  >
                    {prefSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Defaults Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Default Preferences
                      </>
                    )}
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TEAM MEMBERS TAB */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">Team Members</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Collaborate on competitor strategy feeds with team workspace invitations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
                {/* Member List */}
                <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)] flex flex-col gap-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 border-b border-white/10 pb-2">Tracked Users</h3>
                  
                  <div className="flex flex-col gap-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3.5 bg-white/20 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-600/10 dark:bg-violet-600/20 border border-violet-500/20 dark:border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-sm uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shadow-sm ${
                            member.role === 'owner' ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/15 dark:border-indigo-500/30' :
                            member.role === 'admin' ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 border border-violet-500/15 dark:border-violet-500/30' :
                            member.role === 'member' ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/15 dark:border-blue-500/30' :
                            'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/15 dark:border-slate-500/30'
                          }`}>
                            {member.role}
                          </span>
                          
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="p-1.5 hover:bg-red-50/50 hover:text-red-600 rounded-lg text-slate-500 transition-colors"
                              title="Revoke access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Invite Form */}
                <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Invite Collaborator</h3>
                  
                  <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Smith"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full px-4.5 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500 backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="john.smith@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-4.5 py-2.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white placeholder-slate-500 backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Workspace Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as any)}
                        className="w-full px-4.5 py-2.5 bg-white/25 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-white backdrop-blur-md"
                      >
                        <option value="admin">Administrator (Full Access)</option>
                        <option value="member">Strategy Member (Write Access)</option>
                        <option value="viewer">Executive Viewer (Read Only)</option>
                      </select>
                    </div>

                    {inviteError && (
                      <div className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 border border-red-500/15 dark:border-red-500/30 p-2.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{inviteError}</span>
                      </div>
                    )}

                    {inviteSuccess && (
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/15 dark:border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Invitation successfully delivered!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="glass-btn-solid rounded-xl py-3 mt-2 font-bold text-xs border border-white/10 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Send Invitation
                    </button>
                  </form>
                </Card>
              </div>
            </motion.div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">Workspace Integrations</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Sync competitive notifications directly to external workspace communication channels.</p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Slack Integration */}
                <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#E01E5A] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                        <div className="grid grid-cols-2 gap-1 w-6 h-6">
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-850 dark:text-white">Slack Notifications</h3>
                          {connectedSlack && (
                            <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Connected</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 max-w-md leading-relaxed">
                          Deliver AI threat assessment warnings and hourly alert snippets to specific workspace channels.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => connectedSlack ? disconnectSlack() : connectSlack(slackChan)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all shrink-0 shadow-sm ${
                        connectedSlack 
                          ? 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 border-red-500/20 dark:border-red-500/30' 
                          : 'glass-btn-solid border-white/10 dark:border-white/20'
                      }`}
                    >
                      {connectedSlack ? 'Disconnect Slack' : 'Connect Workspace'}
                    </button>
                  </div>

                  {connectedSlack && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-white/10 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="w-full sm:w-auto flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Notification Channel:</span>
                        <input
                          type="text"
                          value={slackChan}
                          onChange={(e) => setSlackChan(e.target.value)}
                          className="px-3 py-1.5 bg-white/20 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <button 
                        onClick={() => connectSlack(slackChan)}
                        className="glass-btn-solid rounded-lg px-4 py-1.5 font-bold text-xs border border-white/10 shadow-sm"
                      >
                        Update Channel
                      </button>
                    </motion.div>
                  )}
                </Card>

                {/* HubSpot Integration */}
                <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#FF7A59] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-850 dark:text-white">HubSpot Competitor Overlaps</h3>
                          {connectedHubspot && (
                            <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Connected</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 max-w-md leading-relaxed">
                          Link real-time pricing alerts directly to open CRM deals, generating client-facing battlecards.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => connectedHubspot ? disconnectHubspot() : connectHubspot()}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all shrink-0 shadow-sm ${
                        connectedHubspot 
                          ? 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 border-red-500/20 dark:border-red-500/30' 
                          : 'glass-btn-solid border-white/10 dark:border-white/20'
                      }`}
                    >
                      {connectedHubspot ? 'Disconnect CRM' : 'Connect Hubspot'}
                    </button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              {/* Expired alert */}
              {subscription.plan !== 'Free' && subscription.trialDaysLeft === 0 && (
                <div className="p-4 bg-red-500/15 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/25 rounded-2xl flex items-start gap-3 shadow-md">
                  <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-red-800 dark:text-red-400">Your 3-Month Free Trial Has Expired!</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">Please upgrade your subscription or input payment information below to unlock dashboard features.</p>
                  </div>
                </div>
              )}

              {/* Sub Details */}
              <div className="grid grid-cols-1 md:grid-cols-[3.5fr_2.5fr] gap-6">
                
                    <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Subscription Info</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Current Tier:</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-500/30 px-3 py-1 rounded-full">{subscription.plan} Plan</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Billing Cycle:</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 capitalize">{subscription.cycle} billing</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Trial Progress:</span>
                      <span className="text-xs font-extrabold text-violet-755 dark:text-violet-300">{subscription.trialDaysLeft} days left of 90</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 dark:bg-white/5 rounded-full h-3.5 border border-white/50 dark:border-white/10 overflow-hidden relative shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500"
                        style={{ width: `${(subscription.trialDaysLeft / 90) * 100}%` }}
                      />
                    </div>

                    <div className="p-3.5 bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 dark:border-violet-500/30 rounded-2xl mt-2 flex items-start gap-2.5">
                      <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase">SaaS Free Trial Period</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-350 font-semibold mt-0.5 leading-normal">
                          First 3 months are 100% free. You have been charged **$0.00** so far.
                          {subscription.trialDaysLeft > 0 && ` Next billing date: in ${subscription.trialDaysLeft} days for $${subscription.plan === 'Starter' ? '29' : subscription.plan === 'Professional' ? '79' : '199'}.00.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Dev Sandbox controls */}
                <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Dev Sandbox Helpers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-normal">Fast-forward trial counters to test dynamic system expirations and alerts.</p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => fastForwardTrial(30)}
                      className="glass-btn-transparent text-left rounded-xl px-4 py-2.5 font-bold text-xs border border-white/70 dark:border-white/10 flex items-center justify-between"
                    >
                      <span>Fast-Forward 30 Days</span>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => fastForwardTrial(60)}
                      className="glass-btn-transparent text-left rounded-xl px-4 py-2.5 font-bold text-xs border border-white/70 dark:border-white/10 flex items-center justify-between"
                    >
                      <span>Fast-Forward 60 Days</span>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => updateSubscription(subscription.plan, subscription.cycle)}
                      className="glass-btn-solid text-left rounded-xl px-4 py-2.5 font-bold text-xs border border-white/10 dark:border-white/20 flex items-center justify-between text-white"
                    >
                      <span>Reset Trial to 90 Days</span>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </Card>
              </div>

              {/* Modify Plan Tiers */}
              <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 border-b border-white/10 pb-2">Modify Workspace Tier</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Free Box */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    subscription.plan === 'Free'
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 dark:border-violet-500/50 shadow-md ring-2 ring-violet-500/20'
                      : 'bg-white/20 dark:bg-slate-950/20 border-white/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-slate-950/35'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Free Plan</h4>
                        {subscription.plan === 'Free' && <Check className="w-4 h-4 text-violet-650" />}
                      </div>
                      <span className="text-lg font-black text-slate-850 dark:text-slate-200">$0/mo</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">1 Tracked Competitor. Daily summaries.</p>
                    </div>
                    {subscription.plan !== 'Free' && (
                      <button
                        onClick={() => handlePlanUpgrade('Free')}
                        disabled={loadingUpgrade !== null}
                        className="glass-btn-solid w-full py-2 mt-4 text-[10px] font-bold rounded-lg border border-white/10 cursor-pointer disabled:opacity-50"
                      >
                        {loadingUpgrade === 'Free' ? 'Loading...' : 'Downgrade to Free'}
                      </button>
                    )}
                  </div>

                  {/* Starter Box */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    subscription.plan === 'Starter'
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 dark:border-violet-500/50 shadow-md ring-2 ring-violet-500/20'
                      : 'bg-white/20 dark:bg-slate-950/20 border-white/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-slate-950/35'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Starter Plan</h4>
                        {subscription.plan === 'Starter' && <Check className="w-4 h-4 text-violet-650" />}
                      </div>
                      <span className="text-lg font-black text-slate-850 dark:text-slate-200">$29/mo</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">5 Tracked Competitors. Daily summaries.</p>
                    </div>
                    {subscription.plan !== 'Starter' && (
                      <button
                        onClick={() => handlePlanUpgrade('Starter')}
                        disabled={loadingUpgrade !== null}
                        className="glass-btn-solid w-full py-2 mt-4 text-[10px] font-bold rounded-lg border border-white/10 cursor-pointer disabled:opacity-50"
                      >
                        {loadingUpgrade === 'Starter' ? 'Loading...' : (subscription.plan === 'Free' ? 'Upgrade Tier' : 'Downgrade Tier')}
                      </button>
                    )}
                  </div>

                  {/* Professional Box */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    subscription.plan === 'Professional'
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 dark:border-violet-500/50 shadow-md ring-2 ring-violet-500/20'
                      : 'bg-white/20 dark:bg-slate-950/20 border-white/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-slate-950/35'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Professional Plan</h4>
                        {subscription.plan === 'Professional' && <Check className="w-4 h-4 text-violet-650" />}
                      </div>
                      <span className="text-lg font-black text-slate-850 dark:text-slate-200">$79/mo</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">15 Tracked Competitors. AI insights feed.</p>
                    </div>
                    {subscription.plan !== 'Professional' && (
                      <button
                        onClick={() => handlePlanUpgrade('Professional')}
                        disabled={loadingUpgrade !== null}
                        className="glass-btn-solid w-full py-2 mt-4 text-[10px] font-bold rounded-lg border border-white/10 cursor-pointer disabled:opacity-50"
                      >
                        {loadingUpgrade === 'Professional' ? 'Loading...' : (['Starter', 'Free'].includes(subscription.plan) ? 'Upgrade Tier' : 'Downgrade Tier')}
                      </button>
                    )}
                  </div>

                  {/* Enterprise Box */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    subscription.plan === 'Enterprise'
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 dark:border-violet-500/50 shadow-md ring-2 ring-violet-500/20'
                      : 'bg-white/20 dark:bg-slate-950/20 border-white/50 dark:border-white/5 hover:bg-white/30 dark:hover:bg-slate-950/35'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Enterprise Plan</h4>
                        {subscription.plan === 'Enterprise' && <Check className="w-4 h-4 text-violet-650" />}
                      </div>
                      <span className="text-lg font-black text-slate-850 dark:text-slate-200">$199/mo</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2">Unlimited Competitors. Custom alerts feeds.</p>
                    </div>
                    {subscription.plan !== 'Enterprise' && (
                      <button
                        onClick={() => handlePlanUpgrade('Enterprise')}
                        disabled={loadingUpgrade !== null}
                        className="glass-btn-solid w-full py-2 mt-4 text-[10px] font-bold rounded-lg border border-white/10 cursor-pointer disabled:opacity-50"
                      >
                        {loadingUpgrade === 'Enterprise' ? 'Loading...' : 'Upgrade Tier'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Invoice List */}
              <Card className="glass-card p-6 border-none shadow-[0_15px_35px_-5px_rgba(30,41,59,0.02)]">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Billing History</h3>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/10 dark:border-white/10 last:border-none">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Q2 Sandbox Trial Activation</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Invoice #IF-2026-928 • Jun 5, 2026</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">$0.00</span>
                      <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Paid</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-white/10 dark:border-white/10 last:border-none">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Workspace Signup Setup</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Invoice #IF-2026-001 • Jun 5, 2026</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">$0.00</span>
                      <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Paid</span>
                    </div>
                  </div>
                </div>
              </Card>

            </motion.div>
          )}

        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md glass-card p-6 text-slate-800 dark:text-slate-100 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-650 dark:text-red-400 mb-4 shadow-sm">
                  <LogOut size={22} className="ml-0.5" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">Confirm Sign Out</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-6 leading-relaxed">
                  Are you sure you want to sign out? You will need to authenticate again to access your workspace.
                </p>
                
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setShowSignOutModal(false)}
                    className="flex-1 py-3 bg-white/20 border border-white/50 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold hover:bg-white/30 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowSignOutModal(false);
                      await signOut();
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-750 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
