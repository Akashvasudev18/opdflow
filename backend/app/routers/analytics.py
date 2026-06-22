from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.stats_service import (
    get_daily_appointments,
    get_hourly_flow,
    get_department_distribution,
    get_doctor_workload,
    get_status_distribution,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/daily-appointments")
def daily_appointments(db: Session = Depends(get_db)):
    return get_daily_appointments(db)


@router.get("/hourly-flow")
def hourly_flow(db: Session = Depends(get_db)):
    return get_hourly_flow(db)


@router.get("/department-distribution")
def department_distribution(db: Session = Depends(get_db)):
    return get_department_distribution(db)


@router.get("/doctor-workload")
def doctor_workload(db: Session = Depends(get_db)):
    return get_doctor_workload(db)


@router.get("/status-distribution")
def status_distribution(db: Session = Depends(get_db)):
    return get_status_distribution(db)
