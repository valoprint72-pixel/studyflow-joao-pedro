import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Wallet, CreditCard, LogOut, User, Menu, X, Brain, Clock, MessageSquare } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

type Page = 'dashboard' | 'studies' | 'finances' | 'accounts' | 'self-knowledge' | 'pomodoro' | 'ai-feedback';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: SupabaseUser;
  onSignOut: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, user, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studies' as Page, label: 'Estudos', icon: BookOpen },
    { id: 'finances' as Page, label: 'Finanças', icon: Wallet },
    { id: 'accounts' as Page, label: 'Contas', icon: CreditCard },
    { id: 'self-knowledge' as Page, label: 'Autoconhecimento', icon: Brain },
    { id: 'pomodoro' as Page, label: 'Pomodoro', icon: Clock },
    { id: 'ai-feedback' as Page, label: 'Feedback IA', icon: MessageSquare },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-slate-50 border-r border-gray-200/50 flex flex-col transition-all duration-300 shadow-xl z-40 ${
      isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StudyFlow
                </h1>
                <p className="text-xs text-gray-600">Sistema de Estudos</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-110 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-gray-600" />
            ) : (
              <X className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-200/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-3 p-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onSignOut}
          className={`w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105 ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
}