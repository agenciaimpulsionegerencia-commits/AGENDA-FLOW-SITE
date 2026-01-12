import { Clinic, Service, Appointment, TimeSlot, BusinessHours } from '../types';
import { format, addMinutes, parse, addDays, startOfDay, getDay } from 'date-fns';

const STORAGE_KEYS = {
  CLINICS: 'agendaflow_clinics',
  APPOINTMENTS: 'agendaflow_appointments'
};

const getStored = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStored = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const DEFAULT_HOURS: BusinessHours = {
  start: '08:00',
  end: '18:00',
  daysEnabled: [1, 2, 3, 4, 5] // Mon-Fri
};

export const apiService = {
  // Login
  loginClinic: async (email: string, password?: string): Promise<Clinic | null> => {
    const clinics = getStored<Clinic>(STORAGE_KEYS.CLINICS);
    const clinic = clinics.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (clinic && password && clinic.password === password) {
      return clinic;
    }
    return null;
  },

  // Admin Master
  createClinic: async (clinicData: Omit<Clinic, 'id' | 'services' | 'createdAt' | 'businessHours'>): Promise<Clinic> => {
    const clinics = getStored<Clinic>(STORAGE_KEYS.CLINICS);
    const newClinic: Clinic = {
      ...clinicData,
      id: Math.random().toString(36).substr(2, 9),
      services: [],
      businessHours: DEFAULT_HOURS,
      createdAt: new Date().toISOString()
    };
    clinics.push(newClinic);
    setStored(STORAGE_KEYS.CLINICS, clinics);
    return newClinic;
  },

  updateClinic: async (clinicId: string, updates: Partial<Clinic>): Promise<void> => {
    const clinics = getStored<Clinic>(STORAGE_KEYS.CLINICS);
    const index = clinics.findIndex(c => c.id === clinicId);
    if (index !== -1) {
      clinics[index] = { ...clinics[index], ...updates };
      setStored(STORAGE_KEYS.CLINICS, clinics);
    }
  },

  deleteClinic: async (id: string): Promise<void> => {
    const clinics = getStored<Clinic>(STORAGE_KEYS.CLINICS).filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CLINICS, clinics);
  },

  getClinics: async (): Promise<Clinic[]> => {
    return getStored<Clinic>(STORAGE_KEYS.CLINICS);
  },

  getClinicById: async (id: string): Promise<Clinic | undefined> => {
    return getStored<Clinic>(STORAGE_KEYS.CLINICS).find(c => c.id === id);
  },

  // Agendamentos
  createAppointment: async (data: Omit<Appointment, 'id' | 'confirmationCode' | 'status' | 'endTime' | 'isPaid'>): Promise<Appointment> => {
    const appointments = getStored<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const clinics = getStored<Clinic>(STORAGE_KEYS.CLINICS);
    const clinic = clinics.find(c => c.id === data.clinicId);
    const service = clinic?.services.find(s => s.id === data.serviceId);

    if (!service) throw new Error('Serviço não encontrado');

    const start = parse(data.startTime, 'HH:mm', new Date());
    const end = addMinutes(start, service.duration);
    const endTime = format(end, 'HH:mm');

    const newAppointment: Appointment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      endTime,
      isPaid: data.paymentType === 'pix_prepaid' ? true : false,
      confirmationCode: Math.random().toString(36).toUpperCase().substr(2, 6),
      status: 'confirmed'
    };

    appointments.push(newAppointment);
    setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
    return newAppointment;
  },

  getAppointmentsByClinic: async (clinicId: string): Promise<Appointment[]> => {
    return getStored<Appointment>(STORAGE_KEYS.APPOINTMENTS).filter(a => a.clinicId === clinicId);
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status'], isPaid?: boolean): Promise<void> => {
    const appointments = getStored<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index].status = status;
      if (isPaid !== undefined) appointments[index].isPaid = isPaid;
      setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
    }
  },

  getAvailability: async (clinicId: string, serviceId: string, date: Date): Promise<TimeSlot[]> => {
    const clinic = getStored<Clinic>(STORAGE_KEYS.CLINICS).find(c => c.id === clinicId);
    if (!clinic) return [];
    
    const service = clinic.services.find(s => s.id === serviceId);
    if (!service) return [];

    const dayOfWeek = getDay(date);
    if (!clinic.businessHours.daysEnabled.includes(dayOfWeek)) return [];

    const dateStr = format(date, 'yyyy-MM-dd');
    const appointments = getStored<Appointment>(STORAGE_KEYS.APPOINTMENTS).filter(
      a => a.clinicId === clinicId && a.date === dateStr && a.status !== 'cancelled'
    );

    const slots: TimeSlot[] = [];
    const openingTime = parseInt(clinic.businessHours.start.split(':')[0]);
    const closingTime = parseInt(clinic.businessHours.end.split(':')[0]);

    for (let hour = openingTime; hour < closingTime; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const slotStart = parse(timeStr, 'HH:mm', new Date());
        const slotEnd = addMinutes(slotStart, service.duration);
        
        const businessEnd = parse(clinic.businessHours.end, 'HH:mm', new Date());
        if (slotEnd > businessEnd) continue;

        const isOccupied = appointments.some(app => {
          const appStart = parse(app.startTime, 'HH:mm', new Date());
          const appEnd = parse(app.endTime, 'HH:mm', new Date());
          return (
            (slotStart >= appStart && slotStart < appEnd) ||
            (slotEnd > appStart && slotEnd <= appEnd) ||
            (appStart >= slotStart && appStart < slotEnd)
          );
        });

        const isPast = startOfDay(date).getTime() === startOfDay(new Date()).getTime() && 
                       slotStart < new Date();

        slots.push({ time: timeStr, available: !isOccupied && !isPast });
      }
    }
    return slots;
  }
};