
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { Appointment, Clinic, Service, BusinessHours, TimeSlot } from '../types.ts';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2, Users, Calendar as CalendarIcon, DollarSign, Settings, Check, X, CreditCard, Wallet, Copy, Share2, ArrowLeft, Shield, Clock, Tag, ChevronLeft, ChevronRight, Briefcase, Building } from 'lucide-react';

interface AdminPanelProps {
  loggedClinic: Clinic;
  isMasterView?: boolean;
  onExitMasterView?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ loggedClinic, isMasterView, onExitMasterView }) => {
  const [clinic, setClinic] = useState<Clinic>(loggedClinic);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'calendar' | 'services' | 'config'>('appointments');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', duration: 60, price: 0 });

  useEffect(() => {
    loadData();
  }, [clinic.id, loggedClinic.id]);

  useEffect(() => {
    if (activeTab === 'calendar') {
      loadDayAvailability();
    }
  }, [selectedDate, activeTab]);

  const loadData = async () => {
    const updatedClinic = await apiService.getClinicById(clinic.id);
    if (updatedClinic) setClinic(updatedClinic);
    const apps = await apiService.getAppointmentsByClinic(clinic.id);
    setAppointments(apps);
    setLoading(false);
  };

  const loadDayAvailability = async () => {
    const referenceServiceId = clinic.services[0]?.id || '';
    const slots = await apiService.getAvailability(clinic.id, referenceServiceId, selectedDate);
    setDaySlots(slots);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      ...newService
    };

    const updatedServices = [...clinic.services, service];
    await apiService.updateClinic(clinic.id, { services: updatedServices });
    setClinic({ ...clinic, services: updatedServices });
    setShowServiceForm(false);
    setNewService({ name: '', description: '', duration: 60, price: 0 });
  };

  const removeService = async (id: string) => {
    if (confirm('Deseja remover este serviço?')) {
      const updatedServices = clinic.services.filter(s => s.id !== id);
      await apiService.updateClinic(clinic.id, { services: updatedServices });
      setClinic({ ...clinic, services: updatedServices });
    }
  };

  const toggleStatus = async (appId: string, currentStatus: Appointment['status']) => {
    const newStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
    await apiService.updateAppointmentStatus(appId, newStatus);
    loadData();
  };

  const togglePayment = async (appId: string, currentIsPaid: boolean) => {
    await apiService.updateAppointmentStatus(appId, 'confirmed', !currentIsPaid);
    loadData();
  };

  const saveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pixKey = formData.get('pixKey') as string;
    const start = formData.get('start') as string;
    const end = formData.get('end') as string;
    
    const newHours: BusinessHours = {
      ...clinic.businessHours,
      start,
      end
    };

    await apiService.updateClinic(clinic.id, { pixKey, businessHours: newHours });
    alert('Configurações salvas!');
    loadData();
  };

  const copyPrivateLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?clinic=${clinic.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {isMasterView && (
        <div className="mb-6 bg-blue-600 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-blue-100 animate-in slide-in-from-top duration-500">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-xl mr-4"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="font-black uppercase text-[10px] tracking-widest text-white/70">Acesso Master Ativo</p>
              <p className="font-bold text-lg">Editando: <span className="underline decoration-2 underline-offset-4">{clinic.name}</span></p>
            </div>
          </div>
          <button onClick={onExitMasterView} className="flex items-center px-5 py-2.5 bg-white text-blue-600 hover:bg-gray-50 rounded-2xl font-black transition-all text-xs uppercase tracking-widest shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" /> Sair
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-2">
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-white hover:text-blue-600'}`}>
            <Users className="w-5 h-5 mr-3" /> Clientes
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-white hover:text-blue-600'}`}>
            <CalendarIcon className="w-5 h-5 mr-3" /> Calendário
          </button>
          <button onClick={() => setActiveTab('services')} className={`w-full flex items-center px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-white hover:text-blue-600'}`}>
            <Tag className="w-5 h-5 mr-3" /> Serviços
          </button>
          <button onClick={() => setActiveTab('config')} className={`w-full flex items-center px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all ${activeTab === 'config' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-white hover:text-blue-600'}`}>
            <Settings className="w-5 h-5 mr-3" /> Ajustes
          </button>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="flex items-center">
              {clinic.photoUrl ? (
                <img src={clinic.photoUrl} className="w-20 h-20 rounded-3xl object-cover mr-6 shadow-xl border-4 border-white" />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mr-6 border-4 border-white shadow-lg">
                   <Building className="w-10 h-10 text-blue-200" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold font-serif text-gray-900 tracking-tight">{clinic.name}</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão de {clinic.ownerName}</p>
              </div>
            </div>
            <button onClick={copyPrivateLink} className="flex items-center px-6 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100">
              {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copiedLink ? 'Link Copiado' : 'Compartilhar Link'}
            </button>
          </header>

          {activeTab === 'appointments' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center shadow-sm">
                  <div className="bg-blue-50 p-5 rounded-2xl mr-6"><Users className="w-8 h-8 text-blue-600" /></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Ativos</p>
                    <p className="text-4xl font-black text-gray-900">{appointments.filter(a => a.status !== 'cancelled').length}</p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center shadow-sm">
                  <div className="bg-green-50 p-5 rounded-2xl mr-6"><DollarSign className="w-8 h-8 text-green-600" /></div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Previsto Mensal</p>
                    <p className="text-4xl font-black text-gray-900">R$ {appointments.filter(a => a.status !== 'cancelled').reduce((acc, app) => acc + (clinic.services.find(s => s.id === app.serviceId)?.price || 0), 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Financeiro</th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Agendamento</th>
                      <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">Sua agenda está vazia por enquanto.</td></tr>
                    ) : (
                      appointments.sort((a,b) => b.date.localeCompare(a.date)).map(app => (
                        <tr key={app.id} className={`hover:bg-gray-50/50 transition-colors ${app.status === 'cancelled' ? 'opacity-40 grayscale' : ''}`}>
                          <td className="px-8 py-6">
                            <p className="font-black text-gray-900 text-lg">{app.clientName}</p>
                            <p className="text-xs text-blue-600 font-black mb-2">{app.clientPhone}</p>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                              {clinic.services.find(s => s.id === app.serviceId)?.name || 'Serviço Removido'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1.5">
                              <button onClick={() => togglePayment(app.id, app.isPaid)} className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${app.isPaid ? 'bg-green-100 text-green-700 ring-2 ring-green-50' : 'bg-red-100 text-red-700 ring-2 ring-red-50'}`}>
                                {app.isPaid ? 'Pago' : 'Pendente'}
                              </button>
                              <span className="text-[9px] text-gray-400 font-black ml-1">
                                {app.paymentType === 'pix_prepaid' ? 'PAGTO: PIX' : 'PAGTO: LOCAL'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-gray-800">{format(new Date(app.date), 'dd/MM/yy')}</p>
                            <p className="text-xs text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">{app.startTime}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button onClick={() => toggleStatus(app.id, app.status)} className={`p-3 rounded-2xl transition-all ${app.status === 'confirmed' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'}`}>
                               {app.status === 'confirmed' ? <X className="w-6 h-6" /> : <Check className="w-6 h-6" />}
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                     <h2 className="text-3xl font-bold font-serif text-gray-900">Visão Geral da Agenda</h2>
                     <div className="flex items-center bg-gray-50 p-2 rounded-2xl shadow-inner">
                        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-6 h-6 text-gray-400" /></button>
                        <span className="text-lg font-black text-blue-600 px-8 select-none">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-6 h-6 text-gray-400" /></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                     {daySlots.length === 0 ? (
                       <div className="col-span-full py-28 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                          <p className="text-gray-400 font-medium italic">Clínica fechada para atendimentos nesta data.</p>
                       </div>
                     ) : (
                       daySlots.map(slot => (
                         <div key={slot.time} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group ${slot.available ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'}`}>
                            <span className={`text-2xl font-black ${slot.available ? 'text-green-600' : 'text-red-600'} transition-transform group-hover:scale-110`}>{slot.time}</span>
                            <span className={`text-[10px] font-black uppercase mt-2 px-3 py-1 rounded-full ${slot.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {slot.available ? 'Disponível' : 'Ocupado'}
                            </span>
                         </div>
                       ))
                     )}
                  </div>
                  
                  <div className="mt-12 flex items-center justify-center space-x-10 text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-8">
                     <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-lg shadow-green-200" /> Horário Livre</div>
                     <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-lg shadow-red-200" /> Horário Ocupado</div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-serif">Seus Serviços</h2>
                <button onClick={() => setShowServiceForm(true)} className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-black transition-all shadow-xl shadow-gray-200">
                  <Plus className="w-5 h-5 mr-2" /> Novo Serviço
                </button>
              </div>

              {showServiceForm && (
                <div className="bg-white p-10 rounded-[2.5rem] border-2 border-blue-100 shadow-2xl mb-8 animate-in zoom-in-95 duration-300">
                   <div className="flex items-center mb-6">
                      <div className="bg-blue-100 p-3 rounded-2xl mr-4"><Briefcase className="w-6 h-6 text-blue-600" /></div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg">Adicionar Novo Serviço</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Preencha os detalhes abaixo</p>
                      </div>
                   </div>
                   <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nome do Procedimento</label>
                        <input required placeholder="Ex: Limpeza de Pele" className="w-full p-4 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Breve Descrição</label>
                        <input required placeholder="Ex: Procedimento relaxante de 60min" className="w-full p-4 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Duração Média</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input required type="number" placeholder="Minutos" className="w-full p-4 pl-12 border border-gray-200 rounded-2xl text-gray-900 font-bold outline-none" value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Valor Total</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input required type="number" placeholder="Valor em Reais" className="w-full p-4 pl-12 border border-gray-200 rounded-2xl text-gray-900 font-bold outline-none" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} />
                        </div>
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-50">
                         <button type="button" onClick={() => setShowServiceForm(false)} className="px-6 py-2 text-gray-400 font-black text-xs uppercase tracking-widest">Descartar</button>
                         <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">Publicar Serviço</button>
                      </div>
                   </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clinic.services.length === 0 ? (
                  <div className="col-span-full py-28 text-center text-gray-400 italic bg-gray-50 rounded-[2.5rem] border-2 border-dashed">Seu catálogo de serviços está vazio.</div>
                ) : (
                  clinic.services.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex justify-between items-start shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex-grow">
                        <h3 className="font-black text-gray-900 text-2xl mb-1 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{service.description}</p>
                        <div className="flex items-center space-x-3">
                           <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center shadow-sm">
                             <Clock className="w-3 h-3 mr-2" /> {service.duration} MIN
                           </span>
                           <span className="text-[9px] font-black bg-green-50 text-green-600 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center shadow-sm">
                             <DollarSign className="w-3 h-3 mr-1" /> {service.price} BRL
                           </span>
                        </div>
                      </div>
                      <button onClick={() => removeService(service.id)} className="text-gray-200 hover:text-red-500 p-3 hover:bg-red-50 rounded-2xl transition-all"><Trash2 className="w-6 h-6" /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-3xl font-bold font-serif mb-10 text-gray-900">Configurações Gerais</h2>
              <form onSubmit={saveConfig} className="space-y-10">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Chave PIX (Antecipação)</label>
                  <div className="relative">
                    <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input name="pixKey" defaultValue={clinic.pixKey} className="w-full p-5 pl-14 bg-gray-50 border border-gray-200 rounded-3xl text-gray-900 font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="CPF, E-mail ou Celular" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Abertura</label>
                    <input name="start" type="time" defaultValue={clinic.businessHours.start} className="w-full p-5 bg-gray-50 border border-gray-200 rounded-3xl text-gray-900 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Encerramento</label>
                    <input name="end" type="time" defaultValue={clinic.businessHours.end} className="w-full p-5 bg-gray-50 border border-gray-200 rounded-3xl text-gray-900 font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">
                  Salvar Preferências Operacionais
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
