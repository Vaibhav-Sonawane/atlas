# Atlas  
**Role-Based Task Management System with Backend-Enforced Authorization**

Live Demo: https://atlas-three-rosy.vercel.app  

---

## 1. System Definition

Atlas is a full-stack task management system designed around backend-enforced authentication and role-based authorization (RBAC).

The system strictly separates:

- Authentication (identity verification)
- Authorization (permission validation)
- Business logic (task operations)

All access control decisions are enforced server-side.

---

## 2. Problem Statement

Typical student CRUD applications suffer from:

- UI-only permission checks
- Missing centralized authorization logic
- Weak JWT validation
- Inconsistent access control
- Security vulnerabilities

This results in:

- Privilege escalation risks
- Inconsistent behavior
- Poor architectural separation

Atlas centralizes authentication and authorization in the backend to prevent these issues.

---

## 3. System Objectives

- Enforce JWT-based authentication
- Implement server-side role validation
- Protect API routes using middleware
- Prevent unauthorized state mutation
- Harden the app with rate limiting and security headers
- Support real-time task updates

---

## 4. High-Level Architecture

### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Socket.io client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT authentication
- Role-based authorization middleware
- Helmet security headers
- Express rate limiting
- Socket.io server

### Deployment
- Frontend: Vercel
- Backend: Node environment
- Database: MongoDB instance

---

## 5. Architectural Flow
   Client -> Express Router -> Authentication Middleware -> Authorization Middleware -> Controller -> Database


Authentication and authorization occur before business logic execution.

---

## 6. Authentication Model

### Registration
- User submits credentials
- Password hashed before storage
- User stored with assigned role

### Login
- Credentials validated
- JWT generated and returned
- Token contains identity and role metadata

### Request Flow
Client sends: Authorization: Bearer <token>


Middleware:
- Verifies signature
- Validates expiration
- Extracts user context

Failure responses:
- Invalid token → 401
- Expired token → 401

---

## 7. Authorization Model (RBAC)

Each user has a `role` field.

Authorization is enforced via middleware:

- Role extracted from verified token
- Route-level permission rules validated
- Unauthorized actions return 403

Access control is not dependent on frontend logic.

---

## 8. Data Model

### User Schema

- `name`
- `email` (unique)
- `password` (hashed)
- `role`
- `createdAt`
- `updatedAt`

### Task Schema

- `title`
- `description`
- `assignedUser` (reference)
- `status`
- `createdBy`
- `timestamps`

Relationships:
- Users create tasks
- Tasks may reference assigned users
- Role constraints restrict mutation operations

---

## 9. API Overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Task Management

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Protected routes require valid JWT.

---

## 10. Real-Time Communication

Socket.io enables:

- Live task updates
- Multi-client state synchronization

Server emits events on task mutation.  
Clients subscribe and update UI accordingly.

---

## 11. Security Controls

- Password hashing
- JWT expiration enforcement
- Express rate limiting
- Helmet HTTP headers
- Input validation middleware
- CORS configuration

---

## 12. Failure Handling Strategy

| Scenario | Response Code |
|----------|--------------|
| Invalid credentials | 401 |
| Missing token | 401 |
| Expired token | 401 |
| Insufficient role | 403 |
| Rate limit exceeded | 429 |
| Validation error | 400 |
| Server failure | 500 |

Failures terminate execution before business logic runs.

---

## 13. Environment Variables

Backend requires:
- MONGO_URI=<database_connection_string>
- JWT_SECRET=<secure_random_string>
- PORT=<port_number>


---

## 14. Local Setup

### Backend

```
cd backend
npm install
# create .env file
npm run dev
```
### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 15. Deployment Notes

Frontend hosted on Vercel.

Backend deployment requires:
- Environment variable configuration
- Secure JWT secret
- Production MongoDB instance

Not currently included:
- Container orchestration
- Load balancing
- Horizontal scaling

---

## 16. System Constraints

- Single-tenant design
- Role-based access only (no fine-grained permission matrix)
- No audit logging
- No refresh token rotation
- No distributed locking

## 17. Tradeoffs

- Simplicity over granular permission modeling
- Stateless JWT model over session storage
- MongoDB flexibility over relational strictness
- Basic RBAC instead of policy engine abstraction

---

## 18. Potential Enhancements

- Permission-level RBAC
- Audit trail logging
- Refresh token rotation
- Multi-tenant support
- Dockerized deployment
- CI/CD pipeline
- Automated testing suite

---

## 19. Design Principles

- Separation of concerns
- Backend-enforced security
- Middleware-driven access control
- Stateless authentication
- Layered architecture
