# RCE Complaint Box

A modern, secure, full-stack grievance management and resolution tracking platform designed for educational institutions. Built with **Spring Boot 3.5**, **Java 25**, **MongoDB 7**, **React 19**, **Vite 7**, **Tailwind CSS 4**, and containerized with **Docker Compose**.

---

## Features & Roles

### 🎓 Student
- **Raise Complaints**: File complaints under custom categories (Hostel, Academics, Infrastructure, etc.) with dynamic forms and file attachments (images, PDFs, documents).
- **Anonymous Mode**: Option to file grievances without revealing identity.
- **Real-Time Tracking**: Track status changes (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, `ESCALATED`) along with mentor/admin action remarks.
- **Personal Dashboard**: View summary counters (total, resolved, pending) and recent activity.

### 👨‍🏫 Mentor
- **Department & Section Scopes**: Mentors are assigned to specific departments and sections by administrators.
- **Complaint Actioning**: Update complaint status and attach resolution remarks (`RESOLVED`, `IN_PROGRESS`, `ESCALATED`, `REJECTED`).
- **Scoped Oversight**: Mentors can only view and resolve complaints within their assigned department/section scope.

### 🛡️ Administrator
- **User Management**: Create, update, and manage accounts for Students, Mentors, and Admins.
- **Department & Section Management**: Create and configure academic departments and sections with automatic cascade handling.
- **Mentor Assignment**: Dynamically allocate mentors to multiple departments and sections.
- **Custom Complaint Types**: Configure grievance categories with custom form schemas and field specifications.
- **Analytics & Global Oversight**: Search, filter, and inspect grievances institution-wide.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Spring Boot 3.5.9, Java 25, Spring Data MongoDB, Spring Security 6 (JWT stateless auth), Bean Validation (`jakarta.validation`), Lombok |
| **Frontend** | React 19, TypeScript 5.8, Vite 7, Tailwind CSS v4, Radix UI / shadcn/ui, TanStack Query v5, React Router v7, Lucide Icons, Sonner |
| **Database & Files** | MongoDB 7.0, Local disk volume storage with MIME-type streaming |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage builds (Eclipse Temurin JRE 25 + Nginx Alpine SPA server) |
| **Testing** | JUnit 5, Mockito, Testcontainers (MongoDB 7.0), 100 comprehensive unit & integration tests |

---

## Quick Start with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running with WSL2 or Hyper-V backend)

### 1. Clone and Configure
```bash
git clone https://github.com/your-username/rce-complaint-box.git
cd rce-complaint-box

# Copy environment template
cp .env.example .env
```

Review `.env` and adjust secrets/ports if desired:
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

The stack will start and run health checks:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Backend Healthcheck**: [http://localhost:8080/test](http://localhost:8080/test)
- **MongoDB**: `localhost:27017`

### 3. Stop Services
```bash
docker compose down
```

---

## Local Development (Without Docker)

### Backend

**Prerequisites**: JDK 25 (e.g. Eclipse Temurin or Microsoft OpenJDK 25), MongoDB running locally on `localhost:27017`.

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

# Start Vite development server
npm run dev
```

The frontend development server starts on `http://localhost:5173`.

---

## Testing

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

## API Overview

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
| `POST` | `/departments` | Admin | Create department with sections |
| `PUT` | `/departments/{code}` | Admin | Update department name and sections (with cascade delete) |
| `DELETE` | `/departments/{code}` | Admin | Delete department (with cascade delete) |
| `POST` | `/complaints` | Student | File a new complaint (supports anonymous option) |
| `GET` | `/complaints/me` | Student | Get complaints raised by the logged-in student |
| `GET` | `/complaints` | Mentor / Admin | Query complaints with role-scoped filters |
| `DELETE` | `/complaints/{id}` | Owner / Admin / Mentor | Delete complaint |
| `POST` | `/complaints/{id}/actions` | Mentor / Admin | Add action remark and transition complaint status |
| `POST` | `/file/upload` | Authenticated | Upload file attachment |
| `GET` | `/file/view/{filename}` | Public | Stream uploaded attachment |

---

## License
MIT