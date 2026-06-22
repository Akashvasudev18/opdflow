from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..database import get_db
from .. import models, schemas
from ..services.queue_service import generate_appointment_id, assign_next_patient, get_waiting_time
from ..services.slot_service import check_slot_available

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/book")
def book_appointment(payload: schemas.AppointmentBookRequest, db: Session = Depends(get_db)):
    """Book an appointment: create patient, create appointment, auto-assign doctor."""

    # If doctor_id and slot provided, validate the slot
    if payload.doctor_id and payload.appointment_date and payload.appointment_time:
        if not check_slot_available(db, payload.doctor_id, payload.appointment_date, payload.appointment_time):
            raise HTTPException(status_code=400, detail="Slot already booked")

    # Create patient
    patient = models.Patient(
        name=payload.name,
        opd_type=payload.opd_type,
        status="waiting",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Generate unique appointment ID
    appt_id = generate_appointment_id(db)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Create appointment
    appointment = models.Appointment(
        appointment_id=appt_id,
        patient_id=patient.id,
        doctor_id=payload.doctor_id,
        appointment_date=payload.appointment_date or today_str,
        appointment_time=payload.appointment_time,
        status="waiting",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Auto-assign doctor
    assign_next_patient(db)

    # Refresh to get updated status
    db.refresh(appointment)
    db.refresh(patient)

    doctor_name = "Not Assigned"
    if appointment.doctor_id:
        doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
        if doctor:
            doctor_name = doctor.name

    return {
        "message": "Appointment booked successfully",
        "appointment_id": appt_id,
        "patient_id": patient.id,
        "doctor": doctor_name,
        "status": appointment.status,
    }


@router.get("/status/{appointment_id}")
def check_appointment_status(appointment_id: str, db: Session = Depends(get_db)):
    """Check appointment status by appointment ID (e.g., CF-20260605-001) or numeric ID."""

    # Try human-readable ID first, then numeric
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        # Try numeric ID
        try:
            numeric_id = int(appointment_id)
            appointment = (
                db.query(models.Appointment)
                .filter(models.Appointment.id == numeric_id)
                .first()
            )
        except ValueError:
            pass

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    patient = db.query(models.Patient).filter(models.Patient.id == appointment.patient_id).first()

    doctor_name = "Not Assigned"
    if appointment.doctor_id:
        doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
        if doctor:
            doctor_name = doctor.name

    return {
        "appointment_id": appointment.appointment_id,
        "patient_name": patient.name if patient else "Unknown",
        "doctor_name": doctor_name,
        "status": appointment.status,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "estimated_waiting_time": get_waiting_time(db) if appointment.status == "waiting" else 0,
    }


@router.post("/complete/{appointment_id}")
def complete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """Complete an appointment and auto-assign next waiting patient."""

    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        try:
            numeric_id = int(appointment_id)
            appointment = db.query(models.Appointment).filter(models.Appointment.id == numeric_id).first()
        except ValueError:
            pass

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "completed"
    appointment.completed_at = datetime.now(timezone.utc)

    patient = db.query(models.Patient).filter(models.Patient.id == appointment.patient_id).first()
    if patient:
        patient.status = "completed"

    db.commit()

    # Auto-assign next waiting patient to the now-free doctor
    assigned = assign_next_patient(db)

    return {"message": "Appointment completed", "next_assigned": assigned}


@router.get("/today")
def get_today_appointments(db: Session = Depends(get_db)):
    """Get all of today's appointments with patient and doctor details."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    appointments = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_date == today_str)
        .order_by(models.Appointment.id.desc())
        .all()
    )

    result = []
    for appt in appointments:
        patient = db.query(models.Patient).filter(models.Patient.id == appt.patient_id).first()
        doctor_name = "Not Assigned"
        if appt.doctor_id:
            doctor = db.query(models.Doctor).filter(models.Doctor.id == appt.doctor_id).first()
            if doctor:
                doctor_name = doctor.name

        result.append({
            "id": appt.id,
            "appointment_id": appt.appointment_id,
            "patient_name": patient.name if patient else "Unknown",
            "doctor_name": doctor_name,
            "opd_type": patient.opd_type if patient else "",
            "appointment_time": appt.appointment_time,
            "status": appt.status,
            "created_at": str(appt.created_at) if appt.created_at else None,
        })

    return result
