# Employee Management System & Executive HR Portal

A production-grade, enterprise Full-Stack Employee Management System (EMS) engineered with **Java 21**, **Spring Boot 3.3**, **Spring Security (JWT)**, **Spring Data JPA**, and **React 18**.

Designed for enterprise HR directors, talent managers, and executive leadership to oversee organization hierarchy, department structures, staff lifecycle events (active, on-leave, terminated), compensation data, and payroll analytics.

---

## 🚀 Key Features

### 1. Staff Lifecycle & Records Management
- **Full Employee CRUD**: Comprehensive lifecycle records including full name, business email, contact phone, job title, annual compensation, hire/joining date, status (`ACTIVE`, `ON_LEAVE`, `TERMINATED`), and department association.
- **Dynamic Search**: Instant multi-attribute search across first names, last names, emails, and job designations.
- **Multi-Facet Filtering**: Filter directory entries by department, employment status, or combination filters.
- **Server-Side Pagination & Sorting**: Zero client memory bottlenecks; sorting by hire date, salary, name, or ID with configurable page sizing.

### 2. Department & Organizational Hierarchy
- **Department CRUD**: Create, view, edit, and delete business units with custom abbreviation codes (e.g. `ENG`, `FIN`, `HR`).
- **Headcount Tracking**: Real-time aggregation of active employee counts per department.
- **Referential Integrity Protection**: Prevents accidental deletion of departments that have actively assigned staff.

### 3. Executive HR Analytics & Dashboard
- **Total Headcount Metrics**: Live breakdowns of active staff, on-leave employees, and past terminations.
- **Payroll Financial Overview**: Real-time calculations of total active payroll spend and organization-wide average salary.
- **Department Distribution**: Visual breakdown of staff distribution across operational units.

### 4. Enterprise Security & Access Control
- **Stateless JWT Authentication**: Secure HMAC-SHA256 bearer tokens with 24-hour expiration.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_ADMIN`: Unrestricted access including staff removal and structural department reorganization.
  - `ROLE_HR`: Full employee management, creation, updates, and organizational viewing.
  - `ROLE_USER`: Read-only access to staff directories and department contacts.
- **Password Security**: Passwords hashed with BCrypt (10 rounds).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Language** | Java 21 (LTS) |
| **Framework** | Spring Boot 3.3.4 |
| **Security** | Spring Security 6, JJWT (io.jsonwebtoken 0.12.5), BCrypt |
| **Data & ORM** | Spring Data JPA, Hibernate, PostgreSQL 16 (H2 fallback for dev/tests) |
| **API & Docs** | Spring Web MVC, OpenAPI 3.0 (Swagger UI) |
| **Frontend** | React 18, Vite 5, Lucide React Icons, Native CSS Design System |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |
| **DevOps** | Multi-stage Dockerfile, Docker Compose |

---

## 🏛️ Architecture & Clean Code Design

```
com.portfolio.ems
├── config                  # Data seeding, OpenAPI configuration
├── controller              # REST endpoints (Auth, Employees, Departments)
├── dto
│   ├── request             # Inbound payload schemas (Login, Employee, Department)
│   └── response            # Outbound serialized models & analytics
├── entity                  # JPA persistence models (User, Role, Employee, Department)
├── exception               # GlobalExceptionHandler, ResourceNotFoundException
├── mapper                  # Domain-to-DTO transformation mappers
├── repository              # Spring Data JPA repositories with JPQL queries
├── security                # JWT provider, filter, UserDetails service, SecurityConfig
└── service
    ├── impl                # Transactional business logic implementations
    └── (interfaces)        # Decoupled service contracts
```

---

## 💾 Database Schema

```
 +--------------------+       +----------------------+
 |    departments     |       |      employees       |
 +--------------------+       +----------------------+
 | id (PK)            | 1   * | id (PK)              |
 | name (UNIQUE)      |-------| department_id (FK)   |
 | code (UNIQUE)      |       | first_name           |
 | description        |       | last_name            |
 +--------------------+       | email (UNIQUE)       |
                              | phone                |
 +--------------------+       | designation          |
 |       users        |       | salary               |
 +--------------------+       | joining_date         |
 | id (PK)            |       | status (ENUM)        |
 | email (UNIQUE)     |       | created_at           |
 | password (BCrypt)  |       | updated_at           |
 | role_id (FK)       |       +----------------------+
 +--------------------+
```

---

## 📡 REST API Documentation

### Interactive Swagger UI
When running locally: `http://localhost:8083/swagger-ui/index.html`

### Core Endpoints

#### Authentication
- `POST /api/auth/login` — Authenticate and retrieve JWT token.

#### Employees
- `GET /api/employees` — Paginated and filtered staff directory (`search`, `departmentId`, `status`, `page`, `size`, `sortBy`, `sortDir`).
- `GET /api/employees/{id}` — Retrieve detailed employee profile.
- `POST /api/employees` — Register a new employee (Requires `ADMIN` or `HR`).
- `PUT /api/employees/{id}` — Update existing employee data (Requires `ADMIN` or `HR`).
- `DELETE /api/employees/{id}` — Remove employee record (Requires `ADMIN`).
- `GET /api/employees/dashboard/stats` — Retrieve company-wide headcount, average salary, and department distribution.

#### Departments
- `GET /api/departments` — List all departments with headcount totals.
- `GET /api/departments/{id}` — View single department.
- `POST /api/departments` — Create department (Requires `ADMIN` or `HR`).
- `PUT /api/departments/{id}` — Update department info (Requires `ADMIN` or `HR`).
- `DELETE /api/departments/{id}` — Remove department (Requires `ADMIN`).

---

## 🔑 Pre-Configured Demo Credentials

The backend seeds demonstration accounts upon first launch:

| Role | Username / Email | Password |
|---|---|---|
| **System Administrator** | `admin@ems.company.com` | `admin123` |
| **HR Director** | `hr@ems.company.com` | `hr123456` |

---

## ⚙️ Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Profile (`dev` uses in-memory H2, `prod` uses PostgreSQL) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5435` | PostgreSQL port |
| `DB_NAME` | `ems_db` | Database name |
| `DB_USER` | `ems_user` | Database user |
| `DB_PASSWORD` | `ems_secure_password_2026` | Database password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | Base64 HMAC-SHA256 secret key |
| `JWT_EXPIRATION` | `86400000` | Token expiration in ms (24 hours) |

---

## 🏃 Getting Started Locally

### Prerequisites
- **JDK 21** or later
- **Apache Maven 3.8+**
- **Node.js 18+** & **npm**
- *(Optional)* Docker and Docker Compose

### 1. Run the Backend
```bash
cd projects/employee-management-system/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
*Backend initializes on port **8083** with H2 in-memory storage and seed records.*

### 2. Run the Frontend
```bash
cd projects/employee-management-system/frontend
npm install
npm run dev
```
*Frontend runs at **http://localhost:3003**.*

### 3. Run Backend Unit Tests
```bash
mvn test
```

---

## 🐳 Running with Docker Compose

To spin up the full production stack with PostgreSQL:

```bash
cd projects/employee-management-system
docker-compose up --build -d
```

- PostgreSQL container available at port `5435`
- Spring Boot container available at `http://localhost:8083`

---

## 📈 Future Enhancements
- Bi-directional manager/reporting-to hierarchy tree visualization.
- PDF generation of employee verification letters and compensation stubs.
- Leave request workflow with manager approval notifications.

---

## 👨‍💻 Author & Portfolio

- **Portfolio**: [Software Developer Portfolio](https://github.com/)
- **Repository**: [Coming Soon]()
- **Live Demo**: [Coming Soon]() *(Status: DEVELOPMENT)*
