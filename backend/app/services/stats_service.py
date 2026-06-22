from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
import calendar
from .. import models
from .queue_service import get_waiting_time


def get_dashboard_stats(db: Session) -> dict:
    """Calculate all dashboard KPI stats."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    total_appointments = db.query(models.Appointment).count()

    today_appointments = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_date == today_str)
        .count()
    )

    waiting_today = (
        db.query(models.Appointment)
        .filter(models.Appointment.status == "waiting")
        .count()
    )

    in_consultation_today = (
        db.query(models.Appointment)
        .filter(models.Appointment.status == "in_consultation")
        .count()
    )

    completed_today = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.status == "completed",
            models.Appointment.appointment_date == today_str,
        )
        .count()
    )

    total_doctors = db.query(models.Doctor).count()
    active_doctors = db.query(models.Doctor).filter(models.Doctor.is_active == True).count()

    # Available doctors = active and not in consultation
    busy_ids = [
        d[0]
        for d in db.query(models.Appointment.doctor_id)
        .filter(models.Appointment.status == "in_consultation")
        .distinct()
        .all()
        if d[0] is not None
    ]
    available_doctors = (
        db.query(models.Doctor)
        .filter(
            models.Doctor.is_active == True,
            ~models.Doctor.id.in_(busy_ids) if busy_ids else True,
        )
        .count()
    )

    avg_waiting_time = get_waiting_time(db)

    # Slot calculations
    today_name = calendar.day_name[datetime.now(timezone.utc).weekday()]
    total_slots = 0
    doctors = db.query(models.Doctor).filter(models.Doctor.is_active == True).all()
    for d in doctors:
        if today_name in (d.available_days or ""):
            total_slots += d.daily_capacity or 10

    booked_today = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_date == today_str)
        .count()
    )

    return {
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "waiting_today": waiting_today,
        "in_consultation_today": in_consultation_today,
        "completed_today": completed_today,
        "total_doctors": total_doctors,
        "active_doctors": active_doctors,
        "available_doctors": available_doctors,
        "avg_waiting_time": avg_waiting_time,
        "total_slots_today": total_slots,
        "booked_slots_today": booked_today,
        "remaining_slots_today": max(0, total_slots - booked_today),
    }


def get_daily_appointments(db: Session, days: int = 7) -> list[dict]:
    """Get appointment counts grouped by date for the last N days."""
    results = []
    for i in range(days - 1, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        count = (
            db.query(models.Appointment)
            .filter(models.Appointment.appointment_date == date)
            .count()
        )
        day_label = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%a")
        results.append({"day": day_label, "date": date, "appointments": count})
    return results


def get_hourly_flow(db: Session) -> list[dict]:
    """Get today's patient flow grouped by hour."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    results = []
    for hour in range(8, 18):
        time_prefix = f"{hour:02d}:"
        count = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.appointment_date == today_str,
                models.Appointment.appointment_time.like(f"{time_prefix}%"),
            )
            .count()
        )
        results.append({"time": f"{hour:02d}:00", "patients": count})
    return results


def get_department_distribution(db: Session) -> list[dict]:
    """Get patient count per department (opd_type)."""
    results = (
        db.query(models.Patient.opd_type, func.count(models.Patient.id))
        .group_by(models.Patient.opd_type)
        .all()
    )
    return [{"dept": r[0], "count": r[1]} for r in results]


def get_doctor_workload(db: Session) -> list[dict]:
    """Get today's appointment count per doctor."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doctors = db.query(models.Doctor).filter(models.Doctor.is_active == True).all()
    results = []
    for doc in doctors:
        count = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.doctor_id == doc.id,
                models.Appointment.appointment_date == today_str,
            )
            .count()
        )
        results.append({"name": doc.name, "patients": count})
    return results


def get_status_distribution(db: Session) -> list[dict]:
    """Get waiting/consultation/completed counts."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    waiting = db.query(models.Appointment).filter(models.Appointment.status == "waiting").count()
    consultation = db.query(models.Appointment).filter(models.Appointment.status == "in_consultation").count()
    completed = (
        db.query(models.Appointment)
        .filter(models.Appointment.status == "completed", models.Appointment.appointment_date == today_str)
        .count()
    )
    return [
        {"name": "Waiting", "value": waiting},
        {"name": "In Consultation", "value": consultation},
        {"name": "Completed", "value": completed},
    ]
