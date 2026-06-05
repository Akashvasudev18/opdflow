from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DoctorBase(BaseModel):
    name: str
    specialization: str
    available_hours: float
    available_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday"
    start_time: str = "09:00"
    end_time: str = "17:00"
    appointment_duration: int = 30


class DoctorCreate(DoctorBase):
    pass


class DoctorResponse(DoctorBase):
    id: int

    class Config:
        from_attributes = True


class PatientBase(BaseModel):
    opd_type: str

class PatientCreate(BaseModel):
    name: str 
    opd_type: str

class PatientResponse(BaseModel):
    id: int
    name: str   
    opd_type: str
    status: str

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str
    appointment_time: str
    name: str
    opd_type: str