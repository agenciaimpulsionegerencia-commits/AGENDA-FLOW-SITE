
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.ts';
import { Clinic, Service, TimeSlot, Appointment } from '../types.ts';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, Calendar as CalendarIcon, Clock, User as UserIcon, CheckCircle, Smartphone, AlertCircle, CreditCard, Wallet, Copy, Building, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface BookingWizardProps {
  preselectedClinicId?: string | null;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ preselectedClinicId }) => {
  const [step, setStep] = useState(0); 
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'pix_prepaid' | 'card_at_clinic'>('card_at_clinic');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [bookingResult, setBookingResult] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (preselectedClinicId) {
          const clinic = await apiService.getClinicById(preselectedClinicId);
          if (clinic) {
            setSelectedClinic(clinic);
            setStep(0);
          } else {
            setError("Link inválido ou clínica desativada.");
          }
        } else {
          const allClinics = await apiService.getClinics();
          setClinics(allClinics);
          setStep(1);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [preselectedClinicId]);

  useEffect(() => {
    if (selectedClinic && selectedService && selectedDate) {
      setLoading(true);
      apiService.getAvailability(selectedClinic.id, selectedService.id, selectedDate).then(slots => {
        setAvailableSlots(slots);
        setLoading(false);
      });
    }
  }, [selectedClinic, selectedService, selectedDate]);

  const handleBooking = async () => {
    if (!selectedClinic || !selectedService || !selectedSlot) return;
    setLoading(true);
    try {
      const res = await apiService.createAppointment({
        clinicId: selectedClinic.id,
        serviceId: selectedService.id,
        clientName: customerInfo.name,
        clientPhone: customerInfo.phone,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot,
        paymentType
      });
      setBookingResult(res);
      setStep(6);
    } catch (err) {
      alert("Erro ao realizar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (error) return (
    <div className="max-w-md mx-auto py-20 px-4 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Ops! Link Inválido</h2>
      <p className="text-gray-500">{error}</p>
    </div>
  );

  if (step === 0 && selectedClinic) {
    return (
      <div className="animate-in fade-in duration-700 max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="relative h-96 w-full">
            {selectedClinic.photoUrl ? (
              <img src={selectedClinic.photoUrl} alt={selectedClinic.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Building className="w-24 h-24 text-blue-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
              <div className="inline-flex items-center px-3 py-1 bg-blue-600/20 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest mb-4 w-fit">
                <Sparkles className="w-3 h-3 mr-2 text-blue-400" />
                Sua Experiência Exclusiva
              </div>
              <h1 className="text-5xl font-bold text-white font-serif mb-2">{selectedClinic.name}</h1>
              <div className="flex items-center text-white/80 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                {selectedClinic.address}
              </div>
            </div>
          </div>
          <div className="p-10 text-center">
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bem-vindo ao nosso sistema de agendamento privado. Reserve o seu horário com praticidade e exclusividade.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center mx-auto group"
            >
              Iniciar Agendamento
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide px-2">
        {[2, 3, 4, 5].map((num, idx) => {
          const labels = ['Serviço', 'Data', 'Pagamento', 'Confirmação'];
          return (
            <div key={num} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${step >= num ? 'bg-blue-600 text-white ring-4 ring-blue-50 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                  {num === step ? <div className="animate-pulse">{idx + 1}</div> : (step > num ? <CheckCircle className="w-6 h-6" /> : idx + 1)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${step >= num ? 'text-blue-600' : 'text-gray-300'}`}>
                  {labels[idx]}
                </span>
              </div>
              {idx < 3 && <div className={`h-1 w-12 md:w-20 mx-4 rounded-full transition-all ${step > num ? 'bg-blue-600' : 'bg-gray-100'}`} />}
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
        {selectedClinic && step < 6 && step > 0 && (
           <div className="bg-gray-50/50 p-6 flex items-center border-b border-gray-100 backdrop-blur-sm">
              {selectedClinic.photoUrl ? (
                <img src={selectedClinic.photoUrl} className="w-14 h-14 rounded-2xl object-cover mr-4 shadow-sm border-2 border-white" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mr-4">
                   <Building className="w-6 h-6 text-blue-400" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedClinic.name}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Agendamento Exclusivo</p>
              </div>
           </div>
        )}
        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="animate-in fade-in zoom-in-95">
              <h2 className="text-3xl font-bold mb-8 font-serif text-gray-900">Escolha a Unidade</h2>
              <div className="grid grid-cols-1 gap-4">
                {clinics.map(c => (
                  <button key={c.id} onClick={() => { setSelectedClinic(c); nextStep(); }} className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl hover:border-blue-400 hover:bg-white hover:shadow-xl hover:shadow-blue-50 text-left transition-all flex items-center group">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} className="w-16 h-16 rounded-2xl object-cover mr-5 shadow-sm group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mr-5">
                        <Building className="w-8 h-8 text-blue-300" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl text-gray-900">{c.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1 text-blue-400" />
                        {c.address}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && selectedClinic && (
            <div className="animate-in fade-in zoom-in-95">
              <h2 className="text-3xl font-bold mb-8 font-serif text-gray-900">Selecione o Serviço</h2>
              <div className="grid grid-cols-1 gap-4">
                {selectedClinic.services.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 italic">Nenhum serviço disponível no momento.</div>
                ) : (
                  selectedClinic.services.map(s => (
                    <button key={s.id} onClick={() => { setSelectedService(s); nextStep(); }} className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:border-blue-400 hover:bg-white hover:shadow-xl hover:shadow-blue-50 text-left transition-all flex justify-between items-center group">
                      <div className="flex-grow">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{s.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-1">{s.description}</p>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3 mr-1.5" /> {s.duration} min
                          </span>
                          <span className="flex items-center text-[10px] font-black uppercase bg-green-50 text-green-600 px-3 py-1 rounded-full">
                            R$ {s.price}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:shadow-md transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95">
              <h2 className="text-3xl font-bold mb-8 font-serif text-gray-900">Escolha a Data</h2>
              <div className="mb-10 overflow-x-auto flex space-x-3 pb-4 scrollbar-hide px-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => {
                  const d = addDays(new Date(), i);
                  const isActive = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDate(d)} 
                      className={`flex-shrink-0 px-5 py-4 rounded-3xl text-center min-w-[85px] transition-all border-2 ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-100 scale-110' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                    >
                      <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                        {format(d, 'EEE', { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-black">{format(d, 'dd')}</p>
                    </button>
                  );
                })}
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Horários Disponíveis</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl">
                    Ops! Não temos horários para este dia.
                  </div>
                ) : (
                  availableSlots.map(slot => (
                    <button 
                      key={slot.time} 
                      disabled={!slot.available} 
                      onClick={() => setSelectedSlot(slot.time)} 
                      className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${!slot.available ? 'bg-gray-50 text-gray-200 border-transparent opacity-50 cursor-not-allowed' : selectedSlot === slot.time ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
                    >
                      {slot.time}
                    </button>
                  ))
                )}
              </div>
              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors">Voltar</button>
                <button 
                  disabled={!selectedSlot || loading} 
                  onClick={nextStep} 
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center"
                >
                  {loading ? 'Consultando...' : 'Confirmar Horário'}
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-in fade-in zoom-in-95">
              <h2 className="text-3xl font-bold mb-8 font-serif text-gray-900">Pagamento</h2>
              <div className="space-y-4">
                {selectedClinic?.pixKey && (
                  <button onClick={() => setPaymentType('pix_prepaid')} className={`w-full p-6 border-2 rounded-3xl flex items-center justify-between transition-all ${paymentType === 'pix_prepaid' ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                    <div className="flex items-center">
                      <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl mr-5 shadow-sm"><Wallet className="w-7 h-7" /></div>
                      <div className="text-left">
                        <p className="font-bold text-xl text-gray-900">PIX Antecipado</p>
                        <p className="text-sm text-gray-500 font-medium">Prioridade máxima no atendimento</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-[3px] transition-all ${paymentType === 'pix_prepaid' ? 'border-blue-600 bg-blue-600 ring-2 ring-white ring-inset' : 'border-gray-300'}`} />
                  </button>
                )}
                <button onClick={() => setPaymentType('card_at_clinic')} className={`w-full p-6 border-2 rounded-3xl flex items-center justify-between transition-all ${paymentType === 'card_at_clinic' ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                  <div className="flex items-center">
                    <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl mr-5 shadow-sm"><CreditCard className="w-7 h-7" /></div>
                    <div className="text-left">
                      <p className="font-bold text-xl text-gray-900">Pagar no Local</p>
                      <p className="text-sm text-gray-500 font-medium">Cartão de Crédito ou Débito na clínica</p>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-[3px] transition-all ${paymentType === 'card_at_clinic' ? 'border-blue-600 bg-blue-600 ring-2 ring-white ring-inset' : 'border-gray-300'}`} />
                </button>
              </div>
              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="text-sm text-gray-400 font-bold hover:text-gray-600">Voltar</button>
                <button onClick={nextStep} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all">
                  Continuar
                </button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="animate-in fade-in zoom-in-95">
              <h2 className="text-3xl font-bold mb-8 font-serif text-gray-900">Seus Detalhes</h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Nome Completo</label>
                   <input 
                    type="text" 
                    placeholder="Como você gostaria de ser chamado?" 
                    className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                    value={customerInfo.name} 
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">WhatsApp de Contato</label>
                   <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="(00) 0 0000-0000" 
                      className="w-full p-5 pl-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                      value={customerInfo.phone} 
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                    />
                   </div>
                </div>
              </div>
              <div className="mt-10 p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start mb-6">
                  <p className="font-black uppercase text-[10px] tracking-widest text-white/60">Resumo Final</p>
                  <p className="text-2xl font-black">R$ {selectedService?.price}</p>
                </div>
                <div className="space-y-3">
                   <p className="text-xl font-bold flex items-center"><Sparkles className="w-5 h-5 mr-3 text-blue-200" /> {selectedService?.name}</p>
                   <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 text-white/80 font-medium">
                      <p className="flex items-center text-sm"><CalendarIcon className="w-4 h-4 mr-2" /> {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
                      <p className="flex items-center text-sm"><Clock className="w-4 h-4 mr-2" /> às {selectedSlot}</p>
                   </div>
                </div>
              </div>
              <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="text-sm text-gray-400 font-bold hover:text-gray-600">Voltar</button>
                <button 
                  disabled={!customerInfo.name || !customerInfo.phone || loading} 
                  onClick={handleBooking} 
                  className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all"
                >
                  {loading ? 'Processando...' : 'Finalizar e Reservar'}
                </button>
              </div>
            </div>
          )}
          {step === 6 && bookingResult && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
              <h2 className="text-5xl font-bold mb-4 font-serif text-gray-900">Tudo Confirmado!</h2>
              <p className="text-lg text-gray-500 mb-10 max-w-sm mx-auto">Seu agendamento foi processado e já consta em nosso sistema.</p>
              {paymentType === 'pix_prepaid' && (
                <div className="mb-10 p-8 bg-gray-50 rounded-[2rem] border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mr-3"><Wallet className="w-6 h-6" /></div>
                    <p className="text-xs text-gray-400 font-black mb-0 uppercase tracking-widest">Pagamento via PIX</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between mb-4 shadow-sm group">
                    <span className="font-mono text-gray-900 font-black text-sm truncate mr-4">{selectedClinic?.pixKey}</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(selectedClinic?.pixKey || ''); alert('PIX copiado com sucesso!'); }} 
                      className="text-white bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 italic">"Para validar sua reserva prioritária, efetue o PIX e notifique no WhatsApp abaixo."</p>
                </div>
              )}
              <button 
                onClick={() => window.open(`https://wa.me/${selectedClinic?.phone}?text=${encodeURIComponent(`Olá! Gostaria de confirmar meu agendamento: \n\n👤 Nome: ${customerInfo.name}\n💆 Serviço: ${selectedService?.name}\n📅 Data: ${format(selectedDate, 'dd/MM')}\n⏰ Hora: ${selectedSlot}\n🔑 Código: ${bookingResult.confirmationCode}`)}`, '_blank')} 
                className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black flex items-center justify-center shadow-2xl shadow-green-100 hover:scale-105 transition-all text-xl"
              >
                <Smartphone className="w-7 h-7 mr-4" /> Enviar para WhatsApp
              </button>
              <button onClick={() => window.location.reload()} className="mt-10 text-sm text-gray-400 hover:text-blue-600 font-black transition-colors uppercase tracking-widest">Fazer outro agendamento</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
