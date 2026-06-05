from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship



class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String)
    available_hours = Column(Float)
    available_days = Column(String, default="Monday,Tuesday,Wednesday,Thursday,Friday")
    start_time = Column(String, default="09:00")
    end_time = Column(String, default="17:00")
    appointment_duration = Column(Integer, default=30)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=True)   # 🔥 ADD THIS

    opd_type = Column(String)
    status = Column(String, default="waiting")



class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    appointment_date = Column(String, nullable=True)
    appointment_time = Column(String, nullable=True)
    status = Column(String, default="assigned")

    patient = relationship("Patient")
    doctor = relationship("Doctor")
