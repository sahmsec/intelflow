import { create } from 'zustand';

export type Competitor = {
  id: string;
  name: string;
  url: string;
  activity: string;
  trend: string;
  risk: string;
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

interface IntelFlowState {
  competitors: Competitor[];
  insights: Insight[];
  alerts: Alert[];
  
  addCompetitor: (name: string, url: string) => void;
  removeCompetitor: (id: string) => void;
  addInsight: (insight: Omit<Insight, 'id'>) => void;
  markAlertReviewed: (id: string) => void;
}

export const useStore = create<IntelFlowState>()((set) => ({
  competitors: [
    { id: 'c1', name: 'Acme Corp', url: 'acme.com', activity: 'high', trend: 'up', risk: 'critical', logo: 'A' },
    { id: 'c2', name: 'Globex', url: 'globex.com', activity: 'medium', trend: 'stable', risk: 'moderate', logo: 'G' },
    { id: 'c3', name: 'Soylent', url: 'soylent.com', activity: 'low', trend: 'down', risk: 'low', logo: 'S' },
  ],
  insights: [
    {
      id: 'i1',
      category: 'threat',
      title: 'Acme Corp is targeting Enterprise',
      content: 'Acme Corp updated their pricing page today, introducing a new "Custom Enterprise" tier with SSO and Dedicated Account Management. This indicates a strategic shift upmarket.',
      recommendation: 'Review our Enterprise sales collateral and highlight our superior compliance certifications.',
      time: '2h ago',
      competitorId: 'c1'
    },
    {
      id: 'i2',
      category: 'opportunity',
      title: 'Globex scaling back marketing',
      content: 'Globex has reduced their active Google Ads spend by an estimated 40% over the last two weeks, and removed 3 marketing roles from their careers page.',
      recommendation: 'Increase bid caps on shared keywords. We have a 2-week window to capture their lost impression share.',
      time: '5h ago',
      competitorId: 'c2'
    }
  ],
  alerts: [
    { id: 'a1', name: 'Acme Corp', date: 'Just now', status: 'Pending', type: 'pending' },
    { id: 'a2', name: 'Globex Inc', date: '2h ago', status: 'Reviewed', type: 'done' },
    { id: 'a3', name: 'Soylent', date: '1d ago', status: 'Reviewed', type: 'done' },
  ],
  
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
  }))
}));
