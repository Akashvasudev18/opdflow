from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import models


def generate_appointment_id(db: Session) -> str:
    """Generate unique appointment ID like CF-20260605-001"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    prefix = f"CF-{today}-"

    last = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id.like(f"{prefix}%"))
        .order_by(models.Appointment.id.desc())
        .first()
    )

    if last:
        seq = int(last.appointment_id.split("-")[-1]) + 1
    else:
        seq = 1

    return f"{prefix}{seq:03d}"


def assign_next_patient(db: Session):
    """Auto-assign waiting patients to available doctors."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Find doctors currently busy (in_consultation today)
    busy_doctor_ids = (
        db.query(models.Appointment.doctor_id)
        .filter(
            models.Appointment.status == "in_consultation",
        )
        .distinct()
        .all()
    )
    busy_ids = [d[0] for d in busy_doctor_ids if d[0] is not None]

    # Find active, non-busy doctors
    free_doctors = (
        db.query(models.Doctor)
        .filter(models.Doctor.is_active == True, ~models.Doctor.id.in_(busy_ids) if busy_ids else True)
        .all()
    )

    # Find waiting patients ordered by creation time
    waiting_patients = (
        db.query(models.Patient)
        .filter(models.Patient.status == "waiting")
        .order_by(models.Patient.id)
        .all()
    )

    assigned_count = 0
    for doctor, patient in zip(free_doctors, waiting_patients):
        # Find the waiting appointment for this patient
        appointment = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.patient_id == patient.id,
                models.Appointment.status == "waiting",
            )
            .first()
        )

        if appointment:
            appointment.status = "in_consultation"
            appointment.doctor_id = doctor.id
            patient.status = "in_consultation"
            assigned_count += 1

    if assigned_count > 0:
        db.commit()

    return assigned_count


def get_waiting_time(db: Session) -> float:
    """Calculate estimated waiting time using today's data only.

    Formula: (waiting_patients / doctors_serving) * avg_consultation_time

    When all doctors are busy, we use total active doctors (patients wait
    for current consultations to finish). We only return 0 when there are
    truly no active doctors or no waiting patients.
    """
    waiting_count = (
        db.query(models.Patient)
        .filter(models.Patient.status == "waiting")
        .count()
    )

    if waiting_count == 0:
        return 0.0

    # Count active doctors
    active_doctors = (
        db.query(models.Doctor)
        .filter(models.Doctor.is_active == True)
        .count()
    )

    if active_doctors == 0:
        return 0.0

    # Available doctors = active minus busy
    busy_ids = [
        d[0]
        for d in db.query(models.Appointment.doctor_id)
        .filter(models.Appointment.status == "in_consultation")
        .distinct()
        .all()
        if d[0] is not None
    ]

    available_count = (
        db.query(models.Doctor)
        .filter(
            models.Doctor.is_active == True,
            ~models.Doctor.id.in_(busy_ids) if busy_ids else True,
        )
        .count()
    )

    # Use available doctors if any are free; otherwise use total active
    # (patients wait for current consultations to complete)
    doctors_serving = available_count if available_count > 0 else active_doctors

    AVG_CONSULTATION_TIME = 10  # minutes
    wait_time = (waiting_count / doctors_serving) * AVG_CONSULTATION_TIME
    return round(max(0, wait_time), 1)

