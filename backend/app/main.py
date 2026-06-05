import asyncio
from sklearn.linear_model import LinearRegression
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from .services.simulation_service import simulate_patient_arrival
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from . import models, schemas
from fastapi import WebSocket, WebSocketDisconnect



def assign_doctors(db: Session):

    busy_doctor_ids = db.query(models.Appointment.doctor_id).filter(
        models.Appointment.status == "in_consultation"
    ).all()

    busy_ids = [d[0] for d in busy_doctor_ids]

    free_doctors = db.query(models.Doctor).filter(
        ~models.Doctor.id.in_(busy_ids)
    ).all()

    waiting_patients = db.query(models.Patient).filter(
        models.Patient.status == "waiting"
    ).order_by(models.Patient.id).all()

    for doctor, patient in zip(free_doctors, waiting_patients):

        # 🔥 FIND EXISTING APPOINTMENT (VERY IMPORTANT)
        appointment = db.query(models.Appointment).filter(
            models.Appointment.patient_id == patient.id,
            models.Appointment.status == "waiting"
        ).first()

        if appointment:
            appointment.status = "in_consultation"
            appointment.doctor_id = doctor.id   # 🔥 THIS WAS MISSING

        patient.status = "in_consultation"

    db.commit()

def predict_waiting_time(waiting, doctors):

    if doctors == 0:
        return 0

    # 🔥 SIMPLE + RELIABLE FORMULA (BETTER THAN BAD ML)
    avg_time_per_patient = 10  # minutes

    time = (waiting / doctors) * avg_time_per_patient

    return round(max(0, time), 2)   

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()

app = FastAPI(title="OPDFlow Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

# Create tables
Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "OPDFlow Backend Running"}


# Create Doctor
@app.post("/doctors", response_model=schemas.DoctorResponse)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = models.Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


# Get Doctors
@app.get("/doctors", response_model=list[schemas.DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    return db.query(models.Doctor).all()


@app.put("/doctors/{doctor_id}", response_model=schemas.DoctorResponse)
def update_doctor(doctor_id: int, updated_doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()

    if not doctor:
        return {"error": "Doctor not found"}

    doctor.name = updated_doctor.name
    doctor.specialization = updated_doctor.specialization
    doctor.available_hours = updated_doctor.available_hours

    db.commit()
    db.refresh(doctor)
    return doctor


@app.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()

    if not doctor:
        return {"error": "Doctor not found"}

    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}


# Create Patient
@app.post("/patients", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


# Get Patients
@app.get("/patients", response_model=list[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()


@app.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: int, updated_patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()

    if not patient:
        return {"error": "Patient not found"}

    patient.opd_type = updated_patient.opd_type

    db.commit()
    db.refresh(patient)
    return patient


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()

    if not patient:
        return {"error": "Patient not found"}

    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}


@app.post("/simulate/patient-arrival")
def simulate_patient(db: Session = Depends(get_db)):
    patient = simulate_patient_arrival(db)
    return {"message": "Patient simulated", "patient_id": patient.id}

@app.websocket("/ws/opd")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)






@app.get("/opd/stats")
def get_opd_stats(db: Session = Depends(get_db)):

    # 🔹 Patient counts
    total_patients = db.query(models.Patient).filter(
    models.Patient.status != "completed"
            ).count()
    waiting_patients = db.query(models.Patient).filter(
    models.Patient.status == "waiting"
     ).count()

    in_consultation = db.query(models.Patient).filter(
    models.Patient.status == "in_consultation"
).count()

    # 🔹 Doctor count
    total_doctors = db.query(models.Doctor).count()

    # 🔹 Waiting time calculation (DYNAMIC)
    if total_doctors == 0:
        estimated_wait_time = 0
        utilization = 0

    else:
        # 🔥 Dynamic waiting time
        avg_time_per_patient = 10  # minutes

        estimated_wait_time = round(
            max(0, (waiting_patients / total_doctors) * avg_time_per_patient),
            2
        )

        utilization = round(
            (in_consultation / total_doctors) * 100,
            2
        )

    # 🔹 Recommendation logic
    recommendation = "System Running Smoothly"

    if estimated_wait_time > 30:
        recommendation = "High waiting time - Add more doctors"
    elif utilization < 50 and total_doctors > 0:
        recommendation = "Doctors underutilized"

    # 🔹 Stats for today
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    booked_slots_today = db.query(models.Appointment).filter(
        models.Appointment.appointment_date == today_str
    ).count()

    # Calculate available slots remaining roughly (total possible - booked)
    # Total possible: sum of all doctors' slots
    total_possible_slots = 0
    all_doctors = db.query(models.Doctor).all()
    for d in all_doctors:
        from datetime import datetime as dt
        try:
            st = dt.strptime(d.start_time, "%H:%M")
            et = dt.strptime(d.end_time, "%H:%M")
            mins = (et - st).total_seconds() / 60
            slots_per_doc = int(mins // d.appointment_duration)
            # Only if available today
            import calendar
            today_name = calendar.day_name[datetime.now().weekday()]
            if today_name in d.available_days:
                total_possible_slots += slots_per_doc
        except:
            pass
            
    available_slots_remaining = max(0, total_possible_slots - booked_slots_today)

    # 🔹 Final response
    return {
        "total_patients": total_patients,
        "waiting_patients": waiting_patients,
        "in_consultation": in_consultation,
        "total_doctors": total_doctors,
        "active_doctors": total_doctors,
        "available_today": len([d for d in all_doctors if calendar.day_name[datetime.now().weekday()] in d.available_days]),
        "booked_slots_today": booked_slots_today,
        "available_slots_remaining": available_slots_remaining,
        "estimated_waiting_time_minutes": estimated_wait_time,
        "doctor_utilization_percent": utilization,
        "recommendation": recommendation
    }

@app.post("/appointments/book")
def book_appointment(payload: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    
    # Check if slot is already booked
    existing = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == payload.doctor_id,
        models.Appointment.appointment_date == payload.appointment_date,
        models.Appointment.appointment_time == payload.appointment_time
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")

    # Create patient
    patient = models.Patient(
        name=payload.name,
        opd_type=payload.opd_type,
        status="waiting"
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 🔥 Create appointment (IMPORTANT)
    appointment = models.Appointment(
        patient_id=patient.id,
        doctor_id=payload.doctor_id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        status="waiting"
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Auto assign doctor
    assign_doctors(db)

    return {
        "message": "Appointment booked",
        "appointment_id": appointment.id,   # ✅ UNIQUE ID
        "patient_id": patient.id
    }

@app.get("/doctors/{doctor_id}/slots")
def get_doctor_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    from datetime import datetime, timedelta
    import calendar
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    day_name = calendar.day_name[date_obj.weekday()]
    
    if day_name not in doctor.available_days:
        return {"error": "Doctor not available on this day"}
        
    start_time = datetime.strptime(doctor.start_time, "%H:%M")
    end_time = datetime.strptime(doctor.end_time, "%H:%M")
    duration = doctor.appointment_duration
    
    slots = []
    current_time = start_time
    while current_time + timedelta(minutes=duration) <= end_time:
        slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=duration)
        
    # Find booked slots
    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.appointment_date == date
    ).all()
    booked_slots = [a.appointment_time for a in appointments]
    
    result = []
    for slot in slots:
        result.append({
            "time": slot,
            "status": "Booked" if slot in booked_slots else "Available"
        })
        
    return result

@app.get("/doctors/list")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(models.Doctor).all()

    return [
        {
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization
        }
        for doctor in doctors
    ]



@app.get("/analytics/doctor-workload")
def doctor_workload(db: Session = Depends(get_db)):

    doctors = db.query(models.Doctor).all()
    result = []

    for doctor in doctors:
        count = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.status == "in_consultation"
        ).count()

        result.append({
            "name": doctor.name,   # ✅ IMPORTANT
            "patients": count
        })

    return result

@app.get("/analytics/queue-distribution")
def queue_distribution(db: Session = Depends(get_db)):

    waiting = db.query(models.Patient).filter(
        models.Patient.status == "waiting"
    ).count()

    assigned = db.query(models.Patient).filter(
        models.Patient.status == "in_consultation"
    ).count()

    completed = db.query(models.Patient).filter(
        models.Patient.status == "completed"
    ).count()

    return [
        {"name": "Waiting", "value": waiting},
        {"name": "Assigned", "value": assigned},
        {"name": "Completed", "value": completed}
    ]
@app.get("/appointments/status/{appointment_id}")
def check_status(appointment_id: int, db: Session = Depends(get_db)):

    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {"message": "Not found"}

    # 🔥 ALWAYS use appointment status
    status = appointment.status

    # Patient
    patient = db.query(models.Patient).filter(
        models.Patient.id == appointment.patient_id
    ).first()

    # Doctor
    doctor_name = "Not Assigned"

    if appointment.doctor_id:
        doctor = db.query(models.Doctor).filter(
            models.Doctor.id == appointment.doctor_id
        ).first()

        if doctor:
            doctor_name = doctor.name

    return {
        "patient_name": patient.name if patient else None,
        "status": status,              # ✅ FROM APPOINTMENT
        "doctor": doctor_name
    }

@app.post("/appointments/complete/{appointment_id}")
def complete_appointment(appointment_id: int, db: Session = Depends(get_db)):

    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {"message": "Not found"}

    # 🔥 Update appointment
    appointment.status = "completed"

    # 🔥 Update patient
    patient = db.query(models.Patient).filter(
        models.Patient.id == appointment.patient_id
    ).first()

    if patient:
        patient.status = "completed"

    db.commit()

    # 🔥 Assign next patient
    assign_doctors(db)

    return {"message": "Completed"}


@app.get("/patients/list")
def get_patients(db: Session = Depends(get_db)):

    patients = db.query(models.Patient).all()
    result = []

    for p in patients:

        # 🔥 get latest appointment (ANY status except completed)
        appointment = db.query(models.Appointment).filter(
            models.Appointment.patient_id == p.id,
            models.Appointment.status != "completed"
        ).order_by(models.Appointment.id.desc()).first()

        doctor_name = "Not Assigned"
        appointment_id = None

        if appointment:
            appointment_id = appointment.id

            doctor = db.query(models.Doctor).filter(
                models.Doctor.id == appointment.doctor_id
            ).first()

            if doctor:
                doctor_name = doctor.name

        result.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "doctor": doctor_name,
            "appointment_id": appointment_id
        })

    return result

