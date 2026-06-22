from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import calendar
from datetime import datetime, timezone
from ..database import get_db
from .. import models, schemas
from ..services.slot_service import generate_slots, get_booked_slots

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.post("", response_model=schemas.DoctorResponse)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = models.Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


@router.get("", response_model=list[schemas.DoctorStatusResponse])
def list_doctors(db: Session = Depends(get_db)):
    doctors = db.query(models.Doctor).filter(models.Doctor.is_active == True).all()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    result = []
    for doc in doctors:
        # Check if doctor is currently in consultation
        busy = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.doctor_id == doc.id,
                models.Appointment.status == "in_consultation",
            )
            .first()
        )
        today_count = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.doctor_id == doc.id,
                models.Appointment.appointment_date == today_str,
            )
            .count()
        )

        doc_dict = {
            "id": doc.id,
            "name": doc.name,
            "specialization": doc.specialization,
            "available_days": doc.available_days,
            "start_time": doc.start_time,
            "end_time": doc.end_time,
            "appointment_duration": doc.appointment_duration,
            "daily_capacity": doc.daily_capacity,
            "is_active": doc.is_active,
            "created_at": doc.created_at,
            "status": "busy" if busy else "available",
            "today_patients": today_count,
        }
        result.append(doc_dict)
    return result


@router.get("/{doctor_id}", response_model=schemas.DoctorStatusResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    busy = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.status == "in_consultation",
        )
        .first()
    )

    return {
        **{c.name: getattr(doctor, c.name) for c in doctor.__table__.columns},
        "status": "busy" if busy else "available",
        "today_patients": 0,
    }


@router.put("/{doctor_id}", response_model=schemas.DoctorResponse)
def update_doctor(doctor_id: int, updated: schemas.DoctorCreate, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    for key, value in updated.model_dump().items():
        setattr(doctor, key, value)

    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check for upcoming appointments
    upcoming = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.status.in_(["waiting", "in_consultation"]),
        )
        .count()
    )

    if upcoming > 0:
        return {
            "warning": True,
            "message": f"Doctor has {upcoming} upcoming appointment(s). Proceeding with soft delete.",
            "upcoming_count": upcoming,
        }

    # Soft delete
    doctor.is_active = False
    db.commit()
    return {"message": "Doctor removed successfully"}


@router.get("/{doctor_id}/slots", response_model=list[schemas.SlotResponse])
def get_doctor_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    slots = generate_slots(doctor, date)
    if not slots:
        return []

    booked = get_booked_slots(db, doctor_id, date)

    return [
        {"time": s, "status": "Booked" if s in booked else "Available"}
        for s in slots
    ]
