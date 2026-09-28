# DeskCheck

DeskCheck is a hybrid office attendance, visual desk booking, and team management web application.

It has two main portals:

- **Employee Portal**: employees can sign in, punch in, choose onsite/remote/leave, book a desk, write a daily focus note, punch out, view history, and edit profile details.
- **Admin Portal**: admins can see live team status, office capacity, onsite/remote/leave counts, force punch-out forgotten shifts, edit work status, assign desks, search/filter employees, and export attendance data as CSV.

The app is built as a full-stack Next.js project with local secure authentication and a local SQLite database.

---

## How To Run On A New Laptop

### 1. Install Required Software

Install:

- **Node.js 20+ or 22+**
- **VS Code**

You can check Node.js by running:

```bash
node --version
npm --version
```

---

### 2. Open The Project In VS Code

1. Open VS Code.
2. Click **File > Open Folder**.
3. Select the project folder:

```text
Team Management
```

---

### 3. Install Project Packages

Open the VS Code terminal:

```text
Terminal > New Terminal
```

Then run:

```bash
npm install
```

This installs Next.js, React, Prisma, Tailwind CSS, bcrypt, Framer Motion, Lucide icons, and other required packages.

---

### 4. Create The Local Database

Run:

```bash
npm run db:init
```

This creates the local SQLite database and adds demo users.

---

### 5. Start The App

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Demo Login Accounts

### Employee

```text
Email: deepak@gmail.com
Password: Deskcheck@123
```

### Admin

```text
Email: admin@deskcheck.local
Password: Deskcheck@123
```

---

## Useful Commands

### Start Development Server

```bash
npm run dev
```

### Build For Production

```bash
npm run build
```

### Start Production Server After Build

```bash
npm run start
```

### Initialize Local Database

```bash
npm run db:init
```

### Generate Prisma Client

```bash
npx prisma generate
```

---

## Project Summary In Simple English

DeskCheck helps a company manage hybrid office attendance.

Employees can log whether they are:

- working from office,
- working from home,
- or on leave.

If an employee comes to the office, they can select a desk from a visual desk map. The system checks if the desk is already booked before saving it.

Admins can see all employees in one dashboard. They can check who is onsite, who is remote, who is on leave, and who forgot to punch out.

This is useful for HR, office admins, engineering managers, and team leads because it gives one clear view of daily attendance and office capacity.

---

## HR-Friendly Explanation

DeskCheck is a digital attendance and desk management system for hybrid teams.

Instead of using spreadsheets or manual attendance registers, employees can log in and mark their work status for the day. If they are coming to the office, they can book a desk. If they are working from home, they can mark remote. If they are unavailable, they can mark leave.

HR or admins can see the full team status from one dashboard. They can also fix common attendance issues, such as an employee forgetting to punch out. Reports can be exported as CSV for attendance tracking.

In short, DeskCheck improves:

- attendance accuracy,
- office desk planning,
- HR visibility,
- hybrid work coordination,
- and reporting.

---

## Why This Tech Stack Was Chosen

### Next.js

Next.js is used because it supports both frontend and backend in one project.

It gives:

- fast pages,
- server-side logic,
- protected routes,
- server actions,
- easy deployment later,
- and a clean folder structure.

### TypeScript

TypeScript helps prevent mistakes while coding.

It checks data types and makes the project easier to maintain as it grows.

### Tailwind CSS

Tailwind CSS is used for styling because it is fast and consistent.

It helps build clean UI screens without writing large separate CSS files.

### Prisma ORM

Prisma is used to communicate with the database.

It makes database code easier to read and safer than writing raw SQL everywhere.

### SQLite

SQLite is used for local development because it does not need a separate database server.

This makes the project easy to run on any laptop.

Later, the same Prisma setup can be moved to PostgreSQL for production.

### bcryptjs

bcryptjs is used to hash passwords.

The app does not store plain text passwords. It stores hashed passwords for safer local authentication.

### Session Cookies

Session cookies are used to keep users logged in securely.

Employees and admins are redirected to different dashboards based on their role.

### Framer Motion

Framer Motion is used for smooth UI animations.

### Lucide React

Lucide React provides clean icons for buttons, cards, and dashboards.

---

## Main Features

### Landing Page

The landing page explains what DeskCheck does.

It includes:

- project description,
- sign-in button,
- create-account button,
- dark/light theme toggle,
- explanation of how the app works.

File:

```text
app/page.tsx
```

---

### Login Page

Users sign in with email and password.

There are no demo bypass buttons, so users must login normally.

File:

```text
app/login/page.tsx
components/AuthClient.tsx
```

---

### Register Page

New users can create an account.

Registration asks for:

- full name,
- work email,
- phone number,
- password,
- role.

Roles decide whether the user is an employee or admin.

Employee roles:

- Software Engineer
- Software Developer
- Technology Intern

Admin roles:

- HR Specialist
- Engineering Manager

Files:

```text
app/register/page.tsx
components/AuthClient.tsx
app/actions.ts
```

---

### Password Reset

The login/register screen includes a mock password reset modal.

Users can enter their email and a new password.

File:

```text
components/AuthClient.tsx
app/actions.ts
```

---

### Employee Dashboard

Employees can:

- punch in,
- select onsite, remote, or leave,
- choose a desk when onsite,
- write a daily focus note,
- punch out,
- view attendance history,
- view team directory,
- edit profile,
- toggle dark/light mode.

Files:

```text
app/employee/dashboard/page.tsx
components/EmployeeDashboard.tsx
app/actions.ts
```

---

### Visual Desk Booking

The office has desks:

```text
A1 to A8
B1 to B8
```

When an employee selects onsite mode, they can choose an available desk.

The backend checks if the desk is already booked before saving.

Files:

```text
components/EmployeeDashboard.tsx
app/actions.ts
lib/utils.ts
```

---

### Punch Out

Employees can punch out after work.

The system stores punch-out time and closes the shift.

Admins can also force punch-out if an employee forgets.

Files:

```text
app/actions.ts
components/EmployeeDashboard.tsx
components/AdminDashboard.tsx
```

---

### Admin Dashboard

Admins can:

- view all employees,
- see onsite count,
- see remote count,
- see leave count,
- see office capacity,
- search employees,
- filter by status,
- force punch-out,
- edit status,
- assign desks,
- export CSV,
- toggle dark/light mode.

Files:

```text
app/admin/dashboard/page.tsx
components/AdminDashboard.tsx
app/actions.ts
```

---

### Force Punch-Out

If an employee forgets to punch out, admin can click **Force Punch-Out**.

The employee is not shown as simply “Not checked in.”

Instead, the admin table shows:

```text
Punched out · ONSITE
```

or:

```text
Punched out · REMOTE
```

with punch-in and punch-out times.

Files:

```text
components/AdminDashboard.tsx
app/admin/dashboard/page.tsx
app/actions.ts
```

---

### CSV Export

Admins can export attendance data.

The CSV includes:

- name,
- email,
- role,
- date,
- mode,
- desk,
- punch-in time,
- punch-out time,
- daily note.

File:

```text
app/actions.ts
components/AdminDashboard.tsx
```

---

### Dark/Light Mode

Dark/light mode is available on:

- landing page,
- employee dashboard,
- admin dashboard.

The selected theme is saved in browser local storage.

Files:

```text
components/ThemeToggle.tsx
components/EmployeeDashboard.tsx
components/AdminDashboard.tsx
```

---

## Folder And File Explanation

### `package.json`

Defines the project name, dependencies, and scripts.

Important scripts:

```json
"dev": "next dev",
"build": "prisma generate && next build",
"start": "next start",
"db:init": "node scripts/init-db.mjs"
```

---

### `.env`

Stores environment variables.

Current values:

```text
DATABASE_URL="file:./dev.db"
SESSION_SECRET="deskcheck-local-secret-change-me"
```

`DATABASE_URL` tells Prisma to use the SQLite database.

---

### `app/layout.tsx`

Main layout for the full app.

It loads global CSS and wraps all pages.

---

### `app/globals.css`

Global styles.

Includes:

- Tailwind setup,
- body colors,
- glass card styles,
- input field styles.

---

### `app/page.tsx`

Landing page.

Explains DeskCheck and gives links to login/register.

---

### `app/login/page.tsx`

Login page.

Uses the shared auth component.

---

### `app/register/page.tsx`

Registration page.

Uses the shared auth component.

---

### `app/employee/dashboard/page.tsx`

Server-side employee dashboard route.

It:

- checks if user is logged in,
- blocks admins from employee page,
- loads active shift,
- loads occupied desks,
- loads attendance history,
- loads team directory.

---

### `app/admin/dashboard/page.tsx`

Server-side admin dashboard route.

It:

- checks if user is admin,
- loads employees,
- loads today’s shifts,
- calculates metrics,
- prepares data for admin table.

---

### `app/actions.ts`

Server actions.

This file contains backend logic for:

- register,
- login,
- reset password,
- logout,
- punch in,
- punch out,
- force punch-out,
- edit status,
- update profile,
- export CSV.

This is one of the most important files in the project.

---

### `components/AuthClient.tsx`

Frontend component for login and register screens.

It includes:

- login form,
- register form,
- password visibility toggle,
- password strength text,
- role selection cards,
- forgot password modal,
- sign-in project instructions.

---

### `components/EmployeeDashboard.tsx`

Frontend component for employee portal.

It includes:

- active shift card,
- live shift timer,
- punch-in modal,
- desk grid,
- punch-out button,
- attendance history,
- team directory,
- profile modal,
- theme toggle.

---

### `components/AdminDashboard.tsx`

Frontend component for admin portal.

It includes:

- metrics cards,
- employee table,
- mobile employee cards,
- search,
- filters,
- export CSV,
- force punch-out,
- edit status,
- desk assignment,
- auto refresh,
- theme toggle.

---

### `components/ThemeToggle.tsx`

Reusable dark/light mode button.

Used on the landing page.

---

### `lib/auth.ts`

Authentication helper functions.

It handles:

- creating sessions,
- deleting sessions,
- reading current user,
- requiring login,
- requiring admin,
- password hashing,
- password verification.

---

### `lib/prisma.ts`

Creates the Prisma database client.

Other files use this client to read/write database data.

---

### `lib/utils.ts`

Small helper functions and shared constants.

It includes:

- desk list,
- date helper,
- class name helper,
- CSV escaping helper.

---

### `prisma/schema.prisma`

Database schema.

Main tables:

- `User`
- `Session`
- `Attendance`

---

### `scripts/init-db.mjs`

Creates the SQLite database manually for local development.

It also inserts demo users.

This is useful because the app can run easily on a new laptop without setting up PostgreSQL.

---

### `tailwind.config.ts`

Tailwind CSS configuration.

Includes custom colors:

- primary indigo,
- onsite emerald,
- remote green,
- leave rose.

---

### `next.config.mjs`

Next.js config file.

Currently simple and clean.

---

### `tsconfig.json`

TypeScript configuration.

It tells TypeScript how to check the project.

---

## Database Tables

### User

Stores account details.

Important fields:

- `name`
- `email`
- `phone`
- `role`
- `isAdmin`
- `passwordHash`

---

### Session

Stores login sessions.

Important fields:

- `tokenHash`
- `userId`
- `expiresAt`

---

### Attendance

Stores shift records.

Important fields:

- `userId`
- `date`
- `mode`
- `desk`
- `standupNote`
- `punchInAt`
- `punchOutAt`
- `status`
- `forcedById`

---

## How The App Works Internally

### Login Flow

1. User enters email and password.
2. Server checks the user in the database.
3. Password is compared with the stored password hash.
4. If correct, a session token is created.
5. User is redirected:
   - admin goes to `/admin/dashboard`,
   - employee goes to `/employee/dashboard`.

---

### Registration Flow

1. User enters profile details.
2. User selects a role.
3. Role decides whether the account is admin or employee.
4. Password is hashed using bcrypt.
5. User is saved in database.
6. Session is created.
7. User is redirected to the correct dashboard.

---

### Employee Punch-In Flow

1. Employee clicks Punch In.
2. Employee chooses work mode:
   - Onsite,
   - Remote,
   - Leave.
3. If onsite, employee selects a desk.
4. Employee writes daily focus note.
5. Server checks if employee already has an active shift.
6. Server checks if selected desk is free.
7. Attendance record is created.

---

### Employee Punch-Out Flow

1. Employee clicks Punch Out.
2. Server finds active shift.
3. Server saves punch-out time.
4. Shift status becomes closed.

---

### Admin Force Punch-Out Flow

1. Admin clicks Force Punch-Out.
2. Server closes that employee’s active shift.
3. Punch-out time is saved.
4. Admin table still shows the completed shift details.

---

### Admin Export Flow

1. Admin clicks Export CSV.
2. Server reads attendance records.
3. Data is converted into CSV format.
4. Browser downloads the file.

---

## Important Safety Logic

### Preventing Desk Conflicts

Before saving an onsite punch-in, the backend checks:

```text
Is this desk already booked by another active employee today?
```

If yes, the punch-in is blocked.

---

### Preventing Unclosed Shift Problems

The app includes:

- employee punch-out,
- admin force punch-out,
- stale shift auto-close guard.

This helps avoid open shifts staying active forever.

---

### Password Safety

The app stores password hashes, not plain passwords.

---

## How To Explain This Project In An Interview Or To HR

You can say:

> DeskCheck is a hybrid office attendance and desk booking platform. Employees can securely log in, mark whether they are working from office, remote, or on leave, and book a desk if they are onsite. Admins and HR can view all employees from a central dashboard, track attendance status, handle forgotten punch-outs, and export attendance reports. The project is built using Next.js, TypeScript, Tailwind CSS, Prisma, SQLite, and secure local password authentication.

Short version:

> DeskCheck replaces manual attendance sheets with a modern web app for hybrid teams. It helps HR track who is onsite, remote, or on leave, while also preventing desk booking conflicts.

---

## Future Improvements

Possible next features:

- real email-based password reset,
- PostgreSQL production database,
- calendar integration,
- manager approval for leave,
- PDF reports,
- role permissions beyond admin/employee,
- WebSocket live updates,
- deployment to Vercel or another hosting platform.

---

## Notes

This project currently uses SQLite for easy local setup.

For production, PostgreSQL is recommended.

