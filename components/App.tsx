
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BookingWizard } from './components/BookingWizard';
import { AdminPanel } from './components/AdminPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { Login } from './components/Login';
import { Clinic } from './types';
import { Sparkles, Calendar, Heart, ShieldCheck, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'booking' | 'super-admin' | 'login' | 'super-admin-login'>('home');
  const [loggedClinic, setLoggedClinic] = useState<Clinic | null>(null);
  const [managedClinic, setManagedClinic] = useState<Clinic | null>(null); // For Master Admin managing a clinic
  const [targetClinicId, setTargetClinicId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Check for clinic ID in URL on load for private links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clinicId = params.get('clinic');
    if (clinicId) {
      setTargetClinicId(clinicId);
      setCurrentPage('booking');
    }

    const savedClinic = localStorage.getItem('agendaflow_session');
    if (savedClinic) {
      setLoggedClinic(JSON.parse(savedClinic));
    }
    
    const savedSuper = localStorage.getItem('agendaflow_super');
    if (savedSuper === 'true') {
      setIsSuperAdmin(true);
    }
  }, []);

  const handleLogin = (clinic: Clinic) => {
    setLoggedClinic(clinic);
    setManagedClinic(null);
    localStorage.setItem('agendaflow_session', JSON.stringify(clinic));
    setCurrentPage('admin');
  };

  const handleManageClinic = (clinic: Clinic) => {
    setManagedClinic(clinic);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setLoggedClinic(null);
    setManagedClinic(null);
    setIsSuperAdmin(false);
    localStorage.removeItem('agendaflow_session');
    localStorage.removeItem('agendaflow_super');
    setCurrentPage('home');
  };

  const handleSuperAdminLogin = () => {
    if (passwordInput === '1476') {
      setIsSuperAdmin(true);
      localStorage.setItem('agendaflow_super', 'true');
      setCurrentPage('super-admin');
      setPasswordInput('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-500">
            <header className="bg-white py-16 px-4">
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6 border border-blue-100">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sua beleza em fluxo constante
                </div>
                <h1 className="text-5xl md:text-6xl font-bold font-serif text-gray-900 mb-6 leading-tight">
                  A plataforma definitiva para <br />
                  <span className="text-blue-600 italic">gestão de estética</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                  O AGENDA FLOW oferece links privados e controle absoluto para que sua clínica cresça com organização.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    Painel da Clínica
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            <section className="py-20 bg-gray-50 px-4">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="bg-white p-8 rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Links Privados</h3>
                  <p className="text-gray-500">Cada clínica tem seu link exclusivo. Sem vitrine pública para a concorrência.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Agendamento Direto</h3>
                  <p className="text-gray-500">Interface limpa e rápida para seus clientes escolherem serviços e horários.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Acesso Master</h3>
                  <p className="text-gray-500">Gestão centralizada para suporte e criação de novas unidades parceiras.</p>
                </div>
              </div>
            </section>

            <footer className="py-12 border-t border-gray-100 bg-white">
              <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                <p>&copy; 2024 AGENDA FLOW. O ritmo perfeito da sua beleza.</p>
              </div>
            </footer>
          </div>
        );
      case 'booking':
        return <BookingWizard preselectedClinicId={targetClinicId} />;
      case 'login':
        return <Login onLoginSuccess={handleLogin} />;
      case 'admin':
        // Show panel for either logged clinic or a clinic being managed by super admin
        const clinicToShow = managedClinic || loggedClinic;
        return clinicToShow ? <AdminPanel loggedClinic={clinicToShow} isMasterView={!!managedClinic} onExitMasterView={() => { setManagedClinic(null); setCurrentPage('super-admin'); }} /> : <Login onLoginSuccess={handleLogin} />;
      case 'super-admin-login':
        return (
          <div className="max-w-md mx-auto py-20 px-4">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-serif mb-6 text-gray-900">Acesso Administrador Master</h2>
              <div className="relative mb-6">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Senha Master" 
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-center text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSuperAdminLogin()}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button 
                onClick={handleSuperAdminLogin}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Autenticar
              </button>
            </div>
          </div>
        );
      case 'super-admin':
        return isSuperAdmin ? <SuperAdminPanel onManageClinic={handleManageClinic} /> : <Login onLoginSuccess={handleLogin} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        onNavigate={(page) => {
          if (page === 'super-admin') {
            setCurrentPage(isSuperAdmin ? 'super-admin' : 'super-admin-login');
          } else {
            setCurrentPage(page);
          }
        }} 
        activePage={currentPage} 
        isLoggedIn={!!loggedClinic || isSuperAdmin} 
        onLogout={handleLogout} 
      />
      {renderPage()}
    </div>
  );
};

export default App;
