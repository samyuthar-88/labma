import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Environment variables for Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

let supabaseClient = null;
let isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Lazy initialization of Supabase client
export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      console.log(`[Database] Supabase client initialized with URL: ${supabaseUrl}`);
    } catch (err) {
      console.error('[Database] Failed to initialize Supabase client:', err.message);
      return null;
    }
  }
  return supabaseClient;
}

// Initial seed dataset matching project requirements
function getInitialSeedData() {
  const workstations = Array.from({ length: 30 }, (_, i) => {
    const id = `PC-${String(i + 1).padStart(2, '0')}`;
    let status = 'Free';
    let user = '-';
    let session_start = '-';

    if (i === 2 || i === 8 || i === 14) {
      status = 'Under Repair';
    } else if (i % 3 === 0) {
      status = 'Occupied';
      user = `Student_${100 + i}`;
      session_start = '09:15 AM';
    }

    return {
      id,
      specs: 'Intel i5, 16GB RAM, 512GB SSD',
      status,
      user,
      session_start,
      sessionStart: session_start
    };
  });

  const schedules = [
    { id: 'SLOT-101', date: '2026-09-02', time: '09:00 AM - 11:00 AM', purpose: 'CS101 Lab Session', booked_by: 'Prof. Alan Turing', bookedBy: 'Prof. Alan Turing', status: 'Confirmed' },
    { id: 'SLOT-102', date: '2026-09-02', time: '11:00 AM - 01:00 PM', purpose: 'Database Systems', booked_by: 'Dr. Grace Hopper', bookedBy: 'Dr. Grace Hopper', status: 'Confirmed' }
  ];

  const maintenanceLogs = [
    { id: 'M-01', pc_id: 'PC-03', pcId: 'PC-03', component: 'Monitor', desc: 'Display flickers continuously', description: 'Display flickers continuously', date: '2026-08-28', status: 'Under Repair' },
    { id: 'M-02', pc_id: 'PC-09', pcId: 'PC-09', component: 'Mouse', desc: 'Right click non-functional', description: 'Right click non-functional', date: '2026-08-30', status: 'Pending' }
  ];

  const sessions = [
    { id: 'SES-501', student: 'Student_103', system: 'PC-04', check_in: '09:00 AM', checkIn: '09:00 AM', check_out: '10:30 AM', checkOut: '10:30 AM', duration: '1h 30m' },
    { id: 'SES-502', student: 'Student_106', system: 'PC-07', check_in: '09:15 AM', checkIn: '09:15 AM', check_out: 'Active', checkOut: 'Active', duration: '-' }
  ];

  const users = [
    {
      id: 'USR-001',
      email: 'turing@university.edu',
      name: 'Prof. Alan Turing',
      role: 'admin',
      role_title: 'Administrator',
      roleTitle: 'Administrator',
      avatar: 'AD',
      password_hash: bcrypt.hashSync('admin123', 10)
    },
    {
      id: 'USR-002',
      email: 'hopper@university.edu',
      name: 'Dr. Grace Hopper',
      role: 'admin',
      role_title: 'Administrator',
      roleTitle: 'Administrator',
      avatar: 'GH',
      password_hash: bcrypt.hashSync('admin123', 10)
    },
    {
      id: 'USR-003',
      email: 'student@university.edu',
      name: 'Student User',
      role: 'student',
      role_title: 'Student User',
      roleTitle: 'Student User',
      avatar: 'SU',
      password_hash: bcrypt.hashSync('student123', 10)
    }
  ];

  return { workstations, schedules, maintenanceLogs, sessions, users };
}

// Local resilient data store (active when Supabase URL/Key is not yet set or during network offline)
const localStore = getInitialSeedData();

// --- Helper Functions to normalize objects ---
function normalizePC(row) {
  if (!row) return null;
  return {
    id: row.id,
    specs: row.specs || 'Intel i5, 16GB RAM, 512GB SSD',
    status: row.status || 'Free',
    user: row.user || '-',
    sessionStart: row.session_start || row.sessionStart || '-',
    session_start: row.session_start || row.sessionStart || '-'
  };
}

function normalizeSchedule(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    purpose: row.purpose,
    bookedBy: row.booked_by || row.bookedBy || 'User',
    booked_by: row.booked_by || row.bookedBy || 'User',
    status: row.status || 'Confirmed'
  };
}

function normalizeMaintenance(row) {
  if (!row) return null;
  return {
    id: row.id,
    pcId: row.pc_id || row.pcId,
    pc_id: row.pc_id || row.pcId,
    component: row.component,
    desc: row.description || row.desc || '',
    description: row.description || row.desc || '',
    date: row.date,
    status: row.status || 'Pending'
  };
}

function normalizeSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    student: row.student,
    system: row.system,
    checkIn: row.check_in || row.checkIn,
    check_in: row.check_in || row.checkIn,
    checkOut: row.check_out || row.checkOut || 'Active',
    check_out: row.check_out || row.checkOut || 'Active',
    duration: row.duration || '-'
  };
}

// Check database connectivity
export async function getDatabaseStatus() {
  const client = getSupabase();
  if (!client) {
    return {
      provider: 'local',
      connected: true,
      supabaseConfigured: false,
      message: 'Running on local relational store. Provide SUPABASE_URL and SUPABASE_ANON_KEY to route all operations to Supabase PostgreSQL cloud.',
      tables: {
        workstations: localStore.workstations.length,
        schedules: localStore.schedules.length,
        maintenanceLogs: localStore.maintenanceLogs.length,
        sessions: localStore.sessions.length,
        users: localStore.users.length
      }
    };
  }

  try {
    const { data, error } = await client.from('workstations').select('id', { count: 'exact' }).limit(1);
    if (error) {
      console.warn('[Database] Supabase query returned error (tables might need creation via supabase/schema.sql):', error.message);
      return {
        provider: 'supabase',
        connected: false,
        supabaseConfigured: true,
        error: error.message,
        hint: 'Please run the schema from supabase/schema.sql in your Supabase SQL Editor.',
        tables: {
          workstations: localStore.workstations.length,
          schedules: localStore.schedules.length,
          maintenanceLogs: localStore.maintenanceLogs.length,
          sessions: localStore.sessions.length
        }
      };
    }

    // Connected and working!
    return {
      provider: 'supabase',
      connected: true,
      supabaseConfigured: true,
      message: 'Successfully connected to Supabase PostgreSQL instance.',
      url: supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co'
    };
  } catch (err) {
    return {
      provider: 'supabase',
      connected: false,
      supabaseConfigured: true,
      error: err.message
    };
  }
}

// ==========================================
// WORKSTATIONS OPERATIONS (FR-01, FR-02)
// ==========================================
export async function getAllWorkstations() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('workstations').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(normalizePC);
      }
    } catch (e) {
      console.warn('[Supabase] getAllWorkstations error, falling back to local store:', e.message);
    }
  }
  return localStore.workstations.map(normalizePC);
}

export async function getWorkstationById(id) {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('workstations').select('*').eq('id', id).single();
      if (!error && data) {
        return normalizePC(data);
      }
    } catch (e) {
      console.warn(`[Supabase] getWorkstationById(${id}) error:`, e.message);
    }
  }
  const pc = localStore.workstations.find(w => w.id === id);
  return pc ? normalizePC(pc) : null;
}

export async function updateWorkstation(id, updates) {
  const payload = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.specs !== undefined) payload.specs = updates.specs;
  if (updates.user !== undefined) payload.user = updates.user;
  if (updates.sessionStart !== undefined || updates.session_start !== undefined) {
    payload.session_start = updates.sessionStart || updates.session_start;
  }

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('workstations').update(payload).eq('id', id).select().single();
      if (!error && data) {
        return normalizePC(data);
      }
    } catch (e) {
      console.warn(`[Supabase] updateWorkstation(${id}) error:`, e.message);
    }
  }

  // Update in local store
  const pc = localStore.workstations.find(w => w.id === id);
  if (pc) {
    Object.assign(pc, updates);
    if (updates.sessionStart) pc.session_start = updates.sessionStart;
    return normalizePC(pc);
  }
  return null;
}

export async function createWorkstation(data) {
  const newPC = {
    id: data.id,
    specs: data.specs || 'Intel i5, 16GB RAM, 512GB SSD',
    status: data.status || 'Free',
    user: data.user || '-',
    session_start: data.sessionStart || data.session_start || '-'
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data: created, error } = await client.from('workstations').insert([newPC]).select().single();
      if (!error && created) {
        return normalizePC(created);
      }
    } catch (e) {
      console.warn('[Supabase] createWorkstation error:', e.message);
    }
  }

  localStore.workstations.push(newPC);
  return normalizePC(newPC);
}

export async function deleteWorkstation(id) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('workstations').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] deleteWorkstation error:', e.message);
    }
  }
  const idx = localStore.workstations.findIndex(w => w.id === id);
  if (idx !== -1) {
    localStore.workstations.splice(idx, 1);
    return true;
  }
  return false;
}

export async function assignWorkstation(id, user) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return await updateWorkstation(id, {
    status: 'Occupied',
    user: user || 'Student User',
    sessionStart: time,
    session_start: time
  });
}

export async function releaseWorkstation(id) {
  return await updateWorkstation(id, {
    status: 'Free',
    user: '-',
    sessionStart: '-',
    session_start: '-'
  });
}

// ==========================================
// SCHEDULES OPERATIONS (FR-04)
// ==========================================
export async function getAllSchedules() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('schedules').select('*').order('date', { ascending: true });
      if (!error && data) {
        return data.map(normalizeSchedule);
      }
    } catch (e) {
      console.warn('[Supabase] getAllSchedules error:', e.message);
    }
  }
  return localStore.schedules.map(normalizeSchedule);
}

export async function createSchedule(data) {
  const id = data.id || `SLOT-${100 + localStore.schedules.length + 1}`;
  const record = {
    id,
    date: data.date,
    time: data.time,
    purpose: data.purpose,
    booked_by: data.bookedBy || data.booked_by || 'User',
    status: data.status || 'Confirmed'
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data: created, error } = await client.from('schedules').insert([record]).select().single();
      if (!error && created) {
        return normalizeSchedule(created);
      }
    } catch (e) {
      console.warn('[Supabase] createSchedule error:', e.message);
    }
  }

  localStore.schedules.push(record);
  return normalizeSchedule(record);
}

export async function deleteSchedule(id) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('schedules').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase] deleteSchedule error:', e.message);
    }
  }
  const idx = localStore.schedules.findIndex(s => s.id === id);
  if (idx !== -1) {
    localStore.schedules.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// MAINTENANCE OPERATIONS (FR-03)
// ==========================================
export async function getAllMaintenanceLogs() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('maintenance_logs').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(normalizeMaintenance);
      }
    } catch (e) {
      console.warn('[Supabase] getAllMaintenanceLogs error:', e.message);
    }
  }
  return localStore.maintenanceLogs.map(normalizeMaintenance);
}

export async function createMaintenanceLog(data) {
  const id = data.id || `M-${String(localStore.maintenanceLogs.length + 1).padStart(2, '0')}`;
  const record = {
    id,
    pc_id: data.pcId || data.pc_id,
    component: data.component,
    description: data.desc || data.description || '',
    date: data.date || new Date().toISOString().split('T')[0],
    status: data.status || 'Under Repair'
  };

  // Also update target workstation status to 'Under Repair'
  await updateWorkstation(record.pc_id, {
    status: 'Under Repair',
    user: '-',
    sessionStart: '-'
  });

  const client = getSupabase();
  if (client) {
    try {
      const { data: created, error } = await client.from('maintenance_logs').insert([record]).select().single();
      if (!error && created) {
        return normalizeMaintenance(created);
      }
    } catch (e) {
      console.warn('[Supabase] createMaintenanceLog error:', e.message);
    }
  }

  localStore.maintenanceLogs.push(record);
  return normalizeMaintenance(record);
}

export async function resolveMaintenanceLog(id) {
  let targetPcId = null;

  const client = getSupabase();
  if (client) {
    try {
      const { data: log } = await client.from('maintenance_logs').select('*').eq('id', id).single();
      if (log) {
        targetPcId = log.pc_id;
        await client.from('maintenance_logs').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('[Supabase] resolveMaintenanceLog error:', e.message);
    }
  }

  const idx = localStore.maintenanceLogs.findIndex(m => m.id === id);
  if (idx !== -1) {
    targetPcId = targetPcId || localStore.maintenanceLogs[idx].pc_id || localStore.maintenanceLogs[idx].pcId;
    localStore.maintenanceLogs.splice(idx, 1);
  }

  if (targetPcId) {
    await updateWorkstation(targetPcId, {
      status: 'Free',
      user: '-',
      sessionStart: '-'
    });
  }

  return { success: true, resolvedId: id, pcId: targetPcId };
}

// ==========================================
// SESSION & ATTENDANCE OPERATIONS (FR-05)
// ==========================================
export async function getAllSessions() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('sessions').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(normalizeSession);
      }
    } catch (e) {
      console.warn('[Supabase] getAllSessions error:', e.message);
    }
  }
  return localStore.sessions.map(normalizeSession);
}

export async function checkInStudentSession(studentName) {
  // Find first available free PC
  const allPCs = await getAllWorkstations();
  const freePC = allPCs.find(w => w.status === 'Free');

  if (!freePC) {
    throw new Error('No free workstations currently available in the lab.');
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sessionId = `SES-${Math.floor(500 + Math.random() * 400)}`;

  // Mark PC as occupied
  await updateWorkstation(freePC.id, {
    status: 'Occupied',
    user: studentName,
    sessionStart: time
  });

  const record = {
    id: sessionId,
    student: studentName,
    system: freePC.id,
    check_in: time,
    check_out: 'Active',
    duration: '-'
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data: created, error } = await client.from('sessions').insert([record]).select().single();
      if (!error && created) {
        return { session: normalizeSession(created), workstation: freePC.id };
      }
    } catch (e) {
      console.warn('[Supabase] checkInStudentSession error:', e.message);
    }
  }

  localStore.sessions.unshift(record);
  return { session: normalizeSession(record), workstation: freePC.id };
}

export async function checkOutStudentSession(studentName) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Release workstation allocated to this student
  const allPCs = await getAllWorkstations();
  const userPC = allPCs.find(w => w.user === studentName);
  if (userPC) {
    await updateWorkstation(userPC.id, {
      status: 'Free',
      user: '-',
      sessionStart: '-'
    });
  }

  // 2. Update active session in Supabase or local store
  const client = getSupabase();
  if (client) {
    try {
      const { data: activeSes } = await client
        .from('sessions')
        .select('*')
        .eq('student', studentName)
        .eq('check_out', 'Active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeSes) {
        const { data: updated } = await client
          .from('sessions')
          .update({
            check_out: time,
            duration: 'Completed'
          })
          .eq('id', activeSes.id)
          .select()
          .single();

        if (updated) {
          return normalizeSession(updated);
        }
      }
    } catch (e) {
      console.warn('[Supabase] checkOutStudentSession error:', e.message);
    }
  }

  const active = localStore.sessions.find(s => s.student === studentName && (s.check_out === 'Active' || s.checkOut === 'Active'));
  if (active) {
    active.check_out = time;
    active.checkOut = time;
    active.duration = 'Completed';
    return normalizeSession(active);
  }

  return { student: studentName, status: 'Checked out' };
}

// ==========================================
// USER AUTH & PROFILES (FR-01)
// ==========================================
export async function authenticateUser(email, password) {
  const client = getSupabase();
  if (client) {
    try {
      const { data: user, error } = await client.from('users').select('*').eq('email', email.toLowerCase().trim()).single();
      if (!error && user) {
        const isMatch = user.password_hash ? bcrypt.compareSync(password, user.password_hash) : true;
        if (isMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            roleTitle: user.role_title || (user.role === 'admin' ? 'Administrator' : 'Student User'),
            avatar: user.avatar || user.name.substring(0, 2).toUpperCase()
          };
        }
      }
    } catch (e) {
      console.warn('[Supabase] authenticateUser error:', e.message);
    }
  }

  // Fallback to local store or standard mock login
  const localUser = localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (localUser) {
    return {
      id: localUser.id,
      email: localUser.email,
      name: localUser.name,
      role: localUser.role,
      roleTitle: localUser.role_title || (localUser.role === 'admin' ? 'Administrator' : 'Student User'),
      avatar: localUser.avatar
    };
  }

  // Default guest/student login based on email
  const nameFromEmail = email.split('@')[0].replace('.', ' ');
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  return {
    id: `USR-${Date.now()}`,
    email,
    name: formattedName,
    role: email.includes('admin') || email.includes('prof') ? 'admin' : 'student',
    roleTitle: email.includes('admin') || email.includes('prof') ? 'Administrator' : 'Student User',
    avatar: formattedName.substring(0, 2).toUpperCase()
  };
}

export async function registerUser(userData) {
  const { email, password, name, role } = userData;
  const id = `USR-${Date.now()}`;
  const hash = bcrypt.hashSync(password || 'password123', 10);
  const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const userRecord = {
    id,
    email: email.toLowerCase().trim(),
    name,
    role: role || 'student',
    role_title: role === 'admin' ? 'Administrator' : 'Student User',
    avatar,
    password_hash: hash
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data: created, error } = await client.from('users').insert([userRecord]).select().single();
      if (!error && created) {
        return {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
          roleTitle: created.role_title,
          avatar: created.avatar
        };
      }
    } catch (e) {
      console.warn('[Supabase] registerUser error:', e.message);
    }
  }

  localStore.users.push(userRecord);
  return {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    role: userRecord.role,
    roleTitle: userRecord.role_title,
    avatar: userRecord.avatar
  };
}

// ==========================================
// REPORTS & SUMMARY (FR-06)
// ==========================================
export async function getLabReportSummary() {
  const pcs = await getAllWorkstations();
  const schedules = await getAllSchedules();
  const maintenance = await getAllMaintenanceLogs();
  const sessions = await getAllSessions();

  const total = pcs.length;
  const free = pcs.filter(p => p.status === 'Free').length;
  const occupied = pcs.filter(p => p.status === 'Occupied').length;
  const repair = pcs.filter(p => p.status === 'Under Repair').length;

  const utilizationRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const availabilityRate = total > 0 ? Math.round((free / total) * 100) : 0;
  const hardwareHealthRate = total > 0 ? Math.round(((total - repair) / total) * 100) : 100;

  return {
    metrics: {
      total,
      free,
      occupied,
      repair,
      utilizationRate,
      availabilityRate,
      hardwareHealthRate
    },
    counts: {
      schedules: schedules.length,
      maintenanceTickets: maintenance.length,
      sessionLogs: sessions.length
    },
    timestamp: new Date().toISOString()
  };
}
