# Multi-Tenant SaaS Project Management System

A full-stack multi-tenant SaaS platform that enables organizations to manage workspaces, teams, projects, tasks, files, and collaboration in real-time.

Built with Node.js, Express.js, MongoDB, React, Socket.IO, and Cloudinary.

---

# Features

## User Management

* User Registration
* User Login & Logout
* Email Verification
* Forgot Password
* Reset Password
* Profile Management
* User Search

---

## Workspace Management

A workspace acts as the top-level organizational unit.

### Workspace Roles

* Admin
* Leader
* Member

### Admin Permissions

* Create Workspace
* Update Workspace
* Delete Workspace
* Invite Members
* Manage Members

### Leader Permissions

* Manage Workspace Members

### Common Permissions

* Leave Workspace

---

## Team Management

Teams are created inside workspaces.

### Team Roles

* Admin
* Leader
* Member

### Admin Permissions

* Create Team
* Invite Members
* Manage Team

### Leader Permissions

* Manage Team Members

### Common Permissions

* Leave Team

---

## Project Management

Projects are created inside teams.

### Features

* Create Project
* Update Project
* Delete Project
* Project Status Management
* Project Approval Workflow
* File Upload Support
* Project Filtering by Status

### Permissions

#### Admin

* Create Project
* Update Project
* Delete Project
* Manage Status
* Delete Files

#### Leader

* Approve Project
* Reject Project

#### Member

* Participate in Project Activities

#### All Members

* Upload Files

---

## Task Management

Tasks are created inside projects.

### Features

* Create Tasks
* Dependency Tasks
* Assign Tasks
* Update Task Status
* Task Approval Workflow
* File Uploads
* Task Comments

### Permissions

#### Admin & Leader

* Create Tasks

#### Task Creator

* Update Assignee

#### Assigned User

* Change Task Status
* Upload Task Files

#### Leader

* Approve Task
* Reject Task

#### All Members

* Add Comments

#### Admin

* Delete Comments

---

## Project Analytics

Each project contains a dedicated analytics dashboard.

Analytics are generated based on:

* Total Tasks
* Task Status Distribution
* Project Progress
* Completion Metrics

---

## Notification System

### User Notifications

* Workspace Invitations
* Workspace Join Requests
* Invitation Acceptance

### Workspace Notifications

* Team Invitations
* Team Join Requests
* Project Join Requests
* Project Approval/Rejection Events

---

## Activity Logging

* User Activities Tracking
* System Event Logging
* Error Logging
* Audit Trail Support

---

# Authentication & Authorization

## Authentication

* JWT Access Tokens
* Refresh Tokens
* Refresh Token Rotation
* Secure HTTP Cookies
* Email Verification
* Password Reset Flow

## Security

* Password Hashing using bcrypt
* Token Hashing using crypto
* OTP Hashing
* Role-Based Access Control (RBAC)

### Authorization Levels

* Workspace Level
* Team Level
* Project Level
* Task Level

Custom middleware verifies:

1. Resource ownership
2. Membership
3. User role

---

# Real-Time Features

Implemented using Socket.IO.

### Real-Time Updates

* Workspace Updates
* Team Updates
* Project Updates
* Task Updates
* Comment Updates
* File Updates
* Notification Updates

### Socket Managers

Dedicated socket managers for:

* User
* Workspace
* Team
* Project
* Task
* Comment
* File

---

# File Management

## Cloudinary Integration

Used for:

* User Avatars
* Project Files
* Task Files

## Multer

Used for:

* Multipart Form Handling
* File Upload Processing

---

# Validation

## Backend Validation

Implemented using Express Validator.

Validated fields include:

* MongoDB IDs
* Names
* Emails
* Passwords
* Status Values

## Frontend Validation

Implemented using React form validation before API requests.

---

# Error Handling

* Async Handler Wrapper
* Centralized Error Handling
* Structured Logging
* MongoDB Transactions

MongoDB sessions are used whenever multiple database operations must succeed or fail together.

---

# Database Optimization

## MongoDB

### Indexing

```javascript
projectSchema.index({ workspaceId: 1, teamId: 1 });
projectSchema.index({ workspaceId: 1, status: 1 });
projectSchema.index({ createdBy: 1 });
```

### Performance Optimizations

* Compound Indexes
* Lean Queries
* Selective Population
* Query Optimization

---

# Security Features

* Helmet
* CORS Protection
* Rate Limiting
* Secure Cookies
* Refresh Token Rotation
* HTTP Parameter Pollution Protection (HPP)
* Compression Middleware
* Input Validation

```javascript
app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(hpp());
app.use(compression());
app.use(globalLimiter);
```

---

# Frontend Features

## Protected Routes

```javascript
function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getAccessToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
```

## React Query

Used for:

* API Data Fetching
* Caching
* Mutations
* Synchronization
* Optimistic Updates

## Reusable API Layer

* Authorized Fetch Wrapper
* Centralized API Handling

---

# Tech Stack

## Frontend

* React 19
* React Router DOM
* TanStack React Query
* Socket.IO Client
* Cloudinary
* Multer

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT
* bcrypt
* Nodemailer
* Resend
* Winston
* Morgan

## Security

* Helmet
* CORS
* HPP
* Express Rate Limit
* Cookie Parser

## Storage

* MongoDB Atlas / MongoDB
* Cloudinary

---

# Project Architecture

```text
Workspace
│
├── Teams
│   │
│   ├── Projects
│   │   │
│   │   ├── Tasks
│   │   │   ├── Comments
│   │   │   └── Files
│   │   │
│   │   └── Analytics
│   │
│   └── Members
│
└── Notifications
```

---

# Future Improvements

* Dashboard Charts
* Advanced Analytics
* Calendar Integration
* Kanban Board
* Activity Log UI
* Search & Filtering Enhancements
* Mobile Responsive Improvements
* Email Notification Templates
* Web Push Notifications

---

# Learning Outcomes

This project demonstrates practical implementation of:

* Multi-Tenant SaaS Architecture
* Authentication & Authorization
* RBAC (Role-Based Access Control)
* Real-Time Communication
* MongoDB Optimization
* Secure API Design
* File Storage Management
* Transaction Handling
* Scalable Backend Development
* Modern React Development
