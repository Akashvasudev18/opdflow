from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import calendar
from .. import models


def generate_slots(doctor: models.Doctor, date_str: str) -> list[str]:
    """Generate time slots from doctor's schedule for a given date."""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    day_name = calendar.day_name[date_obj.weekday()]

    if day_name not in (doctor.available_days or ""):
        return []

    try:
        start = datetime.strptime(doctor.start_time, "%H:%M")
        end = datetime.strptime(doctor.end_time, "%H:%M")
    except (ValueError, TypeError):
        return []

    duration = doctor.appointment_duration or 30
    slots = []
    current = start
    while current + timedelta(minutes=duration) <= end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=duration)

    return slots


def get_booked_slots(db: Session, doctor_id: int, date_str: str) -> list[str]:
    """Get list of already-booked time slots for a doctor on a date."""
    appointments = (
        db.query(models.Appointment.appointment_time)
        .filter(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.appointment_date == date_str,
        )
        .all()
    )
    return [a[0] for a in appointments if a[0]]


def check_slot_available(db: Session, doctor_id: int, date_str: str, time_str: str) -> bool:
    """Check if a specific slot is available."""
    existing = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.appointment_date == date_str,
            models.Appointment.appointment_time == time_str,
        )
        .first()
    )
    return existing is None
