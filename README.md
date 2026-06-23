# 💓 CareFlux — Smart OPD Queue Management System

A full-stack healthcare platform for managing outpatient department (OPD) operations including patient registration, doctor management, appointment booking, automated queue management, and real-time analytics.

---

## Tech Stack

**Frontend:**
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Recharts

**Backend:**
- FastAPI
- Python
- SQLAlchemy ORM
- SQLite Database

**Communication:**
- REST APIs
- WebSocket (real-time updates)

---

## Features

- 📊 Real-time analytics dashboard with live KPIs and charts
- 📝 Patient registration and appointment booking (4-step wizard)
- 👨‍⚕️ Doctor management with schedule configuration
- 🔄 Automated queue management and doctor assignment
- ⏱️ Dynamic waiting time estimation
- 🔍 Appointment status tracking with visual timeline
- 🟢 Real-time slot availability with auto-refresh
- 📱 Responsive design (desktop, tablet, mobile)

---

## Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Akashvasudev18/opdflow.git
cd opdflow
```

### 2. Backend Setup

From the **project root directory**:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell/CMD):
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate back to the **project root** (`cd ..`), then setup the frontend:

```bash
cd frontend

# Install dependencies
npm install
```

---

## Running the Project

Open two separate terminal windows starting from the **project root directory**.

### Terminal 1: Start Backend Server

```bash
cd backend

# Activate virtual environment
# Windows (PowerShell/CMD):
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend will be running at: **http://127.0.0.1:8000**

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will be running at: **http://localhost:3000**

---

## API Documentation

Once the backend is running, visit:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## Project Structure

```
opdflow/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/             # API route handlers
│   │   └── services/            # Business logic
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Dashboard
│   │   ├── book/page.tsx        # Book appointment
│   │   ├── doctors/page.tsx     # Doctor management
│   │   ├── status/page.tsx      # Check appointment status
│   │   ├── components/          # Reusable UI components
│   │   └── lib/                 # Types, API layer, hooks
│   └── package.json
│
└── README.md
```

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Author

**Akash Vasudev** — [@Akashvasudev18](https://github.com/Akashvasudev18)
