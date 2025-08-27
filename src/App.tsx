import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudyTracker from './components/StudyTracker';
import FinanceManager from './components/FinanceManager';
import AccountManager from './components/AccountManager';
import Login from './components/Login';
import { initializeNotifications } from './utils/notifications';
import { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

type Page = 'dashboard' | 'studies' | 'finances' | 'accounts';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Inicializar notificações se usuário logado
      if (session?.user) {
        initializeNotifications();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Inicializar notificações quando usuário faz login
      if (session?.user) {
        initializeNotifications();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'studies':
        return <StudyTracker />;
      case 'finances':
        return <FinanceManager selectedAccountId={selectedAccountId} />;
      case 'accounts':
        return <AccountManager onAccountSelect={setSelectedAccountId} selectedAccountId={selectedAccountId} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

export default App;