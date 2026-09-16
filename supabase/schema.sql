-- ====================================================================
-- Computer Lab Management System (LabPulse CLMS)
-- Supabase PostgreSQL Database Schema & Migration Script
-- ====================================================================

-- 1. WORKSTATIONS TABLE
-- Tracks real-time lab hardware units, specifications, and allocation status.
CREATE TABLE IF NOT EXISTS workstations (
    id VARCHAR(50) PRIMARY KEY,
    specs TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Free' CHECK (status IN ('Free', 'Occupied', 'Under Repair')),
    "user" VARCHAR(100) DEFAULT '-',
    session_start VARCHAR(50) DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHEDULES TABLE
-- Lab timetable slot reservations for classes, workshops, and student sessions.
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    booked_by VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MAINTENANCE LOGS TABLE
-- Fault tickets reported for specific workstations and tracking resolution.
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id VARCHAR(50) PRIMARY KEY,
    pc_id VARCHAR(50) NOT NULL,
    component VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Repair', 'Resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS TABLE
-- Attendance and session monitoring with check-in and check-out tracking.
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(50) PRIMARY KEY,
    student VARCHAR(100) NOT NULL,
    system VARCHAR(50) NOT NULL,
    check_in VARCHAR(50) NOT NULL,
    check_out VARCHAR(50) DEFAULT 'Active',
    duration VARCHAR(50) DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USERS TABLE
-- User profiles and authentication for Admin and Student roles.
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    role_title VARCHAR(100) NOT NULL DEFAULT 'Student User',
    avatar VARCHAR(10) NOT NULL DEFAULT 'ST',
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workstations_status ON workstations(status);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student);

-- Enable Row Level Security (RLS)
ALTER TABLE workstations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permissive policies for CLMS backend / client operations
DROP POLICY IF EXISTS "Public workstation access" ON workstations;
CREATE POLICY "Public workstation access" ON workstations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public schedule access" ON schedules;
CREATE POLICY "Public schedule access" ON schedules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public maintenance access" ON maintenance_logs;
CREATE POLICY "Public maintenance access" ON maintenance_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public session access" ON sessions;
CREATE POLICY "Public session access" ON sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public users access" ON users;
CREATE POLICY "Public users access" ON users FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

-- Seed Workstations (PC-01 to PC-30 matching existing project structure)
INSERT INTO workstations (id, specs, status, "user", session_start)
VALUES
('PC-01', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_100', '09:15 AM'),
('PC-02', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-03', 'Intel i5, 16GB RAM, 512GB SSD', 'Under Repair', '-', '-'),
('PC-04', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_103', '09:15 AM'),
('PC-05', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-06', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-07', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_106', '09:15 AM'),
('PC-08', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-09', 'Intel i5, 16GB RAM, 512GB SSD', 'Under Repair', '-', '-'),
('PC-10', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_109', '09:15 AM'),
('PC-11', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-12', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-13', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_112', '09:15 AM'),
('PC-14', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-15', 'Intel i5, 16GB RAM, 512GB SSD', 'Under Repair', '-', '-'),
('PC-16', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_115', '09:15 AM'),
('PC-17', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-18', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-19', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_118', '09:15 AM'),
('PC-20', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-21', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-22', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_121', '09:15 AM'),
('PC-23', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-24', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-25', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_124', '09:15 AM'),
('PC-26', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-27', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-28', 'Intel i5, 16GB RAM, 512GB SSD', 'Occupied', 'Student_127', '09:15 AM'),
('PC-29', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-'),
('PC-30', 'Intel i5, 16GB RAM, 512GB SSD', 'Free', '-', '-')
ON CONFLICT (id) DO NOTHING;

-- Seed Schedules
INSERT INTO schedules (id, date, time, purpose, booked_by, status)
VALUES
('SLOT-101', '2026-09-02', '09:00 AM - 11:00 AM', 'CS101 Lab Session', 'Prof. Alan Turing', 'Confirmed'),
('SLOT-102', '2026-09-02', '11:00 AM - 01:00 PM', 'Database Systems', 'Dr. Grace Hopper', 'Confirmed')
ON CONFLICT (id) DO NOTHING;

-- Seed Maintenance Logs
INSERT INTO maintenance_logs (id, pc_id, component, description, date, status)
VALUES
('M-01', 'PC-03', 'Monitor', 'Display flickers continuously', '2026-08-28', 'Under Repair'),
('M-02', 'PC-09', 'Mouse', 'Right click non-functional', '2026-08-30', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Sessions
INSERT INTO sessions (id, student, system, check_in, check_out, duration)
VALUES
('SES-501', 'Student_103', 'PC-04', '09:00 AM', '10:30 AM', '1h 30m'),
('SES-502', 'Student_106', 'PC-07', '09:15 AM', 'Active', '-')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Users (Admin and Student)
INSERT INTO users (id, email, name, role, role_title, avatar, password_hash)
VALUES
('USR-001', 'turing@university.edu', 'Prof. Alan Turing', 'admin', 'Administrator', 'AD', '$2a$10$v7aXm7tqZc2R1O0eIe7kMeZ9wB5hF9Y2pW0C9uB.f0k3g1a2b3c4d'),
('USR-002', 'hopper@university.edu', 'Dr. Grace Hopper', 'admin', 'Administrator', 'GH', '$2a$10$v7aXm7tqZc2R1O0eIe7kMeZ9wB5hF9Y2pW0C9uB.f0k3g1a2b3c4d'),
('USR-003', 'student1@university.edu', 'Student User', 'student', 'Student User', 'SU', '$2a$10$v7aXm7tqZc2R1O0eIe7kMeZ9wB5hF9Y2pW0C9uB.f0k3g1a2b3c4d')
ON CONFLICT (id) DO NOTHING;
