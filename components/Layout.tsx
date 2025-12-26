
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, setRole }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Parcere</span>
          </div>
          
          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setRole(UserRole.FREELANCER)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === UserRole.FREELANCER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Freelancer
            </button>
            <button
              onClick={() => setRole(UserRole.BRAND_MANAGER)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === UserRole.BRAND_MANAGER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Marca
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        {children}
      </main>
    </div>
  );
};
