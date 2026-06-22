<p align="center">
  <h1 align="center">💓 CareFlux</h1>
  <p align="center"><strong>Smart OPD Queue Management System</strong></p>
  <p align="center">
    A production-ready, full-stack healthcare platform that automates patient registration, doctor assignment, appointment tracking, queue management, waiting time estimation, and real-time hospital analytics.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Recharts-3.7-8884d8?style=for-the-badge" alt="Recharts" />
  <img src="https://img.shields.io/badge/WebSocket-Realtime-22c55e?style=for-the-badge" alt="WebSocket" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Business Flow](#-business-flow)
- [Screenshots](#-screenshots)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏥 Overview

CareFlux transforms the outpatient department (OPD) experience by digitizing and automating the entire workflow — from patient check-in to doctor consultation to discharge. It eliminates manual queue management, reduces patient wait times, and provides hospital administrators with real-time operational analytics.

### Key Highlights

- 🔄 **Fully Automated Queue** — Patients are auto-assigned to available doctors. When a consultation completes, the next waiting patient is automatically assigned.
- ⏱️ **Dynamic Waiting Time** — Real-time estimation based on active queue depth and available doctor capacity.
- 📊 **Live Analytics Dashboard** — 12 KPI cards, 5 data-driven charts, doctor status panel — all powered by real database queries, zero hardcoded data.
- 🔐 **Unique Appointment IDs** — Every appointment gets a human-readable ID (`CF-20260605-001`) for easy tracking.
- 🩺 **Doctor Schedule Management** — Configure available days, working hours, slot duration, and daily capacity per doctor.

---

## ✨ Features

### For Patients
| Feature | Description |
|---------|-------------|
| 📝 Book Appointment | 4-step wizard with doctor selection and real-time slot availability |
| 🔍 Track Status | Check appointment status by ID with visual timeline |
| ⏳ Wait Time Estimate | See estimated waiting time based on live queue data |
| 🟢 Real-Time Slots | Slot grid updates every 3 seconds — green (available), red (booked) |

### For Administrators
| Feature | Description |
|---------|-------------|
| 👨‍⚕️ Doctor Management | Add, configure, and remove doctors with full schedule control |
| 📊 Analytics Dashboard | Daily trends, hourly flow, department distribution, doctor workload |
| 🔄 Auto Queue Progression | Complete a consultation → next patient auto-assigned |
| 📈 Slot Utilization | Track total/booked/remaining slots in real-time |
| 🩺 Doctor Status Panel | See which doctors are available vs busy, live |

### Technical
| Feature | Description |
|---------|-------------|
| 🌐 WebSocket Support | Real-time event broadcasting with polling fallback |
| 🎨 Glassmorphism UI | Premium healthcare SaaS design with smooth animations |
| 📱 Responsive Design | Works on desktop, tablet, and mobile |
| 🧩 Modular Backend | Clean router/service/model separation (no monolith) |
| 🔒 Conflict Prevention | Double-booking protection with slot-level validation |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Recharts](https://recharts.org/) | Data visualization (charts) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |

### Backend
| Technology | Purpose |
|------------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python API framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | Python ORM for database operations |
| [SQLite](https://www.sqlite.org/) | Lightweight embedded database |
| [Pydantic v2](https://docs.pydantic.dev/) | Data validation and serialization |
| [WebSockets](https://websockets.readthedocs.io/) | Real-time bidirectional communication |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  ┌──────────┬──────────┬──────────┬───────────┐     │
│  │Dashboard │ Doctors  │  Book    │  Status   │     │
│  │ page.tsx │ page.tsx │ page.tsx │ page.tsx  │     │
│  └────┬─────┴────┬─────┴────┬─────┴─────┬─────┘    │
│       │          │          │           │           │
│  ┌────┴──────────┴──────────┴───────────┴────┐      │
│  │  Shared: Sidebar, KPICard, Toast, Modal   │      │
│  │  Lib: types.ts, api.ts, hooks.ts          │      │
│  └───────────────────┬───────────────────────┘      │
└──────────────────────┼──────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────┼──────────────────────────────┐
│                    Backend (FastAPI)                  │
│  ┌───────────────────┴───────────────────────┐      │
│  │              main.py (30 lines)           │      │
│  │         CORS + Router Registration        │      │
│  └───────────────────┬───────────────────────┘      │
│       ┌──────────────┼──────────────┐               │
│  ┌────┴────┐   ┌─────┴─────┐  ┌────┴──────┐        │
│  │ Routers │   │ Services  │  │  Models   │        │
│  │─────────│   │───────────│  │───────────│        │
│  │doctors  │   │queue_svc  │  │Doctor     │        │
│  │patients │   │slot_svc   │  │Patient    │        │
│  │appts    │   │stats_svc  │  │Appointment│        │
│  │analytics│   └───────────┘  └───────────┘        │
│  │stats    │                                        │
│  │websocket│        ┌─────────────┐                 │
│  └─────────┘        │  SQLite DB  │                 │
│                     │ careflux.db │                 │
│                     └─────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Akashvasudev18/opdflow.git
cd opdflow

# 2. Setup Backend
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# 3. Setup Frontend
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1 — Start Backend (from /backend directory)
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — Start Frontend (from /frontend directory)
cd frontend
npm run dev
```

Open your browser and navigate to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📁 Project Structure

```
opdflow/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point (30 lines)
│   │   ├── database.py              # SQLAlchemy engine & session
│   │   ├── models.py                # ORM models (Doctor, Patient, Appointment)
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── doctors.py           # Doctor CRUD + slot generation
│   │   │   ├── patients.py          # Patient CRUD
│   │   │   ├── appointments.py      # Book, complete, status check
│   │   │   ├── analytics.py         # 5 analytics endpoints
│   │   │   ├── stats.py             # Dashboard KPI endpoint
│   │   │   └── websocket.py         # WebSocket connection manager
│   │   └── services/
│   │       ├── queue_service.py      # Auto-assignment & waiting time
│   │       ├── slot_service.py       # Slot generation & conflict check
│   │       └── stats_service.py      # Dashboard stats & analytics
│   ├── requirements.txt
│   └── careflux.db                   # SQLite database (auto-created)
│
└── frontend/
    ├── app/
    │   ├── page.tsx                  # Dashboard (analytics, KPIs, charts)
    │   ├── book/page.tsx             # 4-step appointment booking wizard
    │   ├── doctors/page.tsx          # Doctor management (CRUD)
    │   ├── status/page.tsx           # Appointment status tracker
    │   ├── layout.tsx                # Root layout
    │   ├── globals.css               # Design system & CSS variables
    │   ├── lib/
    │   │   ├── types.ts              # TypeScript interfaces
    │   │   ├── api.ts                # Centralized API layer
    │   │   └── hooks.ts              # Custom React hooks
    │   └── components/
    │       ├── Sidebar.tsx           # Navigation sidebar
    │       ├── PageLayout.tsx        # Page wrapper with sidebar
    │       ├── KPICard.tsx           # Animated KPI card
    │       ├── Toast.tsx             # Toast notifications
    │       ├── ConfirmModal.tsx      # Confirmation modal
    │       ├── SkeletonLoader.tsx    # Loading skeleton
    │       └── charts/              # Recharts chart components
    ├── .env.local                    # API URL configuration
    ├── package.json
    └── tsconfig.json
```

---

## 📡 API Reference

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/doctors` | Create a new doctor |
| `GET` | `/doctors` | List all active doctors with status |
| `GET` | `/doctors/{id}` | Get doctor details |
| `PUT` | `/doctors/{id}` | Update doctor info |
| `DELETE` | `/doctors/{id}` | Soft delete a doctor |
| `GET` | `/doctors/{id}/slots?date=YYYY-MM-DD` | Get available time slots |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/appointments/book` | Book appointment (auto-assigns doctor) |
| `GET` | `/appointments/status/{id}` | Check status by appointment ID |
| `POST` | `/appointments/complete/{id}` | Complete consultation & auto-assign next |
| `GET` | `/appointments/today` | List today's appointments |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/opd/stats` | 12 dashboard KPIs |
| `GET` | `/analytics/daily-appointments` | 7-day appointment trend |
| `GET` | `/analytics/hourly-flow` | Today's hourly patient flow |
| `GET` | `/analytics/department-distribution` | Patients per department |
| `GET` | `/analytics/doctor-workload` | Today's appointments per doctor |
| `GET` | `/analytics/status-distribution` | Waiting/Consultation/Completed |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/patients` | Create a patient |
| `GET` | `/patients` | List patients (paginated) |
| `GET` | `/patients/list` | List with doctor assignment details |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/opd` | Real-time event stream |

---

## 🔄 Business Flow

```
┌─────────────────────────────────────────────────┐
│              PATIENT FLOW                        │
│                                                  │
│  Patient Books    →   System Generates           │
│  Appointment          CF-20260605-001            │
│       │                                          │
│       ▼                                          │
│  Patient enters   →   Status: WAITING            │
│  waiting queue                                   │
│       │                                          │
│       ▼                                          │
│  Auto-assign to   →   Status: IN_CONSULTATION    │
│  available doctor                                │
│       │                                          │
│       ▼                                          │
│  Doctor completes →   Status: COMPLETED          │
│  consultation                                    │
│       │                                          │
│       ▼                                          │
│  Doctor becomes   →   Next waiting patient       │
│  available            auto-assigned              │
└─────────────────────────────────────────────────┘
```

### Waiting Time Formula

```
waiting_time = (waiting_patients / doctors_serving) × 10 minutes

Where:
  - waiting_patients = patients currently in "waiting" status
  - doctors_serving  = available doctors (or total active if all busy)
  - 10 minutes       = average consultation duration
```

---

## 🖼️ Screenshots

> Add screenshots of your running application here.

| Dashboard | Book Appointment |
|-----------|------------------|
| Analytics, KPIs, Charts, Doctor Panel | 4-step wizard with real-time slots |

| Doctor Management | Status Check |
|-------------------|--------------|
| CRUD with schedule configuration | Timeline visualization & wait time |

---

## 🔮 Future Roadmap

| Feature | Status |
|---------|--------|
| 🔔 Push Notifications | Planned |
| 📱 SMS Alerts | Planned |
| 📧 Email Notifications | Planned |
| 💡 Health Tips Section | Planned |
| 🎥 Educational Videos While Waiting | Planned |
| 🤖 AI Appointment Scheduling | Planned |
| 📲 Mobile Application | Planned |
| 🔐 Authentication & Authorization | Planned |
| 🐳 Docker Containerization | Planned |
| ☁️ Cloud Deployment | Planned |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Akash Vasudev**
- GitHub: [@Akashvasudev18](https://github.com/Akashvasudev18)

---

<p align="center">
  Made with ❤️ for better healthcare
</p>
