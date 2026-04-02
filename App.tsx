import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabase';
import LoginScreen from './LoginScreen';
import { IncomeBreakdown } from './components/earned-income/IncomeBreakdown';
import { OpportunitiesPipeline } from './components/opportunities-pipeline/OpportunitiesPipeline';
import { ContactsBreakdown } from './components/contacts/ContactsBreakdown';
import { ActiveConversations } from './components/conversations/ActiveConversations';
import { WitheringBreakdown } from './components/withering/WitheringBreakdown';
import { BreakUpsBreakdown } from './components/break-ups/BreakUpsBreakdown';
import { DeadDealsBreakdown } from './components/dead-deals/DeadDealsBreakdown';
import { DatabaseBreakdown } from './components/db-health/DatabaseBreakdown';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';
import { SettingsButton } from './components/dashboard/SettingsButton';
import { LogoutButton } from './components/dashboard/LogoutButton';
import { UserManagementButton } from './components/dashboard/UserManagementButton';
import { NotificationsButton } from './components/dashboard/NotificationsButton';
import { FeedSection } from './components/dashboard/FeedSection';
import { AppsSection } from './components/dashboard/AppsSection';
import { AiCommandSection } from './components/dashboard/AiCommandSection';
import { AiCommandView } from './components/dashboard/AiCommandView';
import { QuickActionsSection } from './components/dashboard/QuickActionsSection';
import { NewContactModal } from './components/contacts/NewContactModal';
import { UserManagementView } from './components/user-management/UserManagementView';
import { NotificationsView } from './components/dashboard/NotificationsView';
import { AgyntSyncApp } from './components/apps/agyantsync/AgyntSyncApp';

interface AppContextType {
  userProfile: any | null;
  tenantId: string | null;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  userProfile: null,
  tenantId: null,
  refreshProfile: async () => {},
});

export const useApp = () => useContext(AppContext);

type AppView = 'main' | 'earned-income' | 'opportunities-pipeline' | 'contacts-breakdown' | 'active-conversations' | 'withering-leads' | 'breakups-breakdown' | 'deaddeals-analysis' | 'contact-database' | 'calendar-view' | 'settings' | 'user-management' | 'ai-command' | 'notifications' | 'agyantsync-app';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>('main');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, tenants(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setUserProfile(data);
        fetchNotificationCount(data.email);
      }
    } catch (err: any) {
      console.error("Profile handshake failed:", err);
      if (err.message?.includes('fetch')) {
        setBootError("Neural Link Failed: Network unreachable.");
      }
    }
  };

  const fetchNotificationCount = async (email: string) => {
    try {
      const { count } = await supabase
        .from('system_signals')
        .select('*', { count: 'exact', head: true })
        .eq('target_user_email', email);
      setNotificationCount(count || 0);
    } catch (err) {
      console.error("Signal count retrieval failed:", err);
    }
  };

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) await fetchProfile(session.user.id);
      } catch (err: any) {
        console.error("Auth initialization failed:", err);
        setBootError(err.message);
      } finally {
        setAuthLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setNotificationCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (bootError) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-sm font-black text-white uppercase tracking-tighter mb-1">Boot Failure</h2>
        <p className="text-slate-400 text-[10px] max-w-xs mb-6">{bootError}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
          Restart Node
        </button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Syncing...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  const displayName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : session.user.email;
  const tenantName = userProfile?.tenants?.name || 'Unbound Node';

  return (
    <AppContext.Provider value={{ 
      userProfile, 
      tenantId: userProfile?.tenant_id || null,
      refreshProfile: () => fetchProfile(session.user.id)
    }}>
      <div className="min-h-screen bg-slate-50 py-4 px-4 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto">
          {activeView === 'main' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-1 gap-3">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">AgyntOS Control</h1>
                  <p className="text-slate-400 font-bold uppercase text-[7px] tracking-[0.15em] flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                    {displayName} | {tenantName}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <NotificationsButton onClick={() => setActiveView('notifications')} count={notificationCount} />
                  <UserManagementButton onClick={() => setActiveView('user-management')} />
                  <SettingsButton onClick={() => setActiveView('settings')} />
                  <div className="h-5 w-px bg-slate-100 mx-0.5"></div>
                  <LogoutButton />
                </div>
              </header>

              <AiCommandSection onOpen={() => setActiveView('ai-command')} />
              <QuickActionsSection onAddContact={() => setIsAddContactOpen(true)} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-8 space-y-3">
                  <FeedSection onViewChange={setActiveView} />
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <AppsSection onViewChange={setActiveView} />
                </div>
              </div>
            </div>
          )}

          {isAddContactOpen && <NewContactModal onClose={() => setIsAddContactOpen(false)} />}
          {activeView === 'earned-income' && <IncomeBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'opportunities-pipeline' && <OpportunitiesPipeline onClose={() => setActiveView('main')} />}
          {activeView === 'contacts-breakdown' && <ContactsBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'active-conversations' && <ActiveConversations onClose={() => setActiveView('main')} />}
          {activeView === 'withering-leads' && <WitheringBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'breakups-breakdown' && <BreakUpsBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'deaddeals-analysis' && <DeadDealsBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'contact-database' && <DatabaseBreakdown onClose={() => setActiveView('main')} />}
          {activeView === 'calendar-view' && <CalendarView onClose={() => setActiveView('main')} />}
          {activeView === 'settings' && <SettingsView onClose={() => setActiveView('main')} />}
          {activeView === 'user-management' && <UserManagementView onClose={() => setActiveView('main')} />}
          {activeView === 'ai-command' && <AiCommandView onClose={() => setActiveView('main')} />}
          {activeView === 'notifications' && <NotificationsView onClose={() => setActiveView('main')} />}
          {activeView === 'agyantsync-app' && <AgyntSyncApp onClose={() => setActiveView('main')} />}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;