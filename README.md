# Course Selection & Enrollment System

A production-style full-stack system for managing courses and enrollments with role-based access:
- **Admins** create, update, and delete courses
- **Students** browse, enroll, and drop courses
- **JWT auth** secures protected APIs

Built with **Node.js, Express, Prisma, PostgreSQL (Neon-compatible), and Vanilla HTML/CSS/JS**.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Frontend:** HTML, CSS, JavaScript

## Features

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

## Folder Structure

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

## Database Schema

### Users
- `id` (PK)
- `name`
- `email` (unique)
- `password` (hashed)
- `role` (`STUDENT` | `ADMIN`)
- `createdAt`

### Courses
- `id` (PK)
- `title`
- `description`
- `instructor`
- `capacity`
- `createdAt`
- `updatedAt`
- Index on `title`

### Enrollments
- `id` (PK)
- `userId` (FK -> users.id, cascade delete)
- `courseId` (FK -> courses.id, cascade delete)
- `enrolledAt`
- Unique composite constraint: `(userId, courseId)` to prevent duplicates
- Indexes on `userId` and `courseId`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Courses
- `GET /api/courses`
- `POST /api/courses` (admin only)
- `PUT /api/courses/:id` (admin only)
- `DELETE /api/courses/:id` (admin only)

### Enrollment
- `POST /api/enroll/:courseId`
- `DELETE /api/enroll/:courseId`
- `GET /api/my-courses`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file and configure Neon:
   ```bash
   cp .env.example .env
   ```
3. Update `DATABASE_URL` and `JWT_SECRET` in `.env`.
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Run migration:
   ```bash
   npm run prisma:migrate -- --name init
   ```
6. Start server:
   ```bash
   npm run dev
   ```
7. Open app:
   - `http://localhost:4000`

## Future Improvements

- Refresh token rotation + token revocation store
- Course waitlist and seat notification
- Search/filter/pagination for large course catalogs
- Admin analytics dashboard
- Unit/integration tests and CI pipeline
