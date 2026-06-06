import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Competitor = {
  id: string;
  name: string;
  url: string;
  activity: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'moderate' | 'critical';
  logo: string;
  country?: string;
};

export type Insight = {
  id: string;
  category: 'threat' | 'opportunity' | 'neutral';
  title: string;
  content: string;
  recommendation: string;
  time: string;
  competitorId: string;
};

export type Alert = {
  id: string;
  name: string;
  date: string;
  status: string;
  type: 'pending' | 'done';
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
};

export type Report = {
  id: string;
  title: string;
  competitorName: string;
  type: string;
  date: string;
  status: 'generating' | 'ready';
  content?: string;
  competitorId?: string;
};

export type Subscription = {
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  cycle: 'monthly' | 'yearly';
  trialDaysLeft: number;
  status: 'trial' | 'active' | 'expired';
  planSelected: boolean;
};

export type ApiKeys = {
  openai: string;
  anthropic: string;
  gemini: string;
  groq: string;
};

interface IntelFlowState {
  // General settings
  workspaceName: string;
  timezone: string;
  
  // Subscription settings
  subscription: Subscription;
  
  // Data entities
  competitors: Competitor[];
  insights: Insight[];
  alerts: Alert[];
  teamMembers: TeamMember[];
  reports: Report[];
  
  // Integrations state
  connectedSlack: boolean;
  slackChannel: string;
  connectedHubspot: boolean;
  
  // API Keys state
  apiKeys: ApiKeys;

  // Generation Preferences state
  defaultGenerationMode: 'single' | 'consensus';
  defaultProvider: string;
  defaultModel: string;
  
  // Actions
  addCompetitor: (name: string, url: string, country?: string) => Promise<void>;
  removeCompetitor: (id: string) => Promise<void>;
  addInsight: (insight: Omit<Insight, 'id'>) => void;
  markAlertReviewed: (id: string) => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  
  // Settings Actions
  updateWorkspaceSettings: (name: string, tz: string) => void;
  updateSubscription: (plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise', cycle: 'monthly' | 'yearly') => void;
  inviteTeamMember: (name: string, email: string, role: 'owner' | 'admin' | 'member' | 'viewer') => void;
  removeTeamMember: (id: string) => void;
  
  // Integration Actions
  connectSlack: (channel: string) => void;
  disconnectSlack: () => void;
  connectHubspot: () => void;
  disconnectHubspot: () => void;
  
  // API Key Actions
  saveApiKey: (provider: keyof ApiKeys, key: string) => void;
  saveGenerationPreferences: (mode: 'single' | 'consensus', provider: string, model: string) => void;
  
  // Report Actions
  addReport: (report: Omit<Report, 'id'>) => string;
  updateReportStatus: (id: string, status: 'generating' | 'ready', content?: string, dbId?: string) => void;
  removeReport: (id: string) => Promise<void>;
  
  // Dev Helper Actions
  fastForwardTrial: (days: number) => void;
}

export const useStore = create<IntelFlowState>()(
  persist(
    (set) => ({
      workspaceName: 'IntelFlow Pro',
      timezone: 'UTC',
      subscription: {
        plan: 'Free',
        cycle: 'monthly',
        trialDaysLeft: 0,
        status: 'active',
        planSelected: false,
      },
      competitors: [],
      insights: [],
      alerts: [],
      teamMembers: [],
      reports: [],
      connectedSlack: false,
      slackChannel: '#competitive-intel',
      connectedHubspot: false,
      apiKeys: {
        openai: '',
        anthropic: '',
        gemini: '',
        groq: '',
      },
      defaultGenerationMode: 'single',
      defaultProvider: 'gemini',
      defaultModel: 'gemini-1.5-flash',
      
      syncWithDatabase: async () => {
        try {
          const [compRes, reportRes, insightRes, alertRes] = await Promise.all([
            fetch("/api/competitors"),
            fetch("/api/reports"),
            fetch("/api/insights"),
            fetch("/api/alerts"),
          ]);

          if (compRes.ok && reportRes.ok && insightRes.ok && alertRes.ok) {
            const [competitors, reports, insights, alerts] = await Promise.all([
              compRes.json(),
              reportRes.json(),
              insightRes.json(),
              alertRes.json(),
            ]);

            set({ competitors, reports, insights, alerts });
          }
        } catch (err) {
          console.error("Failed to sync store with database:", err);
        }
      },

      addCompetitor: async (name, url, country) => {
        try {
          const res = await fetch("/api/competitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url, country }),
          });
          if (res.ok) {
            const newComp = await res.json();
            set((state) => ({ competitors: [newComp, ...state.competitors] }));
          }
        } catch (err) {
          console.error("Failed to add competitor:", err);
        }
      },

      removeCompetitor: async (id) => {
        try {
          const res = await fetch(`/api/competitors?id=${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            set((state) => {
              const comp = state.competitors.find(c => c.id === id);
              return {
                competitors: state.competitors.filter(c => c.id !== id),
                insights: state.insights.filter(i => i.competitorId !== id),
                reports: state.reports.filter(r => r.competitorId !== id),
                alerts: comp ? state.alerts.filter(a => a.name !== comp.name) : state.alerts,
              };
            });
          }
        } catch (err) {
          console.error("Failed to delete competitor:", err);
        }
      },

      addInsight: (insight) => set((state) => ({
        insights: [{ id: `i${Date.now()}`, ...insight }, ...state.insights]
      })),

      markAlertReviewed: async (id) => {
        try {
          const res = await fetch("/api/alerts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "Reviewed", type: "done" }),
          });
          if (res.ok) {
            set((state) => ({
              alerts: state.alerts.map(a => 
                a.id === id ? { ...a, status: 'Reviewed', type: 'done' } : a
              )
            }));
          }
        } catch (err) {
          console.error("Failed to mark alert reviewed:", err);
        }
      },
      
      updateWorkspaceSettings: (name, tz) => set(() => ({
        workspaceName: name,
        timezone: tz
      })),
      
      updateSubscription: (plan, cycle) => set((state) => ({
        subscription: {
          plan,
          cycle,
          trialDaysLeft: plan === 'Free' ? 0 : (plan === state.subscription.plan ? state.subscription.trialDaysLeft : 90),
          status: plan === 'Free' ? 'active' : (plan === state.subscription.plan ? state.subscription.status : 'trial'),
          planSelected: true,
        }
      })),
      
      inviteTeamMember: (name, email, role) => set((state) => ({
        teamMembers: [...state.teamMembers, { id: `m${Date.now()}`, name, email, role }]
      })),
      
      removeTeamMember: (id) => set((state) => ({
        teamMembers: state.teamMembers.filter(m => m.id !== id)
      })),
      
      connectSlack: (channel) => set(() => ({
        connectedSlack: true,
        slackChannel: channel
      })),
      
      disconnectSlack: () => set(() => ({
        connectedSlack: false
      })),
      
      connectHubspot: () => set(() => ({
        connectedHubspot: true
      })),
      
      disconnectHubspot: () => set(() => ({
        connectedHubspot: false
      })),
      
      saveApiKey: (provider, key) => set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [provider]: key
        }
      })),

      saveGenerationPreferences: (mode, provider, model) => set(() => ({
        defaultGenerationMode: mode,
        defaultProvider: provider,
        defaultModel: model,
      })),
      
      addReport: (report) => {
        const id = `r${Date.now()}`;
        set((state) => ({
          reports: [{ id, ...report }, ...state.reports]
        }));
        return id;
      },
      
      updateReportStatus: (id, status, content, dbId) => set((state) => ({
        reports: state.reports.map(r => 
          r.id === id ? { ...r, status, ...(content ? { content } : {}), ...(dbId ? { id: dbId } : {}) } : r
        )
      })),
      
      removeReport: async (id) => {
        try {
          const res = await fetch(`/api/reports?id=${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            set((state) => ({
              reports: state.reports.filter(r => r.id !== id)
            }));
          }
        } catch (err) {
          console.error("Failed to delete report:", err);
        }
      },
      
      fastForwardTrial: (days) => set((state) => {
        const newDays = Math.max(0, state.subscription.trialDaysLeft - days);
        return {
          subscription: {
            ...state.subscription,
            trialDaysLeft: newDays,
            status: newDays === 0 ? 'expired' : 'trial'
          }
        };
      })
    }),
    {
      name: 'intelflow-storage',
      partialize: (state) => ({
        workspaceName: state.workspaceName,
        timezone: state.timezone,
        subscription: state.subscription,
        connectedSlack: state.connectedSlack,
        slackChannel: state.slackChannel,
        connectedHubspot: state.connectedHubspot,
        apiKeys: state.apiKeys,
        defaultGenerationMode: state.defaultGenerationMode,
        defaultProvider: state.defaultProvider,
        defaultModel: state.defaultModel,
      }),
    }
  )
);

