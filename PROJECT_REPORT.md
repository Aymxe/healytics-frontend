# HEALYTICS: A FULL-STACK WEB-BASED HEALTHCARE MANAGEMENT SYSTEM

**Üsküdar University**
Faculty of Engineering and Natural Sciences
Department of Software Engineering

**Bachelor of Science Thesis**

**Author:** Ayman Alyazouri
**Supervisor:** [Supervisor Name]
**Submission Date:** June 2026
**Istanbul, Turkey**

---

---

# TABLE OF CONTENTS

1. Introduction
   - 1.1 Purpose of the Thesis
   - 1.2 Background
   - 1.3 Hypothesis
   - 1.4 Objectives

2. Materials and Methods
   - 2.1 System Requirements
   - 2.2 Technologies Used
   - 2.3 Methodology

3. Results and Discussion
   - 3.1 Application of the Work
   - 3.2 System Implementation Results
   - 3.3 Database Results
   - 3.4 User Interface Results
   - 3.5 Discussion

4. Conclusion

References

Appendices

---

---

# 1. INTRODUCTION

## 1.1 Purpose of the Thesis

The healthcare sector continues to face systemic operational challenges in the management of patient appointments, medical records, and physician–patient communication. In many clinical environments — particularly in mid-scale hospitals and polyclinics — these processes are still handled through manual methods, paper-based records, or fragmented software tools that do not interoperate effectively. The consequences include scheduling conflicts, delayed access to medical histories, poor communication between administrative staff and clinical personnel, and a general erosion of the patient experience.

This thesis presents **Healytics**, a full-stack web-based Healthcare Information Management System designed to address these shortcomings through a unified, role-aware digital platform. The system was developed as a final-year Software Engineering graduation project at Üsküdar University and represents a practical, deployable solution to the problems described above.

The core motivation behind Healytics originates from three observed deficiencies in conventional healthcare workflows:

**First**, the absence of a centralised appointment management mechanism. In many facilities, patients must call a reception desk, visit in person, or navigate unresponsive portals to schedule, modify, or cancel appointments. There is no intelligent fallback when a physician becomes unavailable — the patient is left to rebook manually. Healytics addresses this by implementing an automated referral engine that, upon physician-initiated cancellation, instantly locates an available physician of the same specialty and creates a new appointment on the patient's behalf, notifying them through the in-platform messaging system.

**Second**, the inaccessibility of consolidated medical histories. A patient's diagnosis records, active prescriptions, and appointment history are rarely available in a single view, particularly when the patient has been seen by multiple physicians. Healytics provides an integrated medical file view that aggregates all three data types, with the ability to export the record as a plain-text file.

**Third**, the lack of intelligent triage support. Most healthcare portals offer no guidance to patients who are uncertain which medical specialty they require. Healytics embeds a conversational AI assistant powered by Anthropic's Claude language model, which analyses the patient's described symptoms and recommends the most appropriate specialty, along with an urgency level indicator.

The target users of Healytics are three distinct actors within the healthcare workflow: **patients**, who interact with the system to manage their appointments, view their medical history, and seek AI-assisted symptom guidance; **physicians**, who manage their daily patient queues, write medical records and prescriptions, and communicate with administrative staff; and **administrators**, who oversee the system's operational health through dashboards, user management panels, activity logs, and direct messaging capabilities.

---

## 1.2 Background

### 1.2.1 Existing Solutions and Related Systems

Several healthcare management platforms exist in the commercial and open-source landscape. Epic Systems and OpenMRS represent enterprise-grade solutions that provide comprehensive electronic health record (EHR) functionality. However, these systems are architecturally complex, require significant infrastructure investment, and are not accessible to smaller clinical environments or student-level deployments. Systems such as OpenEMR and GNU Health are open-source alternatives that offer broader accessibility, but their interfaces are dated, configuration-heavy, and lack modern web application paradigms such as reactive single-page application (SPA) design, REST API architecture, and cloud-native deployment.

Patient-facing appointment portals, such as those offered by Zocdoc or Doctoralia, focus narrowly on the booking workflow and do not extend into clinical record management, physician-side queue management, or administrative oversight. Similarly, telemedicine platforms such as Teladoc address consultation delivery but do not manage the broader operational context of a healthcare facility.

Healytics occupies a middle ground: it is lighter than enterprise EHR systems, more comprehensive than booking-only portals, and fully modern in its technology stack and deployment model. It is not intended to replace large-scale EHR infrastructure but rather to serve as a functionally complete, academically rigorous demonstration of a production-ready healthcare information system.

### 1.2.2 Technologies Selected and Rationale

The project employs a modern full-stack JavaScript architecture. In this project, MySQL is used as the persistence layer, yielding a stack that combines the developer efficiency of JavaScript across both tiers with the relational integrity and transactional guarantees of a structured database system — properties that are particularly important in healthcare data management.

**React.js (v19)** was selected for the frontend on the basis of its component-based architecture, which naturally maps to the modular structure of a multi-role application. React's declarative rendering model, combined with its Context API for state management, allows each role-specific interface — patient dashboard, physician console, administrative panel — to be developed and maintained independently while sharing a common authentication and layout infrastructure.

**Node.js with Express.js (v5)** was chosen for the backend owing to the uniformity of JavaScript across both application tiers, which reduces cognitive overhead and enables shared utility logic. Express's minimalist approach to HTTP routing makes it well-suited for constructing RESTful APIs with fine-grained middleware control, which is essential for implementing the role-based access control system central to Healytics.

**MySQL** was preferred over document-oriented databases because healthcare data is inherently relational. A patient is associated with appointments, each appointment is associated with a physician, and each physician is associated with a hospital and a schedule. These relationships are best expressed through referential integrity constraints and foreign key associations, which MySQL enforces natively. MySQL2 — the Node.js driver used — supports promise-based query execution, enabling clean asynchronous controller logic throughout the backend.

**JSON Web Tokens (JWT)** provide stateless, scalable authentication. Upon successful login, the server issues a signed token containing the user's identifier, role, full name, and reference ID. The client stores this token in `localStorage` and attaches it as a `Bearer` header on every subsequent API call. The `verifyToken` and `verifyRole` middleware functions intercept all protected routes and validate the token before forwarding the request to the controller.

**Anthropic's Claude API** (model: `claude-haiku-4-5-20251001`) provides the AI symptom triage functionality. The Claude Haiku model was selected for its balance of response quality and latency, making it suitable for real-time chat interaction within a web application context.

**Tailwind CSS** was adopted for styling due to its utility-first approach, which eliminates the need for separate stylesheet files and enables rapid, consistent UI development directly within JSX.

**Railway** is used as the cloud deployment platform for both the backend service and the MySQL database instance, with the frontend deployed as a static build.

### 1.2.3 Full-Stack Web Applications in the Healthcare Context

A full-stack web application consolidates the presentation layer, application logic, and data persistence into a single, deployable software system accessible through any standards-compliant browser, without requiring client-side installation. In the healthcare context, this architecture offers several advantages: it eliminates version fragmentation across client devices, simplifies access control enforcement at the server boundary, centralises data at a single persistence endpoint (reducing the risk of record inconsistency), and enables real-time updates to be reflected across all connected sessions.

The shift from desktop-installed hospital software to browser-based systems has been well-documented in the health informatics literature as a key enabler of interoperability and mobility in clinical environments. Healytics reflects this paradigm: its React SPA frontend communicates exclusively with a stateless REST API backend, and both are deployed on cloud infrastructure accessible from any device with internet connectivity.

---

## 1.3 Hypothesis

It is hypothesised that a unified, role-aware web-based healthcare management system will measurably improve the efficiency of the appointment lifecycle, the accessibility of medical record information, and the responsiveness of administrative communication in a simulated clinical environment.

Specifically, the following outcomes are expected upon deployment of Healytics:

1. **Appointment continuity** will improve: when a physician cancels an appointment, the patient will be automatically re-allocated to an available physician of the same specialty without requiring manual intervention, eliminating the gap in care that arises from unhandled cancellations.

2. **Medical record accessibility** will increase: patients, physicians, and administrators will be able to access a complete, chronologically ordered medical history — including diagnosis records, prescriptions, and appointment history — from a single authenticated view.

3. **Physician-patient communication latency** will decrease: the integrated messaging system, supporting bidirectional communication between administrative staff, physicians, and patients, eliminates the need for telephone or paper-based communication channels for routine queries and notifications.

4. **Triage accuracy** will improve for self-referring patients: the AI-assisted symptom analysis tool will guide patients toward the correct specialty before booking, reducing misallocated appointments and improving overall scheduling efficiency.

---

## 1.4 Objectives

The following objectives were defined at the outset of the project:

**O1 — Multi-Role Authentication System:** Implement a secure, token-based authentication mechanism supporting three distinct user roles (Patient, Doctor, Admin), with each role restricted to its own set of routes and interface elements. Password storage must use a cryptographic hashing algorithm.

**O2 — Patient Self-Service Portal:** Develop a patient-facing interface enabling account registration with health profile intake (age, gender, blood type, phone), appointment booking, medical file viewing, AI-assisted symptom triage, and support messaging.

**O3 — Physician Workflow Console:** Develop a physician-facing interface enabling daily patient queue management, appointment status updates, medical record creation, prescription issuance, availability status toggling, and messaging.

**O4 — Administrative Oversight Panel:** Develop an administrator interface enabling system-wide statistics viewing, doctor availability management, patient record browsing, activity log review, and direct messaging to any doctor or patient.

**O5 — Automated Referral Engine:** Implement a backend service that, upon physician-initiated appointment cancellation, automatically identifies an available physician of the same specialty, creates a new appointment for the affected patient, and dispatches a system notification.

**O6 — Healthcare Resource Directory:** Implement browsable directories of hospitals (with specialties, district, and rating) and pharmacies (with operating hours and 24-hour availability indicator).

**O7 — Integrated Messaging System:** Implement a support messaging system enabling users to send messages to administration, enabling administrators to compose and dispatch direct messages to specific users, and providing reply and read-receipt tracking.

**O8 — AI-Powered Symptom Triage Chatbot:** Integrate the Anthropic Claude language model as a conversational symptom analysis assistant, capable of interpreting free-text symptom descriptions, recommending a medical specialty, and estimating case urgency.

**O9 — Backup Physician Provisioning:** Implement a startup service that ensures a minimum of two physicians per medical specialty are present in the database, automatically inserting placeholder physicians where the count falls below this threshold.

**O10 — Cloud Deployment:** Deploy the complete system — frontend SPA, REST API backend, and MySQL database — to a publicly accessible cloud environment.

---

---

# 2. MATERIALS AND METHODS

## 2.1 System Requirements

### 2.1.1 Hardware Requirements

Healytics is a web-based application and therefore imposes no hardware requirements on end-user devices beyond those necessary to run a modern web browser. The following minimum specifications are recommended for the server-side deployment environment:

| Component | Minimum Specification | Deployed Configuration |
|---|---|---|
| Processor | Dual-core 1.5 GHz | Railway cloud (shared vCPU) |
| RAM | 512 MB | Railway Starter plan (512 MB) |
| Storage | 1 GB | Railway MySQL plugin (1 GB) |
| Network | Stable internet connection | Railway CDN |
| Operating System | Linux (server), Any (client) | Railway Linux container |

For local development, the following environment was used:

- **Operating System:** Windows 10 Home (Build 19045)
- **Node.js Runtime:** v18+ LTS
- **MySQL Server:** v8.0.45

### 2.1.2 Software Requirements

**Server-Side (Backend):**

| Software | Version | Purpose |
|---|---|---|
| Node.js | v18+ LTS | JavaScript runtime |
| Express.js | 5.2.1 | HTTP server and routing framework |
| MySQL2 | 3.22.3 | MySQL database driver (promise-based) |
| jsonwebtoken | 9.0.3 | JWT generation and verification |
| bcryptjs | 3.0.3 | Password hashing |
| cors | 2.8.6 | Cross-Origin Resource Sharing middleware |
| dotenv | 17.4.2 | Environment variable management |
| @anthropic-ai/sdk | 0.100.1 | Anthropic Claude API client |
| nodemon | 3.1.14 | Development auto-reload |

**Client-Side (Frontend):**

| Software | Version | Purpose |
|---|---|---|
| React | 19.2.6 | UI component library |
| React DOM | 19.2.6 | DOM rendering for React |
| React Router DOM | 6.30.4 | Client-side routing |
| Axios | 1.16.1 | HTTP client for API communication |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| PostCSS | 8.5.15 | CSS transformation pipeline |
| Autoprefixer | 10.5.0 | CSS vendor prefix automation |
| react-scripts | 5.0.1 | CRA build toolchain |

**Development & Deployment:**

| Software | Purpose |
|---|---|
| Git | Version control |
| Visual Studio Code | Code editor |
| MySQL Workbench | Database design and inspection |
| Railway | Cloud deployment (backend + DB + frontend) |
| Postman | API testing during development |

---

## 2.2 Technologies Used

### 2.2.1 Frontend Framework and Libraries

**React.js (v19.2.6)**
React is an open-source JavaScript library developed by Meta for building user interfaces through a declarative, component-based programming model. In Healytics, React's component architecture allows each screen — the patient dashboard, physician console, admin panel — to be encapsulated as an independent, reusable unit with its own local state management. React's virtual DOM reconciliation engine ensures that only the components whose state has changed are re-rendered, providing efficient update performance without full page refreshes.

**React Router DOM (v6.30.4)**
Client-side routing is implemented using React Router v6, which maps URL paths to page components without triggering full server-side navigations. The application defines 19 distinct routes, partitioned by role, each wrapped in a `ProtectedRoute` higher-order component that validates the authenticated user's role before rendering the target page.

**Axios (v1.16.1)**
All HTTP communication between the frontend and the backend REST API is handled through Axios, a promise-based HTTP client. A centralised Axios instance is created in `src/services/api.js` with the backend base URL configured as:

```javascript
const API_URL = 'https://healytics-backend-production.up.railway.app/api';
```

Two interceptors are attached: a request interceptor that automatically appends the `Authorization: Bearer <token>` header, and a response interceptor that catches `401 Unauthorized` responses and redirects the user to the login page.

**Tailwind CSS (v3.4.19)**
The visual design of Healytics is implemented entirely with Tailwind CSS. The application employs a cohesive colour palette — blue for patient-facing elements, teal for physician-facing elements, and purple for administrative elements — enabling users to immediately recognise their role context from visual cues alone.

### 2.2.2 State Management and Context

React's built-in Context API is used for global state management, with three dedicated context providers:

**AuthContext** manages the authenticated session. On login, the user object and JWT are stored in both `localStorage` and React state. The context exposes `login()`, `logout()`, and `user` to all components.

**ToastContext** provides a global notification system. Components invoke `showToast(message, type)` to display transient overlay notifications for success, error, info, and warning events.

**NotificationContext** tracks unread appointment status changes and exposes an `unreadCount` badge value used in the Sidebar navigation.

### 2.2.3 Backend Framework

**Node.js with Express.js (v5.2.1)**
The backend is implemented as a Node.js application using Express.js as the HTTP framework. The application entry point (`server.js`) registers eleven route modules and applies global middleware:

```javascript
app.use(cors());
app.use(express.json());
```

The backend follows an MVC-inspired architecture:
- **Routes** define URL patterns and middleware chains
- **Controllers** contain business logic and database interaction
- **Middleware** handles cross-cutting concerns (authentication, authorisation)
- **Config** manages database connection pooling

### 2.2.4 Database Technology

**MySQL 8.0 with MySQL2 Driver**
MySQL was selected for Healytics because the healthcare domain's data model is inherently relational: a patient references multiple appointments, each appointment references a physician, each physician references a hospital, and medical records reference both patients and prescriptions. The MySQL2 Node.js driver (v3.22.3) provides a promise-based API that integrates cleanly with `async/await` patterns throughout the backend controllers. A connection pool is configured with a maximum of 10 simultaneous connections.

### 2.2.5 Authentication Method

**JSON Web Tokens (JWT)**
Upon successful credential verification, the backend issues a signed token:

```javascript
const token = jwt.sign(
  { userID, refID, fullName, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

The `verifyToken` middleware validates the token signature and expiry on each protected endpoint. The `verifyRole(...roles)` middleware enforces role-specific access:

```javascript
const verifyRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};
```

**Password Hashing with bcryptjs**
User passwords are hashed using `bcryptjs` with 12 salt rounds for user accounts and 10 rounds for system-generated physician accounts. Login verification uses `bcrypt.compare()`.

### 2.2.6 AI Integration — Anthropic Claude API

The symptom triage chatbot uses the `@anthropic-ai/sdk` (v0.100.1) with model `claude-haiku-4-5-20251001`. The backend route receives the conversation history from the frontend and submits it to the Anthropic Messages API with a medical assistant system prompt. The model is configured with `max_tokens: 512`. The response is returned to the frontend as plain text and rendered in the chat interface within the `PatientDashboard` page.

### 2.2.7 Cloud Deployment — Railway

Railway is a Platform-as-a-Service (PaaS) provider that supports containerised Node.js application deployment with GitHub-integrated continuous delivery. The Healytics backend is deployed as a Railway service with environment variables configured through the Railway dashboard, a managed MySQL plugin database instance, and automatic deployment triggered on push to the main branch.

---

## 2.3 Methodology

### 2.3.1 Development Methodology

The project was developed following an **iterative, feature-driven development** approach, structured into five progressive phases:

- **Phase 1 — Infrastructure Setup:** Repository initialisation, database schema design, Express server scaffolding, React application bootstrap, environment configuration.
- **Phase 2 — Authentication & Core Entities:** JWT authentication, user registration and login, patient and physician entity models, role-based route protection.
- **Phase 3 — Feature Implementation:** Appointment booking, medical record management, prescription system, hospital and pharmacy directories, schedule management.
- **Phase 4 — Advanced Features:** AI chatbot integration, support messaging system, admin dashboard and logging, automated referral engine.
- **Phase 5 — Polish & Deployment:** ESLint warning resolution, UI consistency pass, backup doctor provisioning, Railway deployment, production build optimisation.

### 2.3.2 System Architecture

Healytics follows a classic three-tier architecture:

```
┌─────────────────────────────────────┐
│        PRESENTATION TIER            │
│   React 19 SPA (Tailwind CSS)       │
│   Hosted: Railway Static            │
└───────────────┬─────────────────────┘
                │ HTTPS / REST API (Axios)
┌───────────────▼─────────────────────┐
│        APPLICATION TIER             │
│   Node.js + Express.js (v5)         │
│   JWT Auth · Role Middleware        │
│   Controllers · AI Chat Route       │
│   Hosted: Railway Service           │
└───────────────┬─────────────────────┘
                │ MySQL2 Connection Pool
┌───────────────▼─────────────────────┐
│           DATA TIER                 │
│   MySQL 8.0 (13 tables)             │
│   Hosted: Railway MySQL Plugin      │
└─────────────────────────────────────┘
```

### 2.3.3 Frontend Implementation

The frontend application is structured as follows:

```
src/
├── App.js              — Route definitions and provider composition
├── pages/              — 19 full-page components (one per route)
├── components/         — 6 reusable components
├── context/            — 3 Context providers
└── services/
    └── api.js          — Centralised Axios instance and API methods
```

Routing is defined centrally in `App.js`. Every protected route is wrapped in `<ProtectedRoute allowedRoles={[...]}>` which reads the current user's role from `AuthContext` and redirects to `/login` if the role is not permitted.

### 2.3.4 Backend Implementation

The backend follows the MVC pattern adapted for a REST API:

```
healthiq-backend/
├── server.js           — App bootstrap, middleware, route registration, startup tasks
├── config/db.js        — MySQL2 connection pool factory
├── middleware/auth.js  — verifyToken and verifyRole middleware
├── controllers/        — authController, patientController,
│                         doctorController, appointmentController
└── routes/             — 11 route modules
```

Each route file imports the corresponding controller and applies the authentication middleware chain:

```javascript
router.put('/appointments/:appointmentID/status',
  verifyToken,
  verifyRole('Doctor', 'Admin'),
  updateAppointmentStatus
);
```

### 2.3.5 Database Design

The schema was designed using a normalised relational model. Key decisions:

- **Separation of `users` and domain entities:** The `users` table stores authentication credentials. Each user record links via `RefID` to the appropriate domain table.
- **Soft availability on doctors:** An `Availability` column (`Available`/`Busy`) is toggled rather than deleting records, preserving historical data.
- **Flexible messaging schema:** A `Direction` column and `RecipientID` support both user-to-admin and admin-to-user flows in a single table.
- **Denormalised DoctorName in records:** The attending physician's name is stored as a static string in `medicalrecords` to preserve historical integrity if the physician record is later modified.

### 2.3.6 API Communication

All request bodies are transmitted as `application/json`. HTTP status codes follow standard conventions: `200` for retrieval, `201` for creation, `400` for validation errors, `401` for unauthenticated access, `403` for unauthorised access, `404` for not found, and `500` for server errors.

### 2.3.7 Authentication and Authorisation Mechanisms

The authentication flow:

1. User submits credentials (email, password, role) via the login form.
2. Backend queries `users` for a matching email and role.
3. `bcrypt.compare()` verifies the password against the stored hash.
4. On success, a JWT is generated and returned with the user object.
5. Frontend stores the token in `localStorage` and injects it into `AuthContext`.
6. Subsequent API calls include the token in the `Authorization` header.
7. On logout, the frontend calls `POST /auth/logout` (recording session duration for admin users) and clears `localStorage`.

For admin users, the login event writes a record to `adminlog` capturing `LoginDate`, `LoginTime`, `IPAddress` (from `X-Forwarded-For`), and `DeviceType` (inferred from the `User-Agent` header).

---

---

# 3. RESULTS AND DISCUSSION

## 3.1 Application of the Work

### 3.1.1 Patient Interaction Flow

A patient begins by registering through the two-step `SignUp` form. Step one collects email and password; step two collects the health profile (full name, age, gender, blood type, phone, optional symptom description).

Upon login, the patient accesses the `PatientDashboard` presenting:
- Upcoming appointments with status badges (Pending / Confirmed / Completed / Cancelled)
- Quick-access tiles for Doctors, Pharmacies, Hospitals, and Medical File
- Embedded AI Chatbot for symptom guidance
- Profile editing panel for age and gender

From `Appointments`, the patient books a new appointment by selecting a physician, date, and reason. Existing appointments can be cancelled with a confirmation dialog. If a physician cancels, the patient receives an automatic notification in the `HelpCenter` inbox with details of the newly booked replacement.

The `MedicalFile` page presents the patient's complete health record — diagnosis records, active prescriptions, and appointment history — with a plaintext export function.

The `HelpCenter` allows the patient to send written messages to administration and view responses. Admin-initiated messages appear with a purple "From Admin" badge.

### 3.1.2 Physician Interaction Flow

After login, the physician accesses the `DoctorDashboard` showing:
- Summary statistics: total patients, completed appointments, pending appointments
- Patient queue: all appointments listed chronologically with patient name and symptoms

From the queue, the physician selects a patient to open a detail panel where they can:
- Update appointment status (Confirmed / Completed / Cancelled / Pending)
- Create a medical record (diagnosis and treatment)
- Add a prescription (medication, dosage, frequency, duration)

When status is set to `Cancelled`, the automated referral engine fires immediately.

The `DoctorSchedule` page displays registered working days and hours. The `DoctorPatients` page provides patient search. `DoctorMessages` provides the physician's message inbox — admin messages appear with a purple badge, sent messages show their reply status.

### 3.1.3 Administrator Interaction Flow

The `AdminDashboard` presents KPI statistics: total patients, doctors, appointments, completion rate, active prescriptions, hospitals, and pharmacies.

`AdminDoctors` — view all physicians, toggle availability directly from the table.

`AdminPatients` — full patient register with condition filtering.

`AdminLogs` — administrator login history with date, time, duration, device type, IP address, and status.

`AdminMessages` — split-pane console with Inbox tab (incoming messages from patients/physicians, with role filter and reply interface) and Sent tab (dispatched messages showing recipient name and preview). The `+Compose` button opens a modal to select recipient type (Patient/Doctor), pick a specific recipient from a live-fetched dropdown, enter subject and body.

---

## 3.2 System Implementation Results

### 3.2.1 Completed Feature Matrix

| Feature | Status | Implementation Location |
|---|---|---|
| Multi-role authentication (JWT) | ✅ Complete | `authController.js`, `middleware/auth.js` |
| Patient registration (2-step) | ✅ Complete | `SignUp.jsx`, `routes/auth.js` |
| Role-based route protection | ✅ Complete | `ProtectedRoute.jsx`, `verifyRole()` |
| Patient dashboard | ✅ Complete | `PatientDashboard.jsx` |
| Appointment booking | ✅ Complete | `Appointments.jsx`, `patientController.js` |
| Appointment cancellation | ✅ Complete | `appointmentController.js` |
| Automated referral engine | ✅ Complete | `doctorController.js:updateAppointmentStatus()` |
| Medical record creation | ✅ Complete | `DoctorDashboard.jsx`, `doctorController.js` |
| Prescription management | ✅ Complete | `DoctorDashboard.jsx`, `routes/prescriptions.js` |
| Medical file view + export | ✅ Complete | `MedicalFile.jsx`, `patientController.js` |
| Physician availability toggle | ✅ Complete | `DoctorDashboard.jsx`, `doctorController.js` |
| Doctor schedule view | ✅ Complete | `DoctorSchedule.jsx` |
| Patient search (physician) | ✅ Complete | `DoctorPatients.jsx` |
| Hospital directory | ✅ Complete | `Hospitals.jsx`, `routes/hospitals.js` |
| Pharmacy directory | ✅ Complete | `Pharmacies.jsx`, `routes/pharmacies.js` |
| AI symptom triage chatbot | ✅ Complete | `Chatbot.jsx`, `routes/chat.js` |
| Admin dashboard + stats | ✅ Complete | `AdminDashboard.jsx`, `routes/admin.js` |
| Admin doctor management | ✅ Complete | `AdminDoctors.jsx` |
| Admin patient management | ✅ Complete | `AdminPatients.jsx` |
| Admin activity log | ✅ Complete | `AdminLogs.jsx`, `authController.js` |
| Support messaging (user→admin) | ✅ Complete | `HelpCenter.jsx`, `routes/messages.js` |
| Support messaging (admin→user) | ✅ Complete | `AdminMessages.jsx`, `DoctorMessages.jsx` |
| Admin messaging compose UI | ✅ Complete | `AdminMessages.jsx` (Compose modal) |
| Backup physician provisioning | ✅ Complete | `server.js:ensureBackupDoctors()` |
| Toast notification system | ✅ Complete | `ToastContext.js` |
| Unread appointment badges | ✅ Complete | `NotificationContext.js`, `Sidebar.jsx` |
| Cloud deployment | ✅ Complete | Railway (backend + DB + frontend) |

### 3.2.2 User Registration and Authentication

The registration flow creates two database records. First, a `patients` record with health profile data. Then a `users` record linking to the new patient via `RefID = PatientID`. Sequential IDs are generated by querying the maximum existing ID:

```javascript
const [last] = await db.query(
  'SELECT PatientID FROM patients ORDER BY PatientID DESC LIMIT 1'
);
const lastNum = last.length > 0
  ? parseInt(last[0].PatientID.replace(/\D/g, '')) || 0 : 0;
const newID = `P${String(lastNum + 1).padStart(3, '0')}`;
```

This prefix-plus-zero-padded pattern is used consistently across all entity tables (P001 for patients, D001 for doctors, A001 for appointments, MSG001 for messages).

### 3.2.3 Appointment Lifecycle and Referral Engine

The appointment lifecycle:

```
Pending → Confirmed → Completed
              ↓
          Cancelled
              ↓
    [Referral Engine Fires]
              ↓
    New Appointment (Pending)
    with Alternative Doctor
```

The referral engine logic in `updateAppointmentStatus()`:

1. After marking the appointment `Cancelled`, query the patient, physician, and specialty.
2. Query for an available physician with the same specialty, excluding the cancelling physician.
3. **If found:** Use that physician directly.
4. **If not found:** Dynamically create a new physician record copying the cancelled physician's `HospitalID`, with a hashed default password.
5. Determine the appointment date: if the original date is in the future, reuse it; otherwise schedule for the next calendar day.
6. Insert a new `appointments` record with `Status = 'Pending'`.
7. Insert a `messages` record directed at the patient (`Direction = 'ToUser'`) with formatted notification body.

### 3.2.4 CRUD Operations Summary

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Patient | Registration | Dashboard, Admin panel | Profile update (age/gender) | Not implemented (soft) |
| Doctor | Backup seeding | Directories, dashboards | Availability toggle | Not implemented (soft) |
| Appointment | Booking, Auto-referral | Patient, Doctor, Admin views | Status update | Soft cancel |
| Medical Record | Doctor creates | Medical file view | Not supported | Not supported |
| Prescription | Doctor creates | Medical file view | IsActive toggle | Not supported |
| Message | Patient/Doctor/Admin sends | Inbox views | Mark read, reply, mark seen | Not implemented |

### 3.2.5 Security Implementation

- **SQL Injection Prevention:** All queries use parameterised placeholders (`?`) through MySQL2.
- **Password Hashing:** bcryptjs with 12 salt rounds; login uses `bcrypt.compare()`.
- **JWT Expiry:** Tokens expire after 24 hours.
- **Role Enforcement:** Every protected route declares permitted roles; `verifyRole` returns `403` for violations.
- **CORS Configuration:** Backend permits only the configured frontend domain.
- **Input Validation:** Required fields are validated on every POST/PUT endpoint before database operations.

---

## 3.3 Database Results

### 3.3.1 Entity–Relationship Overview

The Healytics database (`healthiq_db`) contains 13 tables:

```
adminprofiles ──< adminlog
adminprofiles ──< adminactions

users ─── RefID ──> patients
users ─── RefID ──> doctors
users ─── RefID ──> adminprofiles

patients ──< appointments >── doctors
patients ──< medicalrecords
patients ──< prescriptions

doctors ──< doctorschedule
doctors >── hospitals

prescriptions >── medicalrecords

messages (self-contained; RecipientID is a soft reference)
```

### 3.3.2 Table Schemas

**users** — Central authentication table

| Column | Type | Notes |
|---|---|---|
| UserID | VARCHAR(10) | PK |
| RefID | VARCHAR(10) | Points to PatientID / DoctorID / AdminID |
| FullName | VARCHAR(100) | |
| Email | VARCHAR(100) | |
| Password | VARCHAR(255) | bcrypt hash |
| Role | VARCHAR(10) | Patient / Doctor / Admin |
| IsActive | TINYINT(1) | |
| CreatedDate | DATE | |
| LastLogin | DATE | |

**patients**

| Column | Type | Notes |
|---|---|---|
| PatientID | VARCHAR(10) | PK, format P001–Pnnn |
| Name | VARCHAR(100) | |
| Age | INT | |
| Gender | VARCHAR(10) | |
| Condition | VARCHAR(20) | Stable / Emergency / Chronic / Recovering |
| SymptomInput | TEXT | Free-text symptoms |
| RecommendedSpecialty | VARCHAR(50) | AI-recommended specialty |
| BloodType | VARCHAR(5) | |
| Phone | VARCHAR(20) | |

**doctors**

| Column | Type | Notes |
|---|---|---|
| DoctorID | VARCHAR(10) | PK, format D001–Dnnn |
| Name | VARCHAR(100) | |
| Specialty | VARCHAR(50) | |
| Availability | VARCHAR(20) | Available / Busy |
| HospitalID | VARCHAR(10) | FK → hospitals |
| MaxPatients | INT | |

**appointments**

| Column | Type | Notes |
|---|---|---|
| AppointmentID | VARCHAR(10) | PK, format A001–Annn |
| PatientID | VARCHAR(10) | FK → patients |
| DoctorID | VARCHAR(10) | FK → doctors |
| AppointmentDate | DATE | |
| Status | VARCHAR(20) | Pending / Confirmed / Completed / Cancelled |

**medicalrecords**

| Column | Type | Notes |
|---|---|---|
| RecordID | VARCHAR(10) | PK, format R001–Rnnn |
| PatientID | VARCHAR(10) | FK → patients |
| Diagnosis | TEXT | |
| Treatment | TEXT | |
| DoctorName | VARCHAR(100) | Denormalised for record immutability |
| VisitDate | DATE | |
| SymptomInput | TEXT | |
| Specialty | VARCHAR(50) | |

**prescriptions**

| Column | Type | Notes |
|---|---|---|
| PrescriptionID | VARCHAR(10) | PK |
| RecordID | VARCHAR(10) | FK → medicalrecords |
| PatientID | VARCHAR(10) | FK → patients |
| Medication | VARCHAR(100) | |
| Dosage | VARCHAR(50) | |
| Frequency | VARCHAR(50) | |
| DurationDays | INT | |
| IsActive | TINYINT(1) | |

**messages**

| Column | Type | Notes |
|---|---|---|
| MessageID | VARCHAR(10) | PK, format MSG001–MSGnnn |
| SenderID | VARCHAR(10) | Soft ref; may be 'SYSTEM' or 'ADMIN' |
| SenderName | VARCHAR(100) | |
| SenderRole | VARCHAR(20) | Doctor / Patient / Admin / System |
| Subject | VARCHAR(200) | |
| Body | TEXT | |
| Status | VARCHAR(20) | Unread / Read / Replied |
| SentAt | DATETIME | |
| ReplyBody | TEXT | |
| RepliedAt | DATETIME | |
| PatientRead | TINYINT(1) | 0 = unread by recipient |
| RecipientID | VARCHAR(10) | Set for Direction='ToUser' messages |
| RecipientName | VARCHAR(100) | Denormalised |
| Direction | VARCHAR(10) | 'ToUser' = admin-initiated; NULL = user-initiated |

**hospitals** — HospitalID, Name, District, Rating, Specialties, IsActive

**pharmacies** — PharmacyID, Name, OpenTime, CloseTime, Is24Hours, IsActive

**doctorschedule** — ScheduleID, DoctorID (FK), WorkingDays, WorkingHours, HospitalID (FK)

**adminlog** — LogID, AdminName, LoginDate (DATE), LoginTime (VARCHAR), DurationMin, IPAddress, DeviceType, Status

**adminactions** — ActionID, AdminID (FK), ActionType, ActionDate, TargetTable, TargetID, Description, Result

**adminprofiles** — AdminID (PK), FullName, Role, Email, Phone, Department, IsActive

### 3.3.3 Schema Design Decisions

**Denormalisation of DoctorName:** The attending physician's name is stored statically in `medicalrecords.DoctorName` to ensure that record modifications or deletions in the `doctors` table do not retroactively alter historical clinical records.

**Soft foreign keys in messages:** `SenderID` and `RecipientID` are not declared as hard foreign keys to support system-generated messages (`SenderID = 'SYSTEM'`) and admin-initiated messages (`SenderID = 'ADMIN'`).

**Runtime schema migration:** The `routes/messages.js` file executes column additions on startup using a `addCol` helper that catches MySQL error code 1060 (Duplicate column name), ensuring forward compatibility when deploying to an existing database:

```javascript
const addCol = async (col, def) => {
  try {
    await db.query(`ALTER TABLE messages ADD COLUMN ${col} ${def}`);
  } catch (err) {
    if (err.errno !== 1060)
      console.error(`messages.${col} init error:`, err.sqlMessage);
  }
};
```

---

## 3.4 User Interface Results

### 3.4.1 Page Descriptions

**Login / SignUp** — Three role tabs (Patient / Doctor / Admin) distinguished by role colour. The signup flow spans two sequential forms on the same page using local state step tracking.

**PatientDashboard** — Appointment summary statistics at top, paginated appointment list, embedded AI chatbot in a collapsible panel, and quick-access navigation cards.

**DoctorDashboard** — Queue-based interface. Each queue entry shows patient name and symptoms. Selecting an entry opens a side panel with status controls, medical record form, and prescription form.

**AdminDashboard** — Six KPI cards followed by a physician management table with availability toggles.

**AdminMessages** — Two-pane email-client-style interface. Left pane lists messages with role badges and unread indicators. Right pane renders message detail with reply textarea. Inbox/Sent tab switching and Compose button in the topbar.

**HelpCenter / DoctorMessages** — List-detail layout with status badges. Admin-initiated messages display a purple "From Admin" badge and purple background in the detail view.

**MedicalFile** — Tabbed view (Records / Prescriptions / Appointments) with plaintext export button.

### 3.4.2 User Experience Considerations

**Consistent colour coding:** Blue for patient elements, teal for physician elements, purple for administrative elements — maintained uniformly across all pages.

**Toast notification system:** Non-blocking overlay notifications (success, error, warning, info) via `ToastContext`, auto-dismissing after a fixed interval.

**Confirmation modals:** Irreversible actions (appointment cancellation) require explicit confirmation through `ConfirmModal`, preventing accidental data modification.

**Empty states:** The `EmptyState` component provides informative placeholder content when data lists are empty.

**Unread notification badges:** The Sidebar renders red badge counters on navigation items with pending unread content.

---

## 3.5 Discussion

### 3.5.1 Strengths of the Implementation

**Architectural separation of concerns:** The three-tier architecture ensures that changes in any tier do not necessitate changes in the others. The frontend communicates exclusively through typed API methods; the backend exposes stable REST endpoints; the database is accessed only through parameterised queries in controller functions.

**Role isolation:** Role-based access control is enforced at two independent layers — at the routing level in React (`ProtectedRoute`) and at the middleware level in Express (`verifyRole`). A patient cannot access administrative data even with a direct URL, because the JWT role claim is verified on the backend before any data is returned.

**Automated referral engine:** The automatic appointment rebooking on cancellation operates entirely server-side without user intervention. It handles the edge case of no available physician by dynamically provisioning a new physician entity, ensuring the system never fails to fulfil a rebooking.

**Production deployment:** The system is deployed to a public cloud environment on Railway with a live MySQL database and backend API. All features are accessible through the deployed URL.

### 3.5.2 Limitations

**ID generation scalability:** Sequential string-based IDs are generated by querying the maximum existing ID. Under high concurrent load, this carries a race condition risk. In production, MySQL `AUTO_INCREMENT` or UUID primary keys should be used.

**No time-slot management:** The `appointments` table stores only a `DATE` column, not a time slot. A production system would require a `TIME` or `DATETIME` column and a constraint preventing overlapping appointments for the same physician.

**No email notifications:** All notifications are delivered in-platform. A production system would complement this with email delivery to ensure patients and physicians are informed of critical events even when not logged in.

**AI response validation:** The chatbot route passes patient messages to the Claude API without content filtering. A clinical deployment would require content moderation.

### 3.5.3 Comparison of Achieved vs. Planned Objectives

| Objective | Planned | Achieved |
|---|---|---|
| O1 — Multi-role JWT authentication | ✅ | ✅ Fully implemented |
| O2 — Patient self-service portal | ✅ | ✅ Fully implemented |
| O3 — Physician workflow console | ✅ | ✅ Fully implemented |
| O4 — Administrative oversight panel | ✅ | ✅ Fully implemented |
| O5 — Automated referral engine | ✅ | ✅ Fully implemented with auto-provisioning |
| O6 — Healthcare resource directory | ✅ | ✅ Hospitals and pharmacies |
| O7 — Integrated messaging system | ✅ | ✅ Bidirectional, compose and reply |
| O8 — AI symptom triage chatbot | ✅ | ✅ Claude Haiku integrated |
| O9 — Backup physician provisioning | ✅ | ✅ Startup seeding for 5 specialties |
| O10 — Cloud deployment | ✅ | ✅ Live on Railway |

All ten planned objectives were achieved in the final implementation.

---

---

# 4. CONCLUSION

Healytics was conceived as a solution to three observable deficiencies in conventional healthcare management workflows: the absence of appointment continuity on physician cancellation, the fragmentation of patient medical records, and the lack of intelligent triage guidance for self-referring patients. All ten stated project objectives were fulfilled in the final implementation.

The system comprises:
- A 19-page React SPA with role-specific interfaces for patients, physicians, and administrators
- An 11-route Express.js REST API with JWT-based authentication and role-based access control
- A 13-table MySQL relational database with referential integrity and a runtime schema migration strategy
- An automated appointment referral engine handling physician cancellations without manual intervention
- An integrated AI triage assistant powered by Anthropic's Claude Haiku model
- A bidirectional in-platform messaging system supporting user-to-admin and admin-to-user communication

The most valuable academic learning outcomes from this project were:

1. The importance of separating authentication identity from domain entity identity (the `users` / `patients` / `doctors` table separation)
2. The practical challenges of schema evolution in a live database (addressed through the `addCol` migration helper)
3. The design trade-offs between relational normalisation and operational immutability (denormalised `DoctorName` in medical records)
4. The value of role-aware UI design in multi-user systems (the colour-coded role language)

**Future Improvements:**

1. **Time-slot scheduling:** Adding a `TIME` field and slot availability checks to prevent double-booking.
2. **Email and SMS notifications:** Integrating a delivery service (SendGrid/Mailgun) for out-of-platform alerts.
3. **Video consultation module:** WebRTC-based video calls for remote telemedicine.
4. **FHIR compliance:** Restructuring medical records to the HL7 FHIR standard for EHR interoperability.
5. **Mobile application:** A React Native counterpart for mobile device access.
6. **Concurrent ID generation:** Replacing sequential string IDs with MySQL `AUTO_INCREMENT` or UUID v4.
7. **Complete audit trail:** Extending admin action logging to cover all CRUD operations via the API.

---

---

# REFERENCES

1. Meta Platforms, Inc. (2024). *React: A JavaScript library for building user interfaces*. Version 19.2.6. https://reactjs.org

2. Remix Software, Inc. (2024). *React Router: Declarative routing for React*. Version 6.30.4. https://reactrouter.com

3. Zabriskie, M. (2024). *Axios: Promise based HTTP client for the browser and Node.js*. Version 1.16.1. https://axios-http.com

4. Wathan, A., Reinink, J., Hemphill, D., & Schoger, S. (2024). *Tailwind CSS: A utility-first CSS framework*. Version 3.4.19. https://tailwindcss.com

5. OpenJS Foundation. (2024). *Node.js: JavaScript runtime built on Chrome's V8 engine*. https://nodejs.org

6. Holowaychuk, T. (2024). *Express.js: Fast, unopinionated web framework for Node.js*. Version 5.2.1. https://expressjs.com

7. Sidorenko, A. (2024). *MySQL2: Fast MySQL driver for Node.js*. Version 3.22.3. https://github.com/sidorares/node-mysql2

8. Auth0, Inc. (2024). *jsonwebtoken: JSON Web Token implementation for Node.js*. Version 9.0.3. https://github.com/auth0/node-jsonwebtoken

9. Whiteout Solutions. (2024). *bcryptjs: Optimized bcrypt in JavaScript*. Version 3.0.3. https://github.com/dcodeIO/bcrypt.js

10. Anthropic. (2024). *Claude API documentation*. https://docs.anthropic.com

11. Anthropic. (2024). *@anthropic-ai/sdk: Anthropic TypeScript SDK*. Version 0.100.1. https://github.com/anthropics/anthropic-sdk-typescript

12. Oracle Corporation. (2024). *MySQL 8.0 Reference Manual*. https://dev.mysql.com/doc/refman/8.0/en/

13. Railway Corp. (2024). *Railway: Infrastructure, instantly*. https://railway.app

14. Motdotla. (2024). *dotenv: Loads environment variables from .env*. Version 17.4.2. https://github.com/motdotla/dotenv

15. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation). University of California, Irvine.

16. Jones, M., Bradley, J., & Sakimura, N. (2015). *RFC 7519: JSON Web Token (JWT)*. Internet Engineering Task Force. https://tools.ietf.org/html/rfc7519

17. Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. *Proceedings of the USENIX Annual Technical Conference*, 81–91.

18. Codd, E. F. (1970). A relational model of data for large shared data banks. *Communications of the ACM*, 13(6), 377–387.

19. Beal, V. (2023). Electronic Health Records (EHR). *Webopedia*. https://www.webopedia.com/definitions/ehr/

20. HL7 International. (2023). *FHIR: Fast Healthcare Interoperability Resources*. https://www.hl7.org/fhir/

---

---

# APPENDICES

## Appendix A — Full API Endpoint Reference

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Authenticate user; returns JWT + user object |
| POST | `/api/auth/register` | None | Register new patient |
| POST | `/api/auth/logout` | Token | Record session duration; clear admin log |

### Patients (`/api/patients`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/patients` | Admin/Doctor | All patients |
| GET | `/api/patients/:id` | Any | Patient by ID |
| GET | `/api/patients/:id/medical-file` | Any | Aggregated medical file |
| GET | `/api/patients/:id/appointments` | Any | Patient appointments |
| POST | `/api/patients/book` | Patient | Book appointment |
| PUT | `/api/patients/:id` | Patient | Update profile |

### Doctors (`/api/doctors`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/doctors` | Any | All doctors with hospital info |
| GET | `/api/doctors/:id` | Any | Doctor by ID |
| GET | `/api/doctors/:id/schedule` | Any | Doctor schedule |
| GET | `/api/doctors/:id/appointments` | Doctor/Admin | Doctor appointments |
| PUT | `/api/doctors/appointments/:appointmentID/status` | Doctor/Admin | Update status; triggers referral on Cancel |
| POST | `/api/doctors/medical-record` | Doctor/Admin | Create medical record |
| PUT | `/api/doctors/:id/availability` | Doctor/Admin | Toggle availability |

### Appointments (`/api/appointments`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/appointments` | Admin/Doctor | All appointments |
| GET | `/api/appointments/status/:status` | Admin/Doctor | Filter by status |
| GET | `/api/appointments/:id` | Any | Appointment by ID |
| PUT | `/api/appointments/:id/cancel` | Any | Cancel appointment |

### Medical Records (`/api/medical`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/medical` | Admin/Doctor | All records |
| GET | `/api/medical/:id` | Any | Record by ID |
| GET | `/api/medical/patient/:patientID` | Any | Records for patient |

### Prescriptions (`/api/prescriptions`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/prescriptions` | Admin/Doctor | All prescriptions |
| GET | `/api/prescriptions/patient/:patientID` | Any | Patient prescriptions |
| GET | `/api/prescriptions/active` | Any | Active prescriptions |
| POST | `/api/prescriptions` | Doctor/Admin | Create prescription |

### Hospitals (`/api/hospitals`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/hospitals` | Any | All hospitals |
| GET | `/api/hospitals/:id` | Any | Hospital by ID |
| GET | `/api/hospitals/specialty/:specialty` | Any | Filter by specialty |

### Pharmacies (`/api/pharmacies`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/pharmacies` | Any | All pharmacies |
| GET | `/api/pharmacies/open` | Any | 24-hour pharmacies only |
| GET | `/api/pharmacies/:id` | Any | Pharmacy by ID |

### Admin (`/api/admin`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | System-wide statistics |
| GET | `/api/admin/doctors` | Admin | All doctors |
| GET | `/api/admin/patients` | Admin | All patients |
| GET | `/api/admin/logs` | Admin | Login activity logs |
| GET | `/api/admin/actions` | Admin | Audit trail |
| GET | `/api/admin/contact` | Any | Admin contact info |
| PUT | `/api/admin/doctors/:id/availability` | Admin | Toggle availability |

### Messages (`/api/messages`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/messages/unread` | Admin | Unread count |
| GET | `/api/messages` | Admin | All messages (supports `?role=` and `?direction=`) |
| GET | `/api/messages/mine` | Doctor/Patient | Own messages + inbound admin messages |
| GET | `/api/messages/new-replies` | Doctor/Patient | Unread reply count |
| PUT | `/api/messages/:id/seen` | Doctor/Patient | Mark as read |
| POST | `/api/messages` | Doctor/Patient | Send to admin |
| POST | `/api/messages/admin/send` | Admin | Send to doctor or patient |
| PUT | `/api/messages/:id` | Admin | Reply or mark read |

### AI Chat (`/api/chat`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | Any | Send to Claude Haiku; receive symptom analysis |

---

## Appendix B — Database Schema (Simplified DDL)

```sql
CREATE TABLE users (
  UserID VARCHAR(10) PRIMARY KEY,
  RefID VARCHAR(10),
  FullName VARCHAR(100), Email VARCHAR(100),
  Password VARCHAR(255), Role VARCHAR(10),
  IsActive TINYINT(1), CreatedDate DATE, LastLogin DATE
);

CREATE TABLE patients (
  PatientID VARCHAR(10) PRIMARY KEY,
  Name VARCHAR(100), Age INT, Gender VARCHAR(10),
  Condition VARCHAR(20), SymptomInput TEXT,
  RecommendedSpecialty VARCHAR(50), BloodType VARCHAR(5), Phone VARCHAR(20)
);

CREATE TABLE doctors (
  DoctorID VARCHAR(10) PRIMARY KEY,
  Name VARCHAR(100), Specialty VARCHAR(50),
  Availability VARCHAR(20), HospitalID VARCHAR(10), MaxPatients INT,
  FOREIGN KEY (HospitalID) REFERENCES hospitals(HospitalID)
);

CREATE TABLE appointments (
  AppointmentID VARCHAR(10) PRIMARY KEY,
  PatientID VARCHAR(10), DoctorID VARCHAR(10),
  AppointmentDate DATE, Status VARCHAR(20),
  FOREIGN KEY (PatientID) REFERENCES patients(PatientID),
  FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
);

CREATE TABLE medicalrecords (
  RecordID VARCHAR(10) PRIMARY KEY,
  PatientID VARCHAR(10), Diagnosis TEXT, Treatment TEXT,
  DoctorName VARCHAR(100), VisitDate DATE,
  SymptomInput TEXT, Specialty VARCHAR(50),
  FOREIGN KEY (PatientID) REFERENCES patients(PatientID)
);

CREATE TABLE prescriptions (
  PrescriptionID VARCHAR(10) PRIMARY KEY,
  RecordID VARCHAR(10), PatientID VARCHAR(10),
  Medication VARCHAR(100), Dosage VARCHAR(50),
  Frequency VARCHAR(50), DurationDays INT, IsActive TINYINT(1),
  FOREIGN KEY (RecordID) REFERENCES medicalrecords(RecordID),
  FOREIGN KEY (PatientID) REFERENCES patients(PatientID)
);

CREATE TABLE messages (
  MessageID VARCHAR(10) PRIMARY KEY,
  SenderID VARCHAR(10), SenderName VARCHAR(100), SenderRole VARCHAR(20),
  Subject VARCHAR(200), Body TEXT,
  Status VARCHAR(20) DEFAULT 'Unread',
  SentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  ReplyBody TEXT, RepliedAt DATETIME,
  PatientRead TINYINT(1) DEFAULT 0,
  RecipientID VARCHAR(10), RecipientName VARCHAR(100), Direction VARCHAR(10)
);

CREATE TABLE hospitals (
  HospitalID VARCHAR(10) PRIMARY KEY,
  Name VARCHAR(100), District VARCHAR(50),
  Rating DECIMAL(3,1), Specialties TEXT, IsActive TINYINT(1)
);

CREATE TABLE pharmacies (
  PharmacyID VARCHAR(10) PRIMARY KEY,
  Name VARCHAR(100), OpenTime VARCHAR(10), CloseTime VARCHAR(10),
  Is24Hours TINYINT(1), IsActive TINYINT(1)
);

CREATE TABLE doctorschedule (
  ScheduleID VARCHAR(10) PRIMARY KEY,
  DoctorID VARCHAR(10), WorkingDays VARCHAR(100),
  WorkingHours VARCHAR(50), HospitalID VARCHAR(10),
  FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
);

CREATE TABLE adminlog (
  LogID VARCHAR(10) PRIMARY KEY,
  AdminID VARCHAR(10), AdminName VARCHAR(100),
  LoginDate DATE, LoginTime VARCHAR(10), DurationMin INT,
  IPAddress VARCHAR(20), DeviceType VARCHAR(20), Status VARCHAR(10)
);

CREATE TABLE adminactions (
  ActionID VARCHAR(10) PRIMARY KEY,
  AdminID VARCHAR(10), AdminName VARCHAR(100),
  ActionDate DATE, ActionType VARCHAR(30),
  TargetTable VARCHAR(30), TargetID VARCHAR(20),
  Description VARCHAR(300), Result VARCHAR(10)
);

CREATE TABLE adminprofiles (
  AdminID VARCHAR(10) PRIMARY KEY,
  FullName VARCHAR(100), Role VARCHAR(50),
  Email VARCHAR(100), Phone VARCHAR(20),
  Department VARCHAR(50), IsActive TINYINT(1)
);
```

---

## Appendix C — Project Folder Structure

```
healytics-frontend/
├── public/
├── src/
│   ├── App.js
│   ├── index.js
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Chatbot.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── EmptyState.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── ToastContext.js
│   │   └── NotificationContext.js
│   ├── pages/
│   │   ├── Login.jsx          ├── SignUp.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── MedicalFile.jsx    ├── Appointments.jsx
│   │   ├── Doctors.jsx        ├── Pharmacies.jsx
│   │   ├── Hospitals.jsx      ├── HelpCenter.jsx
│   │   ├── DoctorSchedule.jsx ├── DoctorPatients.jsx
│   │   ├── DoctorMessages.jsx
│   │   ├── AdminDoctors.jsx   ├── AdminPatients.jsx
│   │   ├── AdminLogs.jsx      ├── AdminMessages.jsx
│   │   └── NotFound.jsx
│   └── services/
│       └── api.js
├── tailwind.config.js
└── package.json

healthiq-backend/
├── server.js
├── .env
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── doctorController.js
│   └── appointmentController.js
└── routes/
    ├── auth.js          ├── patients.js
    ├── doctors.js       ├── appointments.js
    ├── medicalrecords.js├── prescriptions.js
    ├── hospitals.js     ├── pharmacies.js
    ├── admin.js         ├── messages.js
    └── chat.js
```

---

## Appendix D — System Architecture Diagram

```
                   ┌──────────────────────────────────────┐
                   │          CLIENT BROWSER              │
                   │   React 19 SPA (Tailwind CSS)        │
                   │                                      │
                   │  Patient  │  Doctor  │  Admin        │
                   │  Pages    │  Pages   │  Pages        │
                   │           │          │               │
                   │      AuthContext / ToastContext       │
                   │         NotificationContext          │
                   │                                      │
                   │      api.js (Axios Interceptors)     │
                   │      Bearer JWT on every request     │
                   └──────────────┬───────────────────────┘
                                  │ HTTPS / REST
                   ┌──────────────▼───────────────────────┐
                   │    NODE.JS + EXPRESS SERVER           │
                   │    (Railway Cloud Service)            │
                   │                                      │
                   │  cors()  ·  express.json()           │
                   │       ↓                              │
                   │  verifyToken()  ·  verifyRole()      │
                   │       ↓                              │
                   │  Route Modules (11 total)            │
                   │  /auth /patients /doctors            │
                   │  /appointments /medical              │
                   │  /prescriptions /hospitals           │
                   │  /pharmacies /admin /messages /chat  │
                   │       ↓                              │
                   │  Controllers (MVC pattern)           │
                   │       ↓              ↓               │
                   │  MySQL2 Pool    Anthropic SDK        │
                   └──────┬────────────────┬──────────────┘
                          │                │
           ┌──────────────▼──────┐  ┌──────▼──────────────┐
           │  MySQL 8.0 Database │  │  Anthropic Claude   │
           │  (Railway Plugin)   │  │  claude-haiku-4-5   │
           │  13 tables          │  │  Symptom triage     │
           └─────────────────────┘  └─────────────────────┘
```

---

*End of Thesis*
*Healytics: A Full-Stack Web-Based Healthcare Management System*
*Üsküdar University · Faculty of Engineering and Natural Sciences*
*B.Sc. Software Engineering · June 2026*
