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
  
  // Actions
  addCompetitor: (name: string, url: string) => void;
  removeCompetitor: (id: string) => void;
  addInsight: (insight: Omit<Insight, 'id'>) => void;
  markAlertReviewed: (id: string) => void;
  
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
  
  // Report Actions
  addReport: (report: Omit<Report, 'id'>) => string;
  updateReportStatus: (id: string, status: 'generating' | 'ready', content?: string) => void;
  removeReport: (id: string) => void;
  
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
      
      addCompetitor: (name, url) => set((state) => {
        const newCompetitor: Competitor = {
          id: `c${Date.now()}`,
          name,
          url,
          activity: 'low',
          trend: 'stable',
          risk: 'low',
          logo: name.charAt(0).toUpperCase(),
        };
        return { competitors: [...state.competitors, newCompetitor] };
      }),

      removeCompetitor: (id) => set((state) => {
        const comp = state.competitors.find(c => c.id === id);
        return {
          competitors: state.competitors.filter(c => c.id !== id),
          insights: state.insights.filter(i => i.competitorId !== id),
          alerts: comp ? state.alerts.filter(a => a.name !== comp.name) : state.alerts,
        };
      }),

      addInsight: (insight) => set((state) => ({
        insights: [{ id: `i${Date.now()}`, ...insight }, ...state.insights]
      })),

      markAlertReviewed: (id) => set((state) => ({
        alerts: state.alerts.map(a => 
          a.id === id ? { ...a, status: 'Reviewed', type: 'done' } : a
        )
      })),
      
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
      
      addReport: (report) => {
        const id = `r${Date.now()}`;
        set((state) => ({
          reports: [{ id, ...report }, ...state.reports]
        }));
        return id;
      },
      
      updateReportStatus: (id, status, content) => set((state) => ({
        reports: state.reports.map(r => 
          r.id === id ? { ...r, status, ...(content ? { content } : {}) } : r
        )
      })),
      
      removeReport: (id) => set((state) => ({
        reports: state.reports.filter(r => r.id !== id)
      })),
      
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
    }
  )
);
