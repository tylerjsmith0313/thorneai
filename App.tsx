
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginScreen from './LoginScreen';

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
      .from('users')
      .select('first_name, last_name')
      .eq('id', id)
      .maybeSingle();
    
    if (data && data.first_name) {
      setDisplayName(`${data.first_name} ${data.last_name}`);
    }
  };

  const fetchInitialSignalCount = async (email: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setNotificationCount(count || 0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-semibold">Initializing node...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">AGYNTOS CORE</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
              Node: {displayName || session.user.email} | Secure Uplink Active
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer">
            <h3 className="font-bold text-slate-900 mb-2">Contacts</h3>
            <p className="text-slate-600 text-sm">Manage your contacts</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer">
            <h3 className="font-bold text-slate-900 mb-2">Opportunities</h3>
            <p className="text-slate-600 text-sm">Track your pipeline</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer">
            <h3 className="font-bold text-slate-900 mb-2">Activities</h3>
            <p className="text-slate-600 text-sm">View your activities</p>
          </div>
        </div>
      </main>
    </div>
  );
};
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
