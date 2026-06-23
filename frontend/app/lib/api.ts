// CareFlux - Centralized API Layer

import type { OPDStats, Doctor, Patient, Appointment, Slot } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export { API };

export async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}

export async function postJSON<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(errorData.detail || r.statusText);
  }
  return r.json();
}

export async function putJSON<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(errorData.detail || r.statusText);
  }
  return r.json();
}

export async function deleteJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { method: "DELETE" });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(errorData.detail || r.statusText);
  }
  return r.json();
}

export const api = {
  // Stats
  getStats: () => fetchJSON<OPDStats>(`${API}/opd/stats`),

  // Doctors
  getDoctors: () => fetchJSON<Doctor[]>(`${API}/doctors`),
  getDoctor: (id: number) => fetchJSON<Doctor>(`${API}/doctors/${id}`),
  createDoctor: (data: Omit<Doctor, "id" | "created_at" | "status" | "today_patients">) =>
    postJSON<Doctor>(`${API}/doctors`, data as unknown as Record<string, unknown>),
  updateDoctor: (id: number, data: Partial<Doctor>) =>
    putJSON<Doctor>(`${API}/doctors/${id}`, data as unknown as Record<string, unknown>),
  deleteDoctor: (id: number) => deleteJSON<{ message: string }>(`${API}/doctors/${id}`),

  // Patients
  getPatients: () => fetchJSON<Patient[]>(`${API}/patients`),
  getPatient: (id: number) => fetchJSON<Patient>(`${API}/patients/${id}`),

  // Appointments
  getAppointments: () => fetchJSON<Appointment[]>(`${API}/appointments`),
  getAppointment: (id: string) => fetchJSON<Appointment>(`${API}/appointments/${id}`),
  bookAppointment: (data: {
    patient_name: string;
    opd_type: string;
    doctor_id: number;
    appointment_date: string;
  }) => postJSON<Appointment>(`${API}/appointments/book`, data as unknown as Record<string, unknown>),
  updateAppointmentStatus: (id: string, status: string) =>
    putJSON<Appointment>(`${API}/appointments/${id}/status`, { status }),
  checkStatus: (appointmentId: string) =>
    fetchJSON<Appointment>(`${API}/appointments/status/${appointmentId}`),

  // Slots
  getDoctorSlots: (doctorId: number, date: string) =>
    fetchJSON<Slot[]>(`${API}/doctors/${doctorId}/slots?date=${date}`),

  // Queue
  getQueue: () => fetchJSON<Appointment[]>(`${API}/opd/queue`),
};
