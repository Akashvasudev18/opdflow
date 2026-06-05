import random
from sqlalchemy.orm import Session
from .. import models


AVG_SERVICE_TIME = 10  # minutes


def simulate_patient_arrival(db: Session):
    # Create new patient
    new_patient = models.Patient(
        opd_type=random.choice(["General", "Cardiology", "Orthopedic"]),
        status="waiting"
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    # Get all doctors
    doctors = db.query(models.Doctor).all()

    # Count how many patients are already assigned
    assigned_patients = db.query(models.Patient).filter(models.Patient.status == "assigned").count()

    if doctors and assigned_patients < len(doctors):
        # Assign patient to available doctor
        available_doctor = doctors[assigned_patients % len(doctors)]

        appointment = models.Appointment(
            patient_id=new_patient.id,
            doctor_id=available_doctor.id,
            status="assigned"
        )

        new_patient.status = "assigned"

        db.add(appointment)
        db.commit()

    return new_patient