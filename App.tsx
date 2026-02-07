
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
console.log('[v0] App.tsx reloading - components should be found');
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

type AppView = 'main' | 'earned-income' | 'opportunities-pipeline' | 'contacts-breakdown' | 'active-conversations' | 'withering-leads' | 'breakups-breakdown' | 'deaddeals-analysis' | 'contact-database' | 'calendar-view' | 'settings' | 'user-management' | 'ai-command' | 'notifications' | 'agyantsync-app';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<AppView>('main');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        fetchInitialSignalCount(session.user.email);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchInitialSignalCount(session.user.email);
        fetchProfile(session.user.id);
      } else {
        setDisplayName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', id)
      .maybeSingle();
    
    if (data && data.first_name) {
      setDisplayName(`${data.first_name} ${data.last_name}`);
    }
  };

  const fetchInitialSignalCount = async (email: string) => {
    const { count } = await supabase
      .from('system_signals')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_email', email);
    setNotificationCount(count || 0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Initializing Neural OS...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto">
        {activeView === 'main' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 px-2 gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Agynt Dashboard</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                  Node: {displayName || session.user.email} | Secure Uplink Active
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
                <NotificationsButton onClick={() => setActiveView('notifications')} count={notificationCount} />
                <UserManagementButton onClick={() => setActiveView('user-management')} />
                <SettingsButton onClick={() => setActiveView('settings')} />
                <div className="h-8 w-px bg-slate-100 mx-1"></div>
                <LogoutButton />
              </div>
            </header>

            <AiCommandSection onOpen={() => setActiveView('ai-command')} />
            <QuickActionsSection onAddContact={() => setIsAddContactOpen(true)} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-8">
                <FeedSection onViewChange={setActiveView} />
              </div>
              <div className="lg:col-span-4 space-y-8">
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
  );
};

export default App;
