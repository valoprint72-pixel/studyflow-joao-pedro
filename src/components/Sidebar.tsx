import React from 'react';
import { LayoutDashboard, BookOpen, Wallet, CreditCard, LogOut, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

type Page = 'dashboard' | 'studies' | 'finances' | 'accounts';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: SupabaseUser;
  onSignOut: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, user, onSignOut }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studies' as Page, label: 'Estudos', icon: BookOpen },
    { id: 'finances' as Page, label: 'Finanças', icon: Wallet },
    { id: 'accounts' as Page, label: 'Contas', icon: CreditCard },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">StudyFlow</h1>
            <p className="text-sm text-gray-500">João Pedro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}