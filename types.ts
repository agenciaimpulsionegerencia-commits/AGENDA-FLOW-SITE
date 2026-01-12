
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface BusinessHours {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  daysEnabled: number[]; // 0-6 (Sun-Sat)
}

export interface Clinic {
  id: string;
  name: string;
  photoUrl?: string; // New field for clinic photo
  email: string; // Business email/Login
  password: string;
  ownerName: string;
  ownerEmail: string;
  personalPhone: string;
  phone: string; // WhatsApp
  address: string;
  pixKey?: string;
  services: Service[];
  businessHours: BusinessHours;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  confirmationCode: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentType: 'pix_prepaid' | 'card_at_clinic';
  isPaid: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
