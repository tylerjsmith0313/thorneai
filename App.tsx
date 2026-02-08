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

export default App;
