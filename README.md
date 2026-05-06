# HEALTH AI — Co-Creation & Innovation Platform

A secure, full-stack web application that facilitates structured matchmaking between **healthcare professionals** (Doctors) and **engineers** for innovation-driven collaborations. Built for SENG 384 Software Project III.

---

## 🚀 Features

### For All Users
- **Institutional Registration**: Restricted to `.edu` / `.edu.tr` email addresses with 6-digit email verification.
- **Forgot Password**: Secure token-based password recovery flow.
- **Project Discovery**: Browse, search, and filter posts by domain, city, required expertise, status, and date.
- **User Feedback**: Floating feedback button available on all pages.

> **📋 Mock Email (Demo Mode):** This app does not send real emails. Both the **email verification code** and the **password reset token** are printed directly to the Docker terminal logs. After registering or requesting a password reset, check the terminal output for a block like:
> ```
> === MOCK EMAIL ===
> To: yourname@university.edu
> Subject: Verify your Health AI Account
> Token: 482910
> ==================
> ```

### For Healthcare Professionals & Engineers
- **4-Step Meeting Handshake**:
  1. **Express Interest** — Submit a request with a message and NDA acceptance.
  2. **Accept Interest** — Post owner reviews and accepts the request.
  3. **Propose Time** — Requester selects a specific date & time.
  4. **Accept Schedule** — Owner confirms the time to finalize the meeting.
- **Dashboard**: Manage your posts and view all active meeting requests at a glance.
- **Post Management**: Create, edit, publish, or save posts as drafts. Mark a post as "Partner Found" to close it.
- **Profile Management**: Update institution and city, change password, or delete your account (GDPR-compliant).

### For Administrators
- **Admin Portal** with 5 dedicated tabs:
  - **Overview**: High-level platform statistics.
  - **Posts**: Browse, filter by status/domain/date, view details, and remove inappropriate content.
  - **Users**: Browse, filter by role/status/date, view full user profiles & activity, and suspend accounts.
  - **Logs**: Filter the full audit trail by user, action type, and date. Export to CSV.
  - **Feedback**: Review all user-submitted feedback.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React, Vanilla CSS (Glassmorphism) |
| **Backend** | Next.js Server Actions, API Route Handlers |
| **Database** | PostgreSQL 15, Prisma ORM v7 |
| **Security** | JWT sessions (`jose`), password hashing (`bcryptjs`) |
| **Infrastructure** | Docker & Docker Compose |

---

## 📦 Local Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Running with Docker (Recommended)
The project is fully containerized — the app, PostgreSQL database, and pgAdmin all spin up together automatically.

```bash
# From the project root directory (health-ai-app/):
docker-compose up --build
```

Once the build is complete, the database migrates and seeds automatically. Open your browser at:

**→ [http://localhost:3000](http://localhost:3000)**

### Default Seed Users

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@healthai.edu` | `password123` |
| **Doctor** | `dr.smith@med.edu` | `password123` |
| **Engineer** | `dev.jones@tech.edu` | `password123` |


---

*Developed as the final project submission for the HEALTH AI Co-Creation Platform.*
