import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as db from './db/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// API ROUTES FOR SUPABASE DATABASE OPERATIONS
// ==========================================

// 1. Database Health & Connection Status
app.get('/api/status', async (req, res) => {
  try {
    const status = await db.getDatabaseStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Workstations Endpoints (FR-01, FR-02)
app.get('/api/workstations', async (req, res) => {
  try {
    const workstations = await db.getAllWorkstations();
    res.json(workstations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workstations/:id', async (req, res) => {
  try {
    const pc = await db.getWorkstationById(req.params.id);
    if (!pc) return res.status(404).json({ error: 'Workstation not found' });
    res.json(pc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workstations', async (req, res) => {
  try {
    const created = await db.createWorkstation(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workstations/:id', async (req, res) => {
  try {
    const updated = await db.updateWorkstation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Workstation not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workstations/:id', async (req, res) => {
  try {
    const success = await db.deleteWorkstation(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workstations/:id/assign', async (req, res) => {
  try {
    const { user } = req.body;
    const updated = await db.assignWorkstation(req.params.id, user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workstations/:id/release', async (req, res) => {
  try {
    const updated = await db.releaseWorkstation(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Schedules & Timetable Endpoints (FR-04)
app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await db.getAllSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const created = await db.createSchedule(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const success = await db.deleteSchedule(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Maintenance & Fault Ticket Endpoints (FR-03)
app.get('/api/maintenance', async (req, res) => {
  try {
    const logs = await db.getAllMaintenanceLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const log = await db.createMaintenanceLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/maintenance/:id/resolve', async (req, res) => {
  try {
    const result = await db.resolveMaintenanceLog(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Session Attendance Logs (FR-05)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await db.getAllSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions/checkin', async (req, res) => {
  try {
    const { studentName } = req.body;
    if (!studentName) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    const result = await db.checkInStudentSession(studentName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sessions/checkout', async (req, res) => {
  try {
    const { studentName } = req.body;
    if (!studentName) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    const result = await db.checkOutStudentSession(studentName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. User Authentication Endpoints (FR-01)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await db.authenticateUser(email, password || '');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const user = await db.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Lab Usage Summary & Admin Analytics (FR-06)
app.get('/api/reports/summary', async (req, res) => {
  try {
    const summary = await db.getLabReportSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// STATIC ASSETS AND SPA FALLBACK
// ==========================================
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CLMS Server listening on http://0.0.0.0:${PORT}`);
});
