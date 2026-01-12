
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { Clinic } from '../types.ts';
import { Plus, Trash2, Building, Mail, Phone, MapPin, Copy, ExternalLink, Check, User, Key, Eye, EyeOff, Image as ImageIcon, LayoutDashboard } from 'lucide-react';

interface SuperAdminPanelProps {
  onManageClinic: (clinic: Clinic) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onManageClinic }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', photoUrl: '', email: '', password: '', 
    ownerName: '', ownerEmail: '', personalPhone: '', 
    phone: '', address: '' 
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    const data = await apiService.getClinics();
    setClinics(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.createClinic(formData);
    setFormData({ 
      name: '', photoUrl: '', email: '', password: '', 
      ownerName: '', ownerEmail: '', personalPhone: '', 
      phone: '', address: '' 
    });
    setShowAddForm(false);
    loadClinics();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover esta clínica?')) {
      await apiService.deleteClinic(id);
      loadClinics();
    }
  };

  const copyLink = (id: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?clinic=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inputStyle = "w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all";

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif text-gray-900">Controle Master</h1>
          <p className="text-gray-500">Gestão de Parceiros e Clínicas</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-blue-100 hover:scale-105 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showAddForm ? 'Cancelar Cadastro' : 'Cadastrar Nova Clínica'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl mb-10 animate-in slide-in-from-top duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center text-blue-600">
            <Building className="w-5 h-5 mr-2" />
            Dados da Clínica
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nome da Clínica</label>
                <input required placeholder="Ex: Estética Flow" className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">URL da Foto (Logo ou Fachada)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="https://..." className={inputStyle + " pl-10"} value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Endereço Completo</label>
                <input required placeholder="Rua, Número, Bairro, Cidade" className={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">WhatsApp Comercial</label>
                <input required placeholder="5511999998888" className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <h2 className="text-xl font-bold pt-4 mb-4 flex items-center text-blue-600 border-t border-gray-100">
              <User className="w-5 h-5 mr-2" />
              Dados do Proprietário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nome do Dono</label>
                <input required placeholder="Nome Completo" className={inputStyle} value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Email do Dono</label>
                <input required type="email" placeholder="email@pessoal.com" className={inputStyle} value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Telefone do Dono</label>
                <input required placeholder="Telefone Pessoal" className={inputStyle} value={formData.personalPhone} onChange={e => setFormData({...formData, personalPhone: e.target.value})} />
              </div>
            </div>

            <h2 className="text-xl font-bold pt-4 mb-4 flex items-center text-blue-600 border-t border-gray-100">
              <Key className="w-5 h-5 mr-2" />
              Acesso da Clínica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Email de Login</label>
                <input required type="email" placeholder="login@clinica.com" className={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                <div className="relative">
                  <input 
                    required 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Defina a senha" 
                    className={inputStyle} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 text-gray-500 font-bold hover:text-gray-700">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Finalizar e Criar Acesso</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map(clinic => (
          <div key={clinic.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col group transition-all hover:shadow-xl overflow-hidden">
            {clinic.photoUrl ? (
               <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                  <img src={clinic.photoUrl} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">{clinic.name}</h3>
               </div>
            ) : (
              <div className="h-40 w-full bg-blue-50 flex items-center justify-center relative">
                 <Building className="w-12 h-12 text-blue-200" />
                 <h3 className="absolute bottom-4 left-4 text-blue-900 font-bold text-xl">{clinic.name}</h3>
              </div>
            )}
            <div className="p-6 flex-grow">
              <p className="text-xs text-blue-600 font-black mb-4 uppercase tracking-tighter flex items-center">
                <User className="w-3 h-3 mr-1" /> {clinic.ownerName}
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-gray-400" /> {clinic.email}</div>
                <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-gray-400" /> {clinic.phone}</div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-gray-400" /> <span className="truncate">{clinic.address}</span></div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-50 space-y-2">
                 <button 
                    onClick={() => onManageClinic(clinic)}
                    className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-black transition-all"
                 >
                   <LayoutDashboard className="w-4 h-4 mr-2" />
                   Gerenciar Agenda / Datas
                 </button>
                 <div className="flex gap-2">
                    <button onClick={() => copyLink(clinic.id)} className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === clinic.id ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      {copiedId === clinic.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      Link Cliente
                    </button>
                    <button onClick={() => handleDelete(clinic.id)} className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
