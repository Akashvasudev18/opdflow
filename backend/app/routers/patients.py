from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("", response_model=list[schemas.PatientResponse])
def list_patients(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()


@router.get("/list")
def list_patients_with_details(db: Session = Depends(get_db)):
    """List patients with their doctor assignment info."""
    patients = db.query(models.Patient).all()
    result = []
    for p in patients:
        appointment = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.patient_id == p.id,
                models.Appointment.status != "completed",
            )
            .order_by(models.Appointment.id.desc())
            .first()
        )

        doctor_name = "Not Assigned"
        appointment_id = None

        if appointment:
            appointment_id = appointment.appointment_id
            if appointment.doctor_id:
                doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
                if doctor:
                    doctor_name = doctor.name

        result.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "opd_type": p.opd_type,
            "doctor": doctor_name,
            "appointment_id": appointment_id,
        })
    return result


@router.get("/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
