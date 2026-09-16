/**
 * Computer Lab Management System (CLMS) - Supabase PostgreSQL Client
 * Connected to full-stack Express & Supabase PostgreSQL database backend
 */

// Global App State
const state = {
  currentUserRole: 'admin', // 'admin' or 'student'
  activeSession: false,
  currentUserProfile: {
    name: 'Prof. Alan Turing',
    email: 'turing@university.edu',
    role: 'Administrator',
    avatar: 'AD'
  },
  workstations: [],
  schedules: [],
  maintenanceLogs: [],
  sessions: [],
  dbStatus: {
    provider: 'supabase',
    connected: false,
    message: 'Connecting to database...'
  }
};

// --- DOM References ---
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');
const roleSelect = document.getElementById('role-select');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userRoleBadge = document.getElementById('user-role-badge');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const sessionToggleBtn = document.getElementById('session-toggle-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const dbStatusText = document.getElementById('db-status-text');
const dbPulseDot = document.getElementById('db-pulse-dot');
const toastContainer = document.getElementById('toast-container');

// Modals
const bookingModal = document.getElementById('booking-modal');
const faultModal = document.getElementById('fault-modal');
const authModal = document.getElementById('auth-modal');
const openBookingBtn = document.getElementById('open-booking-modal-btn');
const openFaultBtn = document.getElementById('open-fault-modal-btn');
const openAuthBtn = document.getElementById('open-auth-modal-btn');
const closeModals = document.querySelectorAll('.close-modal');

// Forms & Inputs
const bookingForm = document.getElementById('booking-form');
const faultForm = document.getElementById('fault-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const faultSystemSelect = document.getElementById('fault-system-id');

// Tabs
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabSignupBtn = document.getElementById('tab-signup-btn');

// Data Grid & Table Containers
const pcGridContainer = document.getElementById('dashboard-pc-grid');
const allocationTableBody = document.getElementById('allocation-table-body');
const scheduleTableBody = document.getElementById('schedule-table-body');
const maintenanceTableBody = document.getElementById('maintenance-table-body');
const sessionTableBody = document.getElementById('session-table-body');

// Filters
const pcSearchInput = document.getElementById('pc-search');
const pcStatusFilter = document.getElementById('pc-filter-status');
const printReportBtn = document.getElementById('print-report-btn');

// --- Toast Notifications Helper ---
function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initRoleSwitcher();
  initModals();
  initAuthTabSystem();
  initForms();
  initFilters();
  initSessionToggle();
  initThemeToggle();

  // Load database status and all records from Supabase backend
  await checkDatabaseConnection();
  await fetchAllData();
});

// --- Database Connectivity & Data Fetching ---
async function checkDatabaseConnection() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    state.dbStatus = data;

    if (dbStatusText && dbPulseDot) {
      if (data.provider === 'supabase' && data.connected) {
        dbStatusText.innerText = 'Supabase PostgreSQL: Connected';
        dbPulseDot.className = 'db-pulse-dot';
      } else if (data.supabaseConfigured && !data.connected) {
        dbStatusText.innerText = 'Supabase: Schema Pending';
        dbPulseDot.className = 'db-pulse-dot warning';
      } else {
        dbStatusText.innerText = 'Supabase PostgreSQL: Ready';
        dbPulseDot.className = 'db-pulse-dot';
      }
    }
  } catch (err) {
    console.warn('Could not check database status:', err);
    if (dbStatusText) dbStatusText.innerText = 'Database: Local Active';
  }
}

async function fetchAllData() {
  try {
    const [pcsRes, schedRes, maintRes, sessRes] = await Promise.all([
      fetch('/api/workstations'),
      fetch('/api/schedules'),
      fetch('/api/maintenance'),
      fetch('/api/sessions')
    ]);

    if (pcsRes.ok) state.workstations = await pcsRes.json();
    if (schedRes.ok) state.schedules = await schedRes.json();
    if (maintRes.ok) state.maintenanceLogs = await maintRes.json();
    if (sessRes.ok) state.sessions = await sessRes.json();

    // Check if the current user has an active session
    const activeUserSession = state.sessions.find(
      s => s.student === state.currentUserProfile.name && (s.checkOut === 'Active' || s.check_out === 'Active')
    );
    if (activeUserSession) {
      state.activeSession = true;
      if (sessionToggleBtn) {
        sessionToggleBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Check-Out Session`;
        sessionToggleBtn.classList.replace('btn-outline', 'btn-warning');
      }
    }

    renderAll();
  } catch (err) {
    console.error('Error fetching data from API:', err);
    showToast('Failed to load lab data from database', 'error');
  }
}

// --- Theme Management ---
function initThemeToggle() {
  if (!themeToggleBtn) return;
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    themeToggleBtn.querySelector('span').innerText = isDark ? 'Light Mode' : 'Dark Mode';
    themeToggleBtn.querySelector('i').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
}

// --- Navigation ---
function initNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetId) {
          section.classList.add('active');
        }
      });

      const titleText = item.querySelector('span').innerText;
      pageTitle.innerText = titleText;
      pageSubtitle.innerText = `Manage and view ${titleText.toLowerCase()} operational parameters`;
    });
  });
}

// --- Role Switcher & Auth Profile Rendering ---
function initRoleSwitcher() {
  if (!roleSelect) return;
  roleSelect.addEventListener('change', (e) => {
    state.currentUserRole = e.target.value;
    
    if (state.currentUserRole === 'admin') {
      state.currentUserProfile.role = 'Administrator';
    } else {
      state.currentUserProfile.role = 'Student User';
    }
    
    updateUserProfileDisplay();
    renderAll();
  });
}

function updateUserProfileDisplay() {
  if (userAvatar) userAvatar.innerText = state.currentUserProfile.avatar;
  if (userName) userName.innerText = state.currentUserProfile.name;
  if (userRoleBadge) userRoleBadge.innerText = state.currentUserProfile.role;

  if (state.currentUserRole === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    
    const activeSection = document.querySelector('.view-section.active');
    if (activeSection && activeSection.id === 'reports-section') {
      const dashNav = document.querySelector('[data-target="dashboard-section"]');
      if (dashNav) dashNav.click();
    }
  }
}

// --- Data Render Functions ---
function renderAll() {
  renderMetrics();
  renderDashboardGrid();
  renderAllocationTable();
  renderScheduleTable();
  renderMaintenanceTable();
  renderSessionTable();
  populateFaultSelectOptions();
}

function renderMetrics() {
  const total = state.workstations.length;
  const free = state.workstations.filter(w => w.status === 'Free').length;
  const occupied = state.workstations.filter(w => w.status === 'Occupied').length;
  const fault = state.workstations.filter(w => w.status === 'Under Repair').length;

  const totalEl = document.getElementById('dash-total-pcs');
  const freeEl = document.getElementById('dash-free-pcs');
  const occEl = document.getElementById('dash-occupied-pcs');
  const faultEl = document.getElementById('dash-faulty-pcs');

  if (totalEl) totalEl.innerText = total;
  if (freeEl) freeEl.innerText = free;
  if (occEl) occEl.innerText = occupied;
  if (faultEl) faultEl.innerText = fault;
}

function renderDashboardGrid() {
  if (!pcGridContainer) return;
  pcGridContainer.innerHTML = '';
  state.workstations.forEach(pc => {
    const statusClass = pc.status === 'Free' ? 'status-free' : pc.status === 'Occupied' ? 'status-occupied' : 'status-repair';
    const card = document.createElement('div');
    card.className = `pc-node ${statusClass}`;
    card.id = `pc-node-${pc.id.toLowerCase()}`;
    card.innerHTML = `
      <i class="fa-solid fa-desktop pc-icon"></i>
      <div class="pc-id">${pc.id}</div>
      <div class="pc-user">${pc.user || '-'}</div>
    `;
    pcGridContainer.appendChild(card);
  });
}

function renderAllocationTable() {
  if (!allocationTableBody) return;
  const query = pcSearchInput ? pcSearchInput.value.toLowerCase() : '';
  const filter = pcStatusFilter ? pcStatusFilter.value : 'all';

  const filtered = state.workstations.filter(pc => {
    const userStr = pc.user ? pc.user.toLowerCase() : '';
    const idStr = pc.id.toLowerCase();
    const matchesSearch = idStr.includes(query) || userStr.includes(query);
    const matchesStatus = filter === 'all' || pc.status === filter;
    return matchesSearch && matchesStatus;
  });

  allocationTableBody.innerHTML = filtered.map(pc => {
    const badgeClass = pc.status === 'Free' ? 'badge-free' : pc.status === 'Occupied' ? 'badge-occupied' : 'badge-repair';
    let actionBtn = '-';
    
    if (state.currentUserRole === 'admin') {
      if (pc.status === 'Free') {
        actionBtn = `<button class="btn btn-outline" id="btn-assign-${pc.id}" onclick="assignPC('${pc.id}')">Assign</button>`;
      } else if (pc.status === 'Occupied') {
        actionBtn = `<button class="btn btn-outline" id="btn-release-${pc.id}" onclick="releasePC('${pc.id}')">Release</button>`;
      }
    }

    return `
      <tr>
        <td><strong>${pc.id}</strong></td>
        <td>${pc.specs}</td>
        <td><span class="badge ${badgeClass}">${pc.status}</span></td>
        <td>${pc.user || '-'}</td>
        <td>${pc.sessionStart || pc.session_start || '-'}</td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function renderScheduleTable() {
  if (!scheduleTableBody) return;
  scheduleTableBody.innerHTML = state.schedules.map(slot => `
    <tr>
      <td><strong>${slot.id}</strong></td>
      <td>${slot.date}</td>
      <td>${slot.time}</td>
      <td>${slot.purpose}</td>
      <td>${slot.bookedBy || slot.booked_by}</td>
      <td><span class="badge badge-info">${slot.status}</span></td>
    </tr>
  `).join('');
}

function renderMaintenanceTable() {
  if (!maintenanceTableBody) return;
  maintenanceTableBody.innerHTML = state.maintenanceLogs.map(log => `
    <tr>
      <td><strong>${log.id}</strong></td>
      <td>${log.pcId || log.pc_id}</td>
      <td>${log.component}</td>
      <td>${log.desc || log.description}</td>
      <td>${log.date}</td>
      <td><span class="badge ${log.status === 'Under Repair' ? 'badge-repair' : 'badge-occupied'}">${log.status}</span></td>
      ${state.currentUserRole === 'admin' ? `<td><button class="btn btn-outline" id="btn-resolve-${log.id}" onclick="resolveFault('${log.id}')">Mark Fixed</button></td>` : ''}
    </tr>
  `).join('');
}

function renderSessionTable() {
  if (!sessionTableBody) return;
  sessionTableBody.innerHTML = state.sessions.map(ses => `
    <tr>
      <td><strong>${ses.id}</strong></td>
      <td>${ses.student}</td>
      <td>${ses.system}</td>
      <td>${ses.checkIn || ses.check_in}</td>
      <td>${ses.checkOut || ses.check_out}</td>
      <td>${ses.duration}</td>
    </tr>
  `).join('');
}

function populateFaultSelectOptions() {
  if (!faultSystemSelect) return;
  faultSystemSelect.innerHTML = state.workstations.map(pc => `<option value="${pc.id}">${pc.id} (${pc.status})</option>`).join('');
}

// --- Supabase-Backed Database Actions ---

// 1. Assign Workstation to User
window.assignPC = async function(pcId) {
  const user = prompt(`Enter student/user name for ${pcId}:`, 'Student_User');
  if (user && user.trim()) {
    try {
      const res = await fetch(`/api/workstations/${pcId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.trim() })
      });
      if (res.ok) {
        showToast(`Workstation ${pcId} assigned to ${user.trim()}`, 'success');
        await fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to assign workstation', 'error');
      }
    } catch (err) {
      showToast('Network error assigning workstation', 'error');
    }
  }
};

// 2. Release Workstation
window.releasePC = async function(pcId) {
  try {
    const res = await fetch(`/api/workstations/${pcId}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      showToast(`Workstation ${pcId} released to Free status`, 'success');
      await fetchAllData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to release workstation', 'error');
    }
  } catch (err) {
    showToast('Network error releasing workstation', 'error');
  }
};

// 3. Resolve Hardware Fault Ticket
window.resolveFault = async function(logId) {
  try {
    const res = await fetch(`/api/maintenance/${logId}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      showToast(`Maintenance Ticket ${logId} marked as fixed & resolved`, 'success');
      await fetchAllData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to resolve maintenance log', 'error');
    }
  } catch (err) {
    showToast('Network error resolving fault ticket', 'error');
  }
};

// --- Check-In / Check-Out Toggle (Attendance FR-05) ---
function initSessionToggle() {
  if (!sessionToggleBtn) return;
  sessionToggleBtn.addEventListener('click', async () => {
    if (!state.activeSession) {
      // Check-In
      try {
        const res = await fetch('/api/sessions/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName: state.currentUserProfile.name })
        });
        if (res.ok) {
          const result = await res.json();
          state.activeSession = true;
          sessionToggleBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Check-Out Session`;
          sessionToggleBtn.classList.replace('btn-outline', 'btn-warning');
          showToast(`Checked in! Assigned to ${result.workstation}`, 'success');
          await fetchAllData();
        } else {
          const err = await res.json();
          showToast(err.error || 'Failed to check-in to lab session', 'error');
        }
      } catch (err) {
        showToast('Network error during session check-in', 'error');
      }
    } else {
      // Check-Out
      try {
        const res = await fetch('/api/sessions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName: state.currentUserProfile.name })
        });
        if (res.ok) {
          state.activeSession = false;
          sessionToggleBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Check-In Session`;
          sessionToggleBtn.classList.replace('btn-warning', 'btn-outline');
          showToast('Checked out! Lab workstation released.', 'info');
          await fetchAllData();
        } else {
          const err = await res.json();
          showToast(err.error || 'Failed to check-out session', 'error');
        }
      } catch (err) {
        showToast('Network error during session check-out', 'error');
      }
    }
  });
}

// --- Filters & Printing ---
function initFilters() {
  if (pcSearchInput) pcSearchInput.addEventListener('input', renderAllocationTable);
  if (pcStatusFilter) pcStatusFilter.addEventListener('change', renderAllocationTable);
  
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// --- Auth Modal & Dynamic Profile Switcher ---
function initAuthTabSystem() {
  if (!tabLoginBtn || !tabSignupBtn) return;
  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabSignupBtn.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  });

  tabSignupBtn.addEventListener('click', () => {
    tabSignupBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  });
}

// --- Modal Handlers ---
function initModals() {
  if (openBookingBtn && bookingModal) {
    openBookingBtn.addEventListener('click', () => bookingModal.classList.add('active'));
  }
  if (openFaultBtn && faultModal) {
    openFaultBtn.addEventListener('click', () => faultModal.classList.add('active'));
  }
  if (openAuthBtn && authModal) {
    openAuthBtn.addEventListener('click', () => authModal.classList.add('active'));
  }

  closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
      if (bookingModal) bookingModal.classList.remove('active');
      if (faultModal) faultModal.classList.remove('active');
      if (authModal) authModal.classList.remove('active');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === bookingModal) bookingModal.classList.remove('active');
    if (e.target === faultModal) faultModal.classList.remove('active');
    if (e.target === authModal) authModal.classList.remove('active');
  });
}

// --- Form Handlers ---
function initForms() {
  // 1. User Login (FR-01)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const user = await res.json();
          state.currentUserProfile.name = user.name;
          state.currentUserProfile.email = user.email;
          state.currentUserProfile.role = user.roleTitle || (user.role === 'admin' ? 'Administrator' : 'Student User');
          state.currentUserProfile.avatar = user.avatar;
          state.currentUserRole = user.role;
          if (roleSelect) roleSelect.value = user.role;

          updateUserProfileDisplay();
          authModal.classList.remove('active');
          loginForm.reset();
          showToast(`Welcome back, ${user.name}!`, 'success');
          renderAll();
        } else {
          showToast('Invalid credentials provided', 'error');
        }
      } catch (err) {
        showToast('Login network error', 'error');
      }
    });
  }

  // 2. User Registration (FR-01)
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const role = document.getElementById('signup-role').value;
      const password = document.getElementById('signup-password').value;

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role, password })
        });
        if (res.ok) {
          const user = await res.json();
          state.currentUserRole = user.role;
          if (roleSelect) roleSelect.value = user.role;
          
          state.currentUserProfile.name = user.name;
          state.currentUserProfile.email = user.email;
          state.currentUserProfile.role = user.roleTitle;
          state.currentUserProfile.avatar = user.avatar;

          updateUserProfileDisplay();
          authModal.classList.remove('active');
          signupForm.reset();
          showToast(`Account registered in Supabase: ${user.name}`, 'success');
          renderAll();
        } else {
          showToast('Failed to create account', 'error');
        }
      } catch (err) {
        showToast('Signup network error', 'error');
      }
    });
  }

  // 3. Timetable Reservation (FR-04)
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const purpose = document.getElementById('book-purpose').value;

      try {
        const res = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            time,
            purpose,
            bookedBy: state.currentUserProfile.name
          })
        });

        if (res.ok) {
          bookingForm.reset();
          bookingModal.classList.remove('active');
          showToast('Lab slot reservation saved to database', 'success');
          await fetchAllData();
        } else {
          showToast('Failed to reserve lab slot', 'error');
        }
      } catch (err) {
        showToast('Network error during reservation', 'error');
      }
    });
  }

  // 4. Fault Ticket Logging (FR-03)
  if (faultForm) {
    faultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pcId = faultSystemSelect.value;
      const component = document.getElementById('fault-component').value;
      const desc = document.getElementById('fault-desc').value;

      try {
        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pcId,
            component,
            desc,
            date: new Date().toISOString().split('T')[0]
          })
        });

        if (res.ok) {
          faultForm.reset();
          faultModal.classList.remove('active');
          showToast(`Maintenance fault logged for ${pcId} (marked Under Repair)`, 'warning');
          await fetchAllData();
        } else {
          showToast('Failed to log maintenance ticket', 'error');
        }
      } catch (err) {
        showToast('Network error logging fault', 'error');
      }
    });
  }
}
