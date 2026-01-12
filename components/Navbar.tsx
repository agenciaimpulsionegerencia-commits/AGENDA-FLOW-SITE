
import React from 'react';
import { LayoutDashboard, Sparkles, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: 'home' | 'admin' | 'booking' | 'super-admin' | 'login' | 'super-admin-login') => void;
  activePage: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage, isLoggedIn, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900 font-serif">AGENDA FLOW</span>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${activePage === 'admin' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Painel
                </button>
                <button 
                  onClick={onLogout}
                  className="flex items-center px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </button>
              </>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${activePage === 'login' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              >
                Acesso Clínica
              </button>
            )}

            <button 
              onClick={() => onNavigate('super-admin')}
              title="Acesso Administrador Master"
              className={`p-2 rounded-full border border-transparent hover:border-blue-100 transition-all ${activePage.includes('super-admin') ? 'text-blue-600 bg-blue-50' : 'text-gray-300'}`}
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
