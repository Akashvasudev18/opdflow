from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import doctors, patients, appointments, analytics, stats, websocket

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareFlux Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(analytics.router)
app.include_router(stats.router)
app.include_router(websocket.router)


@app.get("/")
def root():
    return {"message": "CareFlux Backend Running", "version": "2.0.0"}
