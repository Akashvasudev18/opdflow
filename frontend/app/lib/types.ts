// CareFlux - Shared TypeScript Interfaces

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  available_days: string;
  start_time: string;
  end_time: string;
  appointment_duration: number;
  daily_capacity: number;
  is_active: boolean;
  created_at?: string;
  status?: string;
  today_patients?: number;
}

export interface Patient {
  id: number;
  name: string;
  opd_type: string;
  status: string;
  created_at?: string;
}

export interface Appointment {
  id: number;
  appointment_id: string;
  patient_id: number;
  doctor_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  status: string;
  created_at?: string;
  completed_at?: string;
  patient_name?: string;
  doctor_name?: string;
  opd_type?: string;
}

export interface Slot {
  time: string;
  status: "Available" | "Booked";
}

export interface OPDStats {
  total_appointments: number;
  today_appointments: number;
  waiting_today: number;
  in_consultation_today: number;
  completed_today: number;
  total_doctors: number;
  active_doctors: number;
  available_doctors: number;
  avg_waiting_time: number;
  total_slots_today: number;
  booked_slots_today: number;
  remaining_slots_today: number;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}
