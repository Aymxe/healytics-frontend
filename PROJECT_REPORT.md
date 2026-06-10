# Healytics — Full Project Documentation Report

> **Platform:** Secure Healthcare Intelligence System  
> **Version:** 1.0  
> **Date:** June 2026  
> **Stack:** React · Node.js/Express · MySQL · Tailwind CSS

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [Backend API Reference](#5-backend-api-reference)
6. [Frontend Pages & Components](#6-frontend-pages--components)
7. [Authentication & Security](#7-authentication--security)
8. [User Roles & Permissions](#8-user-roles--permissions)
9. [Key Features](#9-key-features)
10. [File Structure](#10-file-structure)

---

## 1. System Overview

Healytics is a full-stack healthcare management platform designed for three types of users:

| Role | Description |
|------|-------------|
| **Patient** | Register, book appointments, view medical file, chat with AI assistant |
| **Doctor** | Manage appointments, view patient history, add medical records |
| **Admin** | Monitor system stats, manage doctors/patients, view activity logs |

The system integrates an AI-powered symptom diagnosis chatbot (Claude Haiku) that helps patients identify the appropriate medical specialty before booking an appointment.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                    │
│              React SPA — port 3000                      │
│  React Router · Axios · Tailwind CSS · Context API      │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP/REST (JSON)
                      │  Authorization: Bearer <JWT>
┌─────────────────────▼───────────────────────────────────┐
│                  BACKEND (Server)                        │
│             Node.js / Express — port 5000               │
│  JWT Auth · bcrypt · Role middleware · mysql2           │
└─────────────────────┬───────────────────────────────────┘
                      │  SQL queries (mysql2 pool)
┌─────────────────────▼───────────────────────────────────┐
│                  DATABASE                                │
│                MySQL 8.0 — port 3306                    │
│  12 tables · InnoDB · Foreign key constraints           │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│               EXTERNAL API (optional)                    │
│           Anthropic Claude Haiku API                    │
│        AI symptom diagnosis in Chatbot                  │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

```
User action → React component → Axios (+ JWT header)
    → Express route → verifyToken middleware
    → verifyRole middleware → Controller
    → MySQL query → JSON response
    → React state update → UI re-render
```

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Utility-first styling |
| Context API | built-in | State management (Auth, Toast, Notifications) |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | LTS | Runtime |
| Express | 5.x | Web framework |
| mysql2 | 3.x | MySQL driver with promise pool |
| bcryptjs | 3.x | Password hashing (12 salt rounds) |
| jsonwebtoken | 9.x | JWT generation & verification |
| dotenv | 17.x | Environment variable management |
| nodemon | 3.x | Dev auto-restart |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0.45 | Relational database |
| InnoDB | - | Storage engine with FK support |

### External Services

| Service | Purpose |
|---------|---------|
| Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) | AI symptom diagnosis chatbot |

---

## 4. Database Schema

### Entity Relationship Overview

```
users ──────────────── (RefID links to patients / doctors / adminprofiles)
patients ──────────── appointments ─────── doctors
patients ──────────── medicalrecords
patients ──────────── prescriptions
doctors  ──────────── doctorschedule
doctors  ──────────── hospitals
adminprofiles ──────── adminlog
adminprofiles ──────── adminactions
```

---

### Table: `users`
Central authentication table for all system users.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| UserID | VARCHAR(10) | PK | e.g., U001 |
| RefID | VARCHAR(10) | NULL | Links to PatientID / DoctorID / AdminID |
| FullName | VARCHAR(100) | NULL | |
| Email | VARCHAR(150) | UNIQUE | |
| Password | VARCHAR(255) | NULL | bcrypt hash |
| Role | VARCHAR(20) | NULL | 'Patient', 'Doctor', 'Admin' |
| IsActive | TINYINT(1) | NULL | 1 = active |
| CreatedDate | DATE | NULL | |
| LastLogin | DATE | NULL | |

---

### Table: `patients`
Patient profile and medical metadata.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| PatientID | VARCHAR(10) | PK | e.g., P001 |
| Name | VARCHAR(100) | NULL | |
| Age | INT | NULL | |
| Gender | VARCHAR(10) | NULL | 'Male' / 'Female' |
| Condition | VARCHAR(20) | NULL | 'Stable', 'Chronic', 'Emergency', 'Recovering' |
| LastVisit | DATE | NULL | |
| SymptomInput | VARCHAR(300) | NULL | From AI chatbot |
| RecommendedSpecialty | VARCHAR(100) | NULL | From AI chatbot |

---

### Table: `doctors`
Doctor profiles linked to hospitals.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| DoctorID | VARCHAR(10) | PK | e.g., D001 |
| Name | VARCHAR(100) | NULL | |
| Specialty | VARCHAR(100) | NULL | e.g., 'Cardiology' |
| Availability | VARCHAR(20) | NULL | 'Available' / 'Busy' |
| HospitalID | VARCHAR(10) | FK → hospitals | |
| MaxPatients | INT | NULL | Max patients per day |

**Doctors in system:** Dr. Salim (Cardiology), Dr. Layan (Neurology), Dr. Emir (General), Dr. Kristen (Pediatrics), Dr. Turker (Orthopedic), Dr. Haya (General), Dr. Aleyna (General), Dr. Suliman (Physiotherapy)

---

### Table: `doctorschedule`
Weekly schedule for each doctor.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| ScheduleID | VARCHAR(10) | PK | e.g., SCH001 |
| DoctorID | VARCHAR(10) | FK → doctors | |
| DoctorName | VARCHAR(100) | NULL | Denormalized |
| Day | VARCHAR(15) | NULL | 'Sunday', 'Monday', etc. |
| StartTime | VARCHAR(10) | NULL | e.g., '09:00' |
| EndTime | VARCHAR(10) | NULL | e.g., '14:00' |
| HospitalID | VARCHAR(10) | FK → hospitals | |
| RoomNumber | VARCHAR(15) | NULL | e.g., 'C-204' |
| MaxPatients | INT | NULL | |

---

### Table: `appointments`
Booking records between patients and doctors.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| AppointmentID | VARCHAR(10) | PK | e.g., A001 |
| PatientID | VARCHAR(10) | FK → patients | |
| DoctorID | VARCHAR(10) | FK → doctors | |
| AppointmentDate | DATE | NULL | YYYY-MM-DD |
| Status | VARCHAR(20) | NULL | 'Pending', 'Confirmed', 'Completed', 'Cancelled' |

---

### Table: `medicalrecords`
Visit records added by doctors.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| RecordID | VARCHAR(10) | PK | e.g., R001 |
| PatientID | VARCHAR(10) | FK → patients | |
| Diagnosis | VARCHAR(150) | NULL | |
| Treatment | VARCHAR(150) | NULL | |
| DoctorName | VARCHAR(100) | NULL | Denormalized |
| VisitDate | DATE | NULL | |
| SymptomInput | VARCHAR(300) | NULL | |
| Specialty | VARCHAR(100) | NULL | |

---

### Table: `prescriptions`
Active medication prescriptions.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| PrescriptionID | VARCHAR(10) | PK | e.g., PR001 |
| RecordID | VARCHAR(10) | NULL | Linked to medical record |
| PatientID | VARCHAR(10) | FK → patients | |
| Medication | VARCHAR(100) | NULL | |
| Dosage | VARCHAR(50) | NULL | |
| Frequency | VARCHAR(50) | NULL | |
| DurationDays | INT | NULL | |
| IsActive | TINYINT(1) | NULL | 1 = active |
| SymptomInput | VARCHAR(300) | NULL | |
| RecommendedSpecialty | VARCHAR(100) | NULL | |

---

### Table: `hospitals`
Hospital directory.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| HospitalID | VARCHAR(10) | PK | e.g., H001 |
| Name | VARCHAR(150) | NULL | |
| District | VARCHAR(100) | NULL | Location district |
| Specialties | VARCHAR(300) | NULL | Comma-separated |
| Phone | VARCHAR(25) | NULL | |
| EmergencyPhone | VARCHAR(25) | NULL | |
| TotalDoctors | INT | NULL | |
| Rating | DECIMAL(3,1) | NULL | e.g., 4.9 |
| IsActive | TINYINT(1) | NULL | |
| AssignedDoctors | VARCHAR(300) | NULL | |

**10 hospitals in system** — all in Istanbul, Turkey.

---

### Table: `pharmacies`
Pharmacy directory.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| PharmacyID | VARCHAR(10) | PK | e.g., PH001 |
| Name | VARCHAR(150) | NULL | |
| District | VARCHAR(100) | NULL | |
| Address | VARCHAR(200) | NULL | |
| Phone | VARCHAR(25) | NULL | |
| OpenTime | VARCHAR(10) | NULL | e.g., '08:00' |
| CloseTime | VARCHAR(10) | NULL | e.g., '22:00' |
| Is24Hours | TINYINT(1) | NULL | 1 = 24h |
| Rating | DECIMAL(3,1) | NULL | |
| IsActive | TINYINT(1) | NULL | |

---

### Table: `adminprofiles`
Admin user profiles.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| AdminID | VARCHAR(10) | PK | e.g., ADM001 |
| FullName | VARCHAR(100) | NULL | |
| Role | VARCHAR(50) | NULL | e.g., 'Hospital Manager' |
| Email | VARCHAR(150) | NULL | |
| Phone | VARCHAR(25) | NULL | |
| Department | VARCHAR(100) | NULL | |
| AccessLevel | VARCHAR(50) | NULL | e.g., 'Full Access' |
| IsActive | TINYINT(1) | NULL | |
| CreatedDate | DATE | NULL | |

---

### Table: `adminlog`
Login activity log for admins.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| LogID | VARCHAR(10) | PK | e.g., AL001 |
| AdminID | VARCHAR(10) | FK → adminprofiles (nullable) | |
| AdminName | VARCHAR(100) | NULL | |
| Role | VARCHAR(50) | NULL | |
| LoginDate | DATE | NULL | |
| LoginTime | VARCHAR(10) | NULL | e.g., '08:15' |
| DurationMin | INT | NULL | Session duration in minutes |
| IPAddress | VARCHAR(20) | NULL | |
| DeviceType | VARCHAR(20) | NULL | 'Desktop', 'Mobile', 'Tablet' |
| Status | VARCHAR(10) | NULL | 'Success' / 'Failed' |

---

### Table: `adminactions`
Audit trail of admin operations.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| ActionID | VARCHAR(10) | PK | e.g., ACT001 |
| AdminID | VARCHAR(10) | FK → adminprofiles | |
| AdminName | VARCHAR(100) | NULL | |
| Role | VARCHAR(50) | NULL | |
| ActionDate | DATE | NULL | |
| ActionType | VARCHAR(30) | NULL | 'View Report', 'Update Record', etc. |
| TargetTable | VARCHAR(30) | NULL | |
| TargetID | VARCHAR(20) | NULL | |
| Description | VARCHAR(300) | NULL | |
| Result | VARCHAR(10) | NULL | 'Success' / 'Failed' |

---

## 5. Backend API Reference

**Base URL:** `http://localhost:5000/api`  
**Auth:** All protected routes require `Authorization: Bearer <token>` header.

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/login` | ❌ | Any | Login, returns JWT + user info. Admin login also creates adminlog entry. |
| POST | `/register` | ❌ | Any | Register new user. For Patient role, auto-creates patient record and generates PatientID. |
| POST | `/logout` | ✅ | Any | Updates adminlog session duration on logout. |

**POST /login body:**
```json
{ "email": "string", "password": "string", "role": "Patient|Doctor|Admin" }
```
**POST /login response:**
```json
{ "token": "jwt", "logID": "AL001|null", "user": { "userID", "refID", "fullName", "email", "role" } }
```

**POST /register body:**
```json
{ "fullName": "string", "email": "string", "password": "string", "role": "Patient", "age": 25, "gender": "Male", "phone": "string" }
```

---

### Patient Routes — `/api/patients`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Admin, Doctor | Get all patients |
| GET | `/:id` | ✅ | Any | Get patient by PatientID |
| GET | `/:id/medical-file` | ✅ | Any | Full medical file: patient + records + prescriptions + appointments |
| GET | `/:id/appointments` | ✅ | Any | Patient's appointment history with DoctorName + Specialty |
| POST | `/book` | ✅ | Patient, Admin | Book new appointment. Checks for date conflicts. Auto-generates AppointmentID (A001...) |

**POST /patients/book body:**
```json
{ "patientID": "P001", "doctorID": "D001", "appointmentDate": "2026-06-15", "reason": "optional" }
```

---

### Doctor Routes — `/api/doctors`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | All doctors with HospitalName (JOIN) |
| GET | `/:id` | ✅ | Any | Single doctor with HospitalName |
| GET | `/:id/schedule` | ✅ | Any | Doctor's weekly schedule (Day, StartTime, EndTime, RoomNumber) |
| GET | `/:id/appointments` | ✅ | Doctor, Admin | Doctor's appointments with patient details |
| PUT | `/appointments/:appointmentID/status` | ✅ | Doctor, Admin | Update appointment status (Completed/Cancelled/Pending/Confirmed) |
| POST | `/medical-record` | ✅ | Doctor, Admin | Add medical record for a patient |

---

### Appointment Routes — `/api/appointments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Admin, Doctor | All appointments with patient + doctor info |
| GET | `/status/:status` | ✅ | Admin, Doctor | Filter by status |
| GET | `/:id` | ✅ | Any | Single appointment |
| PUT | `/:id/cancel` | ✅ | Any | Cancel an appointment |

---

### Hospital Routes — `/api/hospitals`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | All active hospitals (IsActive = 1) |
| GET | `/:id` | ✅ | Any | Single hospital |
| GET | `/specialty/:specialty` | ✅ | Any | Filter hospitals by specialty (LIKE search) |

---

### Pharmacy Routes — `/api/pharmacies`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | All active pharmacies |
| GET | `/open` | ✅ | Any | 24-hour pharmacies only (Is24Hours = 1) |
| GET | `/:id` | ✅ | Any | Single pharmacy |

---

### Medical Records Routes — `/api/medical`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Admin, Doctor | All records with PatientName |
| GET | `/:id` | ✅ | Any | Single record |
| GET | `/patient/:patientID` | ✅ | Any | All records for a patient |

---

### Prescription Routes — `/api/prescriptions`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Admin, Doctor | All prescriptions with PatientName |
| GET | `/patient/:patientID` | ✅ | Any | Patient's prescriptions |
| GET | `/active` | ✅ | Any | All active prescriptions (IsActive = 1) |
| POST | `/` | ✅ | Doctor, Admin | Add new prescription |

---

### Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/stats` | ✅ | Admin | Dashboard stats: totalPatients, totalDoctors, totalAppointments, completionRate, activePrescriptions, totalHospitals, totalPharmacies |
| GET | `/doctors` | ✅ | Admin | All doctors with HospitalName |
| GET | `/patients` | ✅ | Admin | All patients |
| GET | `/logs` | ✅ | Admin | Admin login logs (newest first) |
| GET | `/actions` | ✅ | Admin | Admin action audit trail |
| PUT | `/doctors/:id/availability` | ✅ | Admin | Toggle doctor availability (Available ↔ Busy) |

---

### Chat Route — `/api/chat`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/` | ✅ | Any | Send messages to Claude Haiku AI. Returns symptom analysis and specialist recommendation. |

**POST /chat body:**
```json
{ "messages": [{ "role": "user", "text": "I have chest pain" }] }
```

---

## 6. Frontend Pages & Components

### Pages

#### Public (no auth required)
| Route | File | Description |
|-------|------|-------------|
| `/login` | `Login.jsx` | 3-tab login (Patient/Doctor/Admin) with password visibility toggle |
| `/signup` | `SignUp.jsx` | 2-step patient registration: credentials → health profile |
| `*` | `NotFound.jsx` | 404 page with role-aware back button |

#### Patient (role: Patient)
| Route | File | Description |
|-------|------|-------------|
| `/patient` | `PatientDashboard.jsx` | Overview: upcoming appointments, available doctors, nearby pharmacies + hospitals. Includes AI Chatbot. |
| `/patient/medical-file` | `MedicalFile.jsx` | Full medical history: visits, prescriptions, appointments. Export report as .txt file. |
| `/patient/appointments` | `Appointments.jsx` | View all appointments, book new (date + time slot + reason), cancel with confirmation modal |
| `/patient/doctors` | `Doctors.jsx` | Browse all doctors with specialty filter + search. Shows availability status. |
| `/patient/pharmacies` | `Pharmacies.jsx` | Pharmacy directory with 24h filter + search |
| `/patient/hospitals` | `Hospitals.jsx` | Hospital directory with search by name/district/specialty. Shows rating. |

#### Doctor (role: Doctor)
| Route | File | Description |
|-------|------|-------------|
| `/doctor` | `DoctorDashboard.jsx` | Patient queue for today. Click patient to see details, update status, add medical record. |
| `/doctor/schedule` | `DoctorSchedule.jsx` | Weekly schedule from DB + all appointments grouped by day with status filter |
| `/doctor/patients` | `DoctorPatients.jsx` | Two-panel patient search: list on left, detail on right. Visit history + add medical record. |

#### Admin (role: Admin)
| Route | File | Description |
|-------|------|-------------|
| `/admin` | `AdminDashboard.jsx` | Stats overview (7 metrics) + inline tabs for doctors/logs |
| `/admin/doctors` | `AdminDoctors.jsx` | Doctor management table with search, availability filter, toggle status |
| `/admin/patients` | `AdminPatients.jsx` | Patient table with condition filter (Emergency/Chronic/Stable) + search |
| `/admin/logs` | `AdminLogs.jsx` | Admin login activity log with Success/Failed filter. Shows IP, device, duration. |

---

### Components

| Component | File | Description |
|-----------|------|-------------|
| `Sidebar` | `Sidebar.jsx` | Role-aware navigation menu. Shows notification badge on Appointments for patients. |
| `Chatbot` | `Chatbot.jsx` | Floating AI assistant. Sends message history to `/api/chat`, auto-scrolls, reset button. |
| `ProtectedRoute` | `ProtectedRoute.jsx` | Wraps routes with auth check + role enforcement. Redirects to correct dashboard on wrong role. |
| `ConfirmModal` | `ConfirmModal.jsx` | Reusable "Are you sure?" dialog with backdrop blur. Used for appointment cancellation. |
| `EmptyState` | `EmptyState.jsx` | Friendly empty state with icon + title + subtitle + optional action button. |
| `Navbar` | `Navbar.jsx` | Exists but not actively used in current routing. |

---

### Contexts

| Context | File | Description |
|---------|------|-------------|
| `AuthContext` | `AuthContext.js` | Stores user + token. Persists to localStorage. Handles login (stores logID + loginTimestamp) and async logout (calls API to update duration). |
| `ToastContext` | `ToastContext.js` | Global toast notifications. `showToast(message, type)` — auto-dismisses after 3s. Types: success/error/info/warning. |
| `NotificationContext` | `NotificationContext.js` | Tracks appointment status changes for notification badge. Compares current vs. stored statuses in localStorage. Badge clears when patient opens Appointments page. |

---

### Services

| File | Description |
|------|-------------|
| `src/services/api.js` | Axios instance with base URL + auth interceptor (injects JWT). 401 response interceptor clears token and redirects to login. Exports: `authAPI`, `patientAPI`, `doctorAPI`, `appointmentAPI`, `hospitalAPI`, `pharmacyAPI`, `adminAPI`, `medicalAPI`, `prescriptionAPI`, `chatAPI`. |

---

## 7. Authentication & Security

### Authentication Flow

```
1. User submits login form
2. POST /api/auth/login with { email, password, role }
3. Backend: find user by email + role in users table
4. Backend: bcrypt.compare(password, stored_hash)
5. If match: jwt.sign({ userID, refID, fullName, email, role }, SECRET, { expiresIn: '24h' })
6. Frontend: store token + user + logID + loginTimestamp in localStorage
7. Every subsequent request: Authorization: Bearer <token>
8. Backend verifyToken middleware: jwt.verify(token, SECRET)
9. verifyRole middleware: check req.user.role against allowed roles
```

### Security Features

| Feature | Implementation |
|---------|---------------|
| **Password hashing** | bcryptjs with 12 salt rounds |
| **JWT tokens** | 24-hour expiry, signed with secret key |
| **Role-based access** | `verifyRole()` middleware on every protected route |
| **Protected routes** | Frontend `ProtectedRoute` component checks auth + role |
| **Auto-logout on 401** | Axios interceptor clears localStorage and redirects |
| **Input validation** | Backend validates required fields before DB operations |
| **SQL injection prevention** | Parameterized queries via mysql2 (`?` placeholders) |
| **Transaction integrity** | Patient registration uses DB transaction (BEGIN/COMMIT/ROLLBACK) |
| **Admin audit logging** | Every Admin login/logout recorded in adminlog with IP + device |
| **CORS** | Enabled on backend for cross-origin requests |

### Password Hashing
```javascript
const salt = await bcrypt.genSalt(12); // 12 rounds
const hashedPassword = await bcrypt.hash(password, salt);
// Verification:
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

### JWT Payload Structure
```json
{
  "userID": "U001",
  "refID": "P001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "Patient",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 8. User Roles & Permissions

### Role Matrix

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| Login / Register | ✅ | ✅ (login only) | ✅ (login only) |
| View own appointments | ✅ | — | — |
| Book appointment | ✅ | — | ✅ |
| Cancel appointment | ✅ | — | — |
| View all patients | — | ✅ | ✅ |
| View own patient queue | — | ✅ | — |
| Update appointment status | — | ✅ | ✅ |
| Add medical record | — | ✅ | ✅ |
| Add prescription | — | ✅ | ✅ |
| View system stats | — | — | ✅ |
| Toggle doctor availability | — | — | ✅ |
| View admin logs | — | — | ✅ |
| Use AI chatbot | ✅ | ✅ | ✅ |
| View hospitals / pharmacies | ✅ | ✅ | ✅ |

---

## 9. Key Features

### 1. AI Symptom Diagnosis Chatbot
- Uses **Claude Haiku** (`claude-haiku-4-5-20251001`) via Anthropic API
- System prompt instructs it to: analyze symptoms → recommend specialist → set urgency level (🔴🟡🟢)
- Supports Arabic and English
- Responds concisely (3-5 sentences max)
- Always ends with medical disclaimer
- Conversation history sent on each message for context

### 2. Patient Self-Registration
- 2-step form: credentials → health profile (Age, Gender)
- Backend auto-generates PatientID (`P001`, `P002`, ...)
- Uses DB transaction — if user creation fails, patient record is rolled back
- Patient immediately has full access to all patient features

### 3. Appointment System
- Conflict detection: prevents double-booking same patient on same date
- Status flow: `Pending` → `Confirmed` → `Completed` / `Cancelled`
- Confirmation modal before cancellation
- Doctor can update status from their dashboard
- Patient sees notification badge when status changes

### 4. Notification System
- Stores appointment statuses in `localStorage` on dashboard load
- On next visit, compares fresh data with stored snapshot
- Shows red badge on Appointments menu item if any status changed
- Clears when patient opens the Appointments page

### 5. Admin Activity Log (Real-time)
- Every Admin login creates a record in `adminlog`:
  - LogID, AdminName, LoginDate, LoginTime, IPAddress, DeviceType, Status
- Failed login attempts also logged
- On logout: session duration calculated in frontend (ms since login) and sent to backend
- Backend updates `DurationMin` in adminlog

### 6. Medical File Export
- Generates a formatted `.txt` report with:
  - Patient information
  - All medical records (diagnosis, treatment, date, doctor)
  - Active prescriptions
  - Appointment history
- Downloads as `medical-file-P001-2026-06-09.txt`

### 7. Toast Notification System
- Global context (`ToastContext`)
- Bottom-right corner, stacked
- Auto-dismiss after 3 seconds
- 4 types: success (green) / error (red) / info (blue) / warning (amber)
- Manual dismiss with × button

### 8. Doctor Schedule View
- Fetches actual schedule from `doctorschedule` table (Day, StartTime, EndTime, RoomNumber)
- Groups appointments by day
- Status filter tabs (All / Pending / Confirmed / Completed / Cancelled)
- Inline Complete/Cancel buttons for Pending appointments

---

## 10. File Structure

```
healytics-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Chatbot.jsx          ← AI symptom chatbot (floating)
│   │   ├── ConfirmModal.jsx     ← "Are you sure?" reusable dialog
│   │   ├── EmptyState.jsx       ← Empty list illustration component
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx   ← Auth + role gate
│   │   └── Sidebar.jsx          ← Role-aware nav + notification badge
│   ├── context/
│   │   ├── AuthContext.js       ← JWT + user state + login/logout
│   │   ├── NotificationContext.js ← Appointment badge tracking
│   │   └── ToastContext.js      ← Global toast system
│   ├── pages/
│   │   ├── Login.jsx            ← 3-role login with password toggle
│   │   ├── SignUp.jsx           ← 2-step patient registration
│   │   ├── NotFound.jsx         ← 404 page
│   │   ├── PatientDashboard.jsx ← Patient home
│   │   ├── MedicalFile.jsx      ← Medical history + export
│   │   ├── Appointments.jsx     ← Book + view + cancel
│   │   ├── Doctors.jsx          ← Doctor browser with filter
│   │   ├── Pharmacies.jsx       ← Pharmacy directory
│   │   ├── Hospitals.jsx        ← Hospital directory
│   │   ├── DoctorDashboard.jsx  ← Doctor home + patient queue
│   │   ├── DoctorSchedule.jsx   ← Schedule + all appointments
│   │   ├── DoctorPatients.jsx   ← Patient search + medical record add
│   │   ├── AdminDashboard.jsx   ← Stats overview
│   │   ├── AdminDoctors.jsx     ← Doctor management
│   │   ├── AdminPatients.jsx    ← Patient management
│   │   └── AdminLogs.jsx        ← Activity log viewer
│   ├── services/
│   │   └── api.js               ← Axios instance + all API calls
│   └── App.js                   ← Routes + provider tree

healthiq-backend/
├── config/
│   └── db.js                    ← mysql2 promise pool
├── controllers/
│   ├── authController.js        ← login / register / logout
│   ├── patientController.js     ← patient CRUD + booking
│   ├── doctorController.js      ← doctor CRUD + records
│   └── appointmentController.js ← appointment CRUD + cancel
├── middleware/
│   └── auth.js                  ← verifyToken + verifyRole
├── routes/
│   ├── auth.js
│   ├── patients.js
│   ├── doctors.js
│   ├── appointments.js
│   ├── hospitals.js
│   ├── pharmacies.js
│   ├── medicalrecords.js
│   ├── prescriptions.js
│   ├── admin.js
│   └── chat.js                  ← Claude AI endpoint
├── .env                         ← DB credentials + JWT_SECRET + ANTHROPIC_API_KEY
└── server.js                    ← Express app entry point

Database:
└── healthiq_db.sql              ← Full MySQL dump (schema + seed data)
    Tables: users, patients, doctors, doctorschedule,
            appointments, medicalrecords, prescriptions,
            hospitals, pharmacies, adminprofiles,
            adminlog, adminactions
```

---

## Environment Variables

**`healthiq-backend/.env`**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your_password>
DB_NAME=healthiq_db
JWT_SECRET=healytics_secret_key_2025
PORT=5000
ANTHROPIC_API_KEY=<your_anthropic_api_key>
```

> ⚠️ Without `ANTHROPIC_API_KEY`, the chatbot returns a 503 error but the rest of the system works normally.

---

## Quick Start

```bash
# 1. Start MySQL and import database
mysql -u root -p healthiq_db < healthiq_db.sql

# 2. Start Backend
cd healthiq-backend
npm install
npm run dev        # runs on port 5000

# 3. Start Frontend
cd healytics-frontend
npm install
npm start          # runs on port 3000
```

---

*Report generated for Healytics v1.0 — June 2026*
