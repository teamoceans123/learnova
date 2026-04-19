# Course Selection & Enrollment System

A production-style full-stack platform for managing academic courses and student enrollments with secure role-based access.

Built with **Node.js, Express, Prisma, PostgreSQL (Neon-compatible), and Vanilla HTML/CSS/JS**.

## 📌 Project Overview

This system is designed to digitize course registration workflows for institutions where students must browse available courses, enroll within seat limits, and manage their enrolled subjects, while administrators control the course catalog.

**Real-world use case:** universities, colleges, and training institutes that need a reliable and scalable course enrollment portal.

**Key objectives:**
- Implement secure authentication and authorization (Student/Admin)
- Ensure consistent enrollment logic (no duplicates, capacity-aware)
- Provide clean, responsive UI for daily academic operations
- Maintain strong DBMS design for integrity, scalability, and maintainability

## 🧱 System Architecture

The project follows a layered architecture:

1. **Client Layer (Frontend)**  
   HTML/CSS/JavaScript UI for login, registration, course browsing, and enrollment actions.
2. **Server Layer (Express API)**  
   Handles routing, validation, business logic, JWT auth, and error handling.
3. **Database Layer (PostgreSQL on Neon)**  
   Stores users, courses, and enrollments with relational constraints via Prisma ORM.

**Data Flow (high-level):**  
`User Action → API Route → Controller → Service Layer → Prisma Client → PostgreSQL → Response`

## 🧰 Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Frontend:** HTML, CSS, JavaScript

## ✨ Features

- Registration/Login/Logout with hashed passwords and JWT
- Role-based authorization (ADMIN/STUDENT)
- Course CRUD for admins
- Student enrollment and drop flows
- Duplicate enrollment prevention
- Capacity-aware enrollments
- My Courses dashboard
- Input validation (Zod)
- Centralized error handling
- Responsive purple gradient UI with toasts, loading states, and empty states

## 📁 Folder Structure

```text
.
├── prisma/
│   └── schema.prisma
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   └── env.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── enrollmentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validate.js
│   ├── prisma/
│   │   └── client.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   └── enrollmentService.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── asyncHandler.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── courseValidators.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 🗄️ Database Design

### Table: `users`

| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, Auto Increment, NOT NULL | Unique user identifier |
| `name` | VARCHAR | NOT NULL | Full name of user |
| `email` | VARCHAR | UNIQUE, NOT NULL | Login email |
| `password` | VARCHAR | NOT NULL | bcrypt-hashed password |
| `role` | ENUM(`STUDENT`,`ADMIN`) | NOT NULL, Default `STUDENT` | Access role |
| `createdAt` | TIMESTAMP | NOT NULL, Default `now()` | Account creation timestamp |

### Table: `courses`

| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, Auto Increment, NOT NULL | Unique course identifier |
| `title` | VARCHAR | NOT NULL, Indexed | Course title |
| `description` | TEXT | NOT NULL | Course details |
| `instructor` | VARCHAR | NOT NULL | Instructor name |
| `capacity` | INT | NOT NULL | Max allowed enrollments |
| `createdAt` | TIMESTAMP | NOT NULL, Default `now()` | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, Auto Updated | Last update timestamp |

### Table: `enrollments`

| Attribute | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, Auto Increment, NOT NULL | Unique enrollment identifier |
| `userId` | INT | FK (`users.id`), NOT NULL, Indexed | Student reference |
| `courseId` | INT | FK (`courses.id`), NOT NULL, Indexed | Course reference |
| `enrolledAt` | TIMESTAMP | NOT NULL, Default `now()` | Enrollment timestamp |

**Additional constraints:**
- Composite UNIQUE on (`userId`, `courseId`) to prevent duplicate enrollments
- Cascade delete on both FKs for referential cleanup

## 🔗 ER Model (Conceptual)

- **User → Enrollments:** One-to-Many  
  One user can have many enrollment records.
- **Course → Enrollments:** One-to-Many  
  One course can have many enrollment records.
- **Users ↔ Courses:** Many-to-Many (via `enrollments`)  
  A student can enroll in multiple courses, and each course can include multiple students.

## ⚙️ DBMS Concepts Used

- **Normalization (up to 3NF):**  
  User, course, and enrollment data are separated into logical tables to reduce redundancy and update anomalies.
- **Indexing:**  
  Index on `courses.title` improves search/read performance; indexes on `enrollments.userId` and `enrollments.courseId` optimize join/filter queries.
- **Constraints:**  
  PKs ensure entity uniqueness, FKs enforce referential integrity, and UNIQUE (`userId`, `courseId`) prevents duplicate enrollment records.
- **Transactions:**  
  Enrollment flow is designed to support transactional consistency (e.g., capacity check + insert should be handled atomically in production-hardening scenarios).
- **Data Integrity:**  
  Validation at API level + constraints at DB level ensures reliable, consistent state.

## 🔄 Data Flow (Step-by-step)

1. **User Registration**
   - Client submits registration form
   - API validates input (Zod)
   - Password is hashed (bcrypt)
   - User stored in `users`
   - JWT token returned
2. **User Login**
   - Credentials are validated
   - Stored hash is verified
   - JWT token issued for authenticated requests
3. **Course Management (Admin)**
   - Admin sends create/update/delete request
   - API checks role authorization
   - Service persists changes in `courses`
4. **Enrollment (Student)**
   - Student requests enroll for a course
   - System checks course existence and capacity
   - System checks duplicate enrollment (`userId`, `courseId`)
   - New record inserted into `enrollments`
   - Updated course/enrollment view returned

## 📡 API Documentation

### Authentication APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user (Student/Admin) | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| POST | `/api/auth/logout` | Logout user session | Public (token-aware) |

### Course APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/courses` | Get all available courses | Public |
| POST | `/api/courses` | Create a course | Admin |
| PUT | `/api/courses/:id` | Update course details | Admin |
| DELETE | `/api/courses/:id` | Delete a course | Admin |

### Enrollment APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/enroll/:courseId` | Enroll in a course | Student/Admin |
| DELETE | `/api/enroll/:courseId` | Drop enrolled course | Student/Admin |
| GET | `/api/my-courses` | View currently enrolled courses | Student/Admin |

## 🎨 UI/UX Design

- **Design language:** clean card-based layout with a soft purple gradient theme
- **Visual style:** subtle hover transitions and smooth component animations
- **Usability:** responsive interface for desktop/tablet/mobile screens
- **Feedback:** toast notifications, loading indicators, and empty states for better UX clarity

## ⚙️ Setup & Local Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
   On Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Update `DATABASE_URL` and `JWT_SECRET` in `.env`
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Run migrations:
   ```bash
   npm run prisma:migrate -- --name init
   ```
6. Start development server:
   ```bash
   npm run dev
   ```
7. Open:
   - `http://localhost:4000`

## 🚀 Deployment (Render)

This project can be deployed to **Render** using a Web Service + Neon PostgreSQL.

### Recommended Render configuration

- **Build Command**
  ```bash
  npm install && npm run prisma:generate
  ```
- **Start Command**
  ```bash
  npm start
  ```

### Required environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT token expiry (e.g., `1d`) |
| `PORT` | Runtime port (Render provides this automatically) |

## 📊 Future Improvements (Roadmap)

1. Implement refresh token rotation and token revocation strategy
2. Add waitlist and auto-notification when seats open
3. Add advanced course search, filtering, and pagination
4. Build admin analytics dashboard (enrollment trends, seat utilization)
5. Add automated test suite (unit/integration/e2e) with CI/CD pipeline
6. Add audit logging and activity history for compliance tracking
