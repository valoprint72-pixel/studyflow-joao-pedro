import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudyTracker from './components/StudyTracker';
import FinanceManager from './components/FinanceManager';
import AccountManager from './components/AccountManager';
import Login from './components/Login';
import InstallPrompt from './components/InstallPrompt';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="glass-card p-8 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando StudyFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Login />
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="md:hidden">
        <header className="glass-card m-3 p-4 iphone-safe-top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                StudyFlow
              </h1>
              <p className="text-sm text-gray-600">Olá, João Pedro! 👋</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3v1" />
              </svg>
            </button>
          </div>
        </header>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        <Sidebar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 transition-all duration-300" style={{ marginLeft: '256px' }}>
          <div className="p-8 h-full overflow-y-auto">
            <div className="fade-in">
              {renderCurrentPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        <main className="pb-24 px-4">
          <div className="fade-in">
            {renderCurrentPage()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav iphone-safe-bottom">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                currentPage === 'dashboard' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-blue-600 hover:scale-105'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1 font-medium">Home</span>
            </button>

            <button
              onClick={() => setCurrentPage('studies')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                currentPage === 'studies' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-green-600 hover:scale-105'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs mt-1 font-medium">Estudos</span>
            </button>

            <button
              onClick={() => setCurrentPage('finances')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                currentPage === 'finances' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-purple-600 hover:scale-105'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-xs mt-1 font-medium">Finanças</span>
            </button>

            <button
              onClick={() => setCurrentPage('accounts')}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                currentPage === 'accounts' 
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-orange-600 hover:scale-105'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs mt-1 font-medium">Contas</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;