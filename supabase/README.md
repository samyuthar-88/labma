# Supabase PostgreSQL Integration Guide for LabPulse CLMS

This Computer Lab Management System has been migrated from local in-memory/SQLite storage to **Supabase PostgreSQL**.

---

## 1. Supabase Database Schema

The database consists of 5 relational tables defined in `supabase/schema.sql`:

1. **`workstations`**:
   - `id` (VARCHAR PRIMARY KEY, e.g., 'PC-01' to 'PC-30')
   - `specs` (Hardware specification string)
   - `status` ('Free', 'Occupied', 'Under Repair')
   - `"user"` (Assigned student username)
   - `session_start` (Timestamp / formatted time of session start)
   - `created_at`, `updated_at` (Timestamps)

2. **`schedules`**:
   - `id` (VARCHAR PRIMARY KEY, e.g., 'SLOT-101')
   - `date` (DATE)
   - `time` (Time window string)
   - `purpose` (Module or session description)
   - `booked_by` (Reserving user / faculty)
   - `status` ('Confirmed', 'Pending')
   - `created_at`

3. **`maintenance_logs`**:
   - `id` (VARCHAR PRIMARY KEY, e.g., 'M-01')
   - `pc_id` (Workstation ID reference)
   - `component` (Damaged part, e.g., Monitor, RAM)
   - `description` (Issue description)
   - `date` (Logged date)
   - `status` ('Under Repair', 'Pending', 'Resolved')
   - `created_at`, `updated_at`

4. **`sessions`**:
   - `id` (VARCHAR PRIMARY KEY, e.g., 'SES-501')
   - `student` (Student username)
   - `system` (Workstation ID used)
   - `check_in` (Session start time)
   - `check_out` (Session end time or 'Active')
   - `duration` (Total session duration)
   - `created_at`

5. **`users`**:
   - `id` (VARCHAR PRIMARY KEY, e.g., 'USR-001')
   - `email` (Unique email)
   - `name` (Full user name)
   - `role` ('admin' or 'student')
   - `role_title` ('Administrator' or 'Student User')
   - `avatar` (Two-letter badge)
   - `password_hash` (Bcrypt-hashed password)
   - `created_at`

---

## 2. Setting Up Your Supabase Project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab in your Supabase Dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. Retrieve your API credentials from **Project Settings -> API**:
   - `Project URL`
   - `anon public` key (or `service_role` key for administrative operations)
5. Set these in your environment / settings:
   ```bash
   SUPABASE_URL=https://xyzcompany.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 3. Architecture & Resilience

- **Server-Side Proxy**: All Supabase database queries are executed server-side in `db/supabase.js` and exposed via REST APIs (`/api/*`). No Supabase secret keys are exposed to the browser.
- **Graceful Fallback**: If Supabase environment variables are not yet configured, the system operates seamlessly using the local store seeded with the exact required initial dataset, allowing offline inspection and zero-downtime previews.
- **Real-Time Synchronicity**: Workstation allocations, maintenance logging, schedule slot bookings, and session check-ins reflect immediately across all tables and status metrics.
