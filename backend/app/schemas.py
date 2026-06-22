from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Doctor ──────────────────────────────────────────────────────────────────

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    available_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday"
    start_time: str = "09:00"
    end_time: str = "17:00"
    appointment_duration: int = 30
    daily_capacity: int = 10


class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    available_days: str
    start_time: str
    end_time: str
    appointment_duration: int
    daily_capacity: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DoctorStatusResponse(DoctorResponse):
    status: str = "available"
    today_patients: int = 0


# ── Patient ─────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    name: str
    opd_type: str


class PatientResponse(BaseModel):
    id: int
    name: str
    opd_type: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Appointment ─────────────────────────────────────────────────────────────

class AppointmentBookRequest(BaseModel):
    name: str
    opd_type: str
    doctor_id: Optional[int] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    appointment_id: str
    patient_id: int
    doctor_id: Optional[int] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentStatusResponse(BaseModel):
    appointment_id: str
    patient_name: str
    doctor_name: str
    status: str
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    estimated_waiting_time: float = 0


# ── Slots ───────────────────────────────────────────────────────────────────

class SlotResponse(BaseModel):
    time: str
    status: str  # "Available" or "Booked"


# ── Stats ───────────────────────────────────────────────────────────────────

class OPDStatsResponse(BaseModel):
    total_appointments: int = 0
    today_appointments: int = 0
    waiting_today: int = 0
    in_consultation_today: int = 0
    completed_today: int = 0
    total_doctors: int = 0
    active_doctors: int = 0
    available_doctors: int = 0
    avg_waiting_time: float = 0
    total_slots_today: int = 0
    booked_slots_today: int = 0
    remaining_slots_today: int = 0