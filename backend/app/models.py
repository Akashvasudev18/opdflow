from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    specialization = Column(String, nullable=False)
    available_days = Column(String, default="Monday,Tuesday,Wednesday,Thursday,Friday")
    start_time = Column(String, default="09:00")
    end_time = Column(String, default="17:00")
    appointment_duration = Column(Integer, default=30)
    daily_capacity = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    appointments = relationship("Appointment", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    opd_type = Column(String, nullable=False)
    status = Column(String, default="waiting")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    appointments = relationship("Appointment", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_date = Column(String, nullable=True)
    appointment_time = Column(String, nullable=True)
    status = Column(String, default="waiting")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

    __table_args__ = (
        Index("ix_appointment_slot", "doctor_id", "appointment_date", "appointment_time"),
        Index("ix_appointment_date_status", "appointment_date", "status"),
    )
