# RCE Complaint Box

> **A Modern, Full-Stack Grievance Management Platform Powered by a Dynamic Form Creation & Builder Engine**

Built with **Spring Boot 3.5**, **Java 25**, **MongoDB 7**, **React 19**, **Vite 7**, **Tailwind CSS 4**, and containerized with **Docker Compose**.

---

## 🌟 Primary Feature: Dynamic Form Creation & Builder Engine

The signature capability of **RCE Complaint Box** is its **Dynamic Form Creation & Rendering Engine**. Traditional grievance systems enforce rigid, hardcoded ticket fields that fail to capture the nuanced requirements of different institutional complaints (e.g., hostel room repairs require block and electrical/plumbing options, while lab grievances need equipment IDs and course codes).

RCE Complaint Box resolves this through a complete, no-code, drag-and-drop form building and schema-driven rendering architecture:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     Admin Form Builder    │ ───> │      MongoDB Schema       │ ───> │    Dynamic Form Runtime   │
│  • Drag-and-drop elements │      │  • JSON Field Definitions │      │  • Dynamic Zod Validation │
│  • Visual field inspector │      │  • Portable & Versioned   │      │  • React Hook Form render │
│  • Real-time canvas       │      │  • Stored per category    │      │  • File upload handling   │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
                                                                                    │
                                                                                    ▼
                                                                      ┌───────────────────────────┐
                                                                      │ Schemaless Complaint Meta │
                                                                      │  • Dynamic key-value map  │
                                                                      │  • Rendered in Mentor/    │
                                                                      │    Admin detail views     │
                                                                      └───────────────────────────┘
```

### 1. Visual Drag-and-Drop Builder (`@dnd-kit`)
- **Interactive Canvas**: Administrators can drag, drop, and rearrange form elements with live sorting handles and instant preview.
- **Field Customizer**: Comprehensive property inspectors allow configuring labels, placeholders, input types, helper text, and required validation rules.
- **Choice-Based Field Editor**: Add, remove, and sort custom options with key-value pairs for dropdowns and radio buttons.

### 2. Supported Form Elements
| Category | Element | Description |
|---|---|---|
| **Text Inputs** | `text-field` | Single-line input supporting text, email, number, tel, or URL formats |
| **Multiline** | `text-area` | Resizable multiline text area for detailed problem descriptions |
| **Numeric** | `number-field` | Quantifiable numeric values with min, max, and step boundaries |
| **Dropdown** | `select-field` | Searchable / single-choice dropdown selection with custom options |
| **Radio Group** | `radio-field` | Mutually exclusive radio options with horizontal row or column layout |
| **Boolean** | `checkbox-field` | Single or multi-select confirmation and acknowledgment toggles |
| **Date & Time** | `date-field`, `time-field`, `date-time-field` | Native calendar, clock, and combined timestamp pickers |
| **Attachments** | `file-field` | Integrated file upload element (images, PDFs, documents) |
| **Display / Layout** | `heading-view`, `paragraph-view`, `image-view` | Informational headers, instructions, guidelines, and reference diagrams |

### 3. Dynamic Runtime Validation (Zod + React Hook Form)
- When a student selects a complaint category, the frontend parses the stored JSON schema into dynamic form elements.
- Form fields dynamically construct their own **Zod schema** at runtime (enforcing required constraints, regex masks, and value boundaries).
- Dynamic error messages and real-time field validation are managed seamlessly through `react-hook-form` and `zodResolver`.

### 4. Schemaless Persistence & Inspection
- Dynamic answers are submitted and stored as an extensible key-value map (`Map<String, Object> meta`) in MongoDB without requiring schema migrations.
- Mentors and administrators view grievances with their original dynamic field labels and custom formatting, including one-click previews for uploaded evidence.

---

## 🚀 Pre-Loaded Seed Data & Out-of-the-Box Setup

A fresh instance starts with automatic, idempotent database seeding via `DataInitializer.java`. You can immediately log in and explore the platform without manual configuration.

### Default Credentials

| Role | Username | Password | Email | Details |
|---|---|---|---|---|
| **Admin** | `admin` | `admin123` | `admin@rce.ac.in` | Full institutional and system access |
| **Mentor** | `mentor_cse` | `mentor123` | `mentor.cse@rce.ac.in` | Dr. Rajesh Kumar (`EMP101`), CSE Dept (Sections A & B) |
| **Student** | `student_20rce001` | `student123` | `student001@rce.ac.in` | Arun Varma (`20RCE001`), CSE Dept, Section A (2024-2028) |

### Pre-Configured Dynamic Complaint Forms
1. **Hostel Maintenance Grievance**:
   - `block` (Select: A-Block Boys, B-Block Boys, C-Block Boys, Girls Hostel Block 1)
   - `roomNumber` (Text field, required)
   - `category` (Radio: Electrical, Plumbing, Carpentry, Cleanliness)
   - `description` (Textarea, required)
   - `photoAttachment` (File upload, optional)
2. **Academic & Lab Issues**:
   - `courseCode` (Text field, e.g. `CS301 - Operating Systems`)
   - `labRoom` (Text field, e.g. `Lab 3 / System 42`)
   - `remarks` (Textarea, required)
3. **Campus Facilities & Infrastructure**:
   - `location` (Text field, e.g. `Central Library 2nd Floor`)
   - `facilityType` (Select: Library, Canteen, Sports, Wi-Fi, Restrooms)
   - `details` (Textarea, required)

### Pre-Configured Academic Departments & Sections
- **CSE** (Computer Science & Engineering) - Sections A, B, C
- **ECE** (Electronics & Communication Engineering) - Sections A, B
- **MECH** (Mechanical Engineering) - Section A
- **CIVIL** (Civil Engineering) - Section A

---

## 👥 Role-Based Access Control

### 🎓 Student
- **Dynamic Grievance Submission**: Choose grievance category and fill dynamic schema-driven forms with file attachments.
- **Anonymous Filing**: Option to lodge complaints anonymously while retaining resolution updates.
- **Real-Time Tracking**: Track status lifecycle (`PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED` / `ESCALATED`) and view mentor action logs.
- **Student Dashboard**: Counter metrics for total, pending, and resolved complaints.

### 👨‍🏫 Mentor
- **Department & Section Scopes**: Mentors can only access and action complaints from their assigned departments and sections.
- **Resolution Tracking**: Update complaint statuses with remarks and resolution descriptions.
- **Multi-Scope Allocations**: Mentors can be allocated to multiple sections across departments.

### 🛡️ Administrator
- **Dynamic Form Studio**: Create, edit, and publish dynamic complaint forms with the drag-and-drop builder.
- **User Management**: Provision, modify, and ban accounts for Students, Mentors, and Admins.
- **Department Hierarchy**: Manage departments and sections with cascading safety checks.
- **Mentor Allocations**: Assign or revoke mentor departmental oversight.
- **Global Oversight**: Institution-wide grievance monitoring and search filters.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Spring Boot 3.5.9, Java 25, Spring Data MongoDB, Spring Security 6 (Stateless JWT), Bean Validation (`jakarta.validation`), Lombok |
| **Frontend** | React 19, TypeScript 5.8, Vite 7, Tailwind CSS v4, Radix UI / shadcn/ui, TanStack Query v5, React Router v7, `@dnd-kit`, Zod, Lucide Icons, Sonner |
| **Database & Files** | MongoDB 7.0, Local disk volume storage with MIME-type streaming |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage builds (Eclipse Temurin JRE 25 + Nginx Alpine SPA server) |
| **Testing** | JUnit 5, Mockito, Testcontainers (MongoDB 7.0), 100 comprehensive automated unit & integration tests |

---

## ⚡ Quick Start with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running with WSL2 or Hyper-V backend)

### 1. Clone and Configure
```bash
git clone https://github.com/your-username/rce-complaint-box.git
cd rce-complaint-box

# Copy environment template
cp .env.example .env
```

Review `.env` and adjust secrets/ports if needed:
```env
MONGODB_URI=mongodb://mongo:27017/complaint_box
JWT_SECRET=ZEdlZTJnSlRHLUtDLi5xQUx7MFR5S3RNZk03JSt4enJkLF8mZUp4WntmJTJGYWVQNmo=
JWT_EXPIRY=604800000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:8080
```

### 2. Start Services
```bash
docker compose up -d --build
```

The stack will start and perform container health checks:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Backend Health Check**: [http://localhost:8080/test](http://localhost:8080/test)
- **MongoDB**: `localhost:27017`

### 3. Stop Services
```bash
docker compose down
```

---

## 🛠️ Local Development (Without Docker)

### Backend
**Prerequisites**: JDK 25 (e.g. Eclipse Temurin or Microsoft OpenJDK 25), MongoDB running on `localhost:27017`.

```bash
cd backend

# On Windows PowerShell:
$env:JAVA_HOME = "C:\path\to\your\jdk-25"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Run Spring Boot application
.\mvnw.cmd spring-boot:run
```

The backend starts on `http://localhost:8080`.

### Frontend
**Prerequisites**: Node.js 20+ (recommended Node 22+).

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend development server starts on `http://localhost:5173`.

---

## 🧪 Automated Testing

The project includes an exhaustive test suite of **100 automated tests** covering all failure modes, boundary validations, conflict scenarios, role authorization guards, and database criteria queries.

### Run All Tests (Unit + Testcontainers Integration)
```bash
cd backend
.\mvnw.cmd test
```
*Note: Testcontainers requires Docker Desktop to be running to start a temporary `mongo:7` container.*

### Run Unit Tests Only (Fast In-Memory Mockito Tests)
```bash
cd backend
.\mvnw.cmd test -Dtest="*Test,!*IntegrationTest"
```

### Test Suite Structure
- `UserServiceTest`: 45 test scenarios (login, validation, conflict detection, role guards, mentor allocations).
- `DepartmentServiceTest`: 11 test scenarios (duplicate codes/names, section uniqueness, cascade deletions).
- `ComplaintServiceTest`: 12 test scenarios (unauthorized submissions, deletion permissions, status transitions).
- `ComplaintTypesServiceTest`: 8 test scenarios (title conflicts, missing IDs, cascade deletions).
- `FileServiceTest`: 4 test scenarios (empty files, missing files, upload verification).
- `GlobalExceptionHandlerTest`: 6 test scenarios (status codes, standardized `ApiResponse<T>` payload).
- `SequenceGeneratorIntegrationTest`: Atomic MongoDB sequence increments, decrements, and non-destructive peek reads.
- `UserRepositoryIntegrationTest`: Real MongoDB criteria queries for filtering, pagination, and conflict detection.
- `ComplaintRepositoryIntegrationTest`: Real MongoDB criteria queries for status, department, and section filters.

---

## 📡 API Overview

All API responses follow a standardized envelope:
```json
{
  "code": "SUCCESS",
  "message": "Operation description",
  "data": { ... }
}
```

### Key Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/test` | Public | Lightweight health check endpoint |
| `POST` | `/users/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/departments` | Public | List all departments and sections |
| `POST` | `/users` | Admin | Register new student, mentor, or admin |
| `GET` | `/users` | Authenticated | Query users by role, department, section, keyword |
| `PUT` | `/users` | Admin | Update user details (with complaint immutability guards) |
| `DELETE` | `/users/{id}` | Admin | Delete a user account |
| `POST` | `/users/mentor/assign` | Admin | Assign a mentor to a department and section |
| `DELETE` | `/users/mentor/assign` | Admin | Remove mentor assignment |
| `GET` | `/complaint-types` | Authenticated | Retrieve all complaint types with form schemas |
| `POST` | `/complaint-types` | Admin | Create complaint category with dynamic form schema |
| `PUT` | `/complaint-types/{id}` | Admin | Update dynamic form schema for category |
| `DELETE` | `/complaint-types/{id}` | Admin | Delete complaint category |
| `POST` | `/complaints` | Student | File a new complaint with dynamic `meta` payload |
| `GET` | `/complaints/me` | Student | Get complaints raised by the logged-in student |
| `GET` | `/complaints` | Mentor / Admin | Query complaints with role-scoped filters |
| `DELETE` | `/complaints/{id}` | Owner / Admin / Mentor | Delete complaint |
| `POST` | `/complaints/{id}/actions` | Mentor / Admin | Add action remark and transition complaint status |
| `POST` | `/file/upload` | Authenticated | Upload file attachment |
| `GET` | `/file/view/{filename}` | Public | Stream uploaded attachment |

---

## 📄 License
MIT