/**
 * Computer Lab Management System (CLMS) - Modern JavaScript Implementation
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

  // Workstation Inventory
  workstations: Array.from({ length: 30 }, (_, i) => {
    const id = `PC-${String(i + 1).padStart(2, '0')}`;
    let status = 'Free';
    let user = '-';
    if (i === 2 || i === 8 || i === 14) {
      status = 'Under Repair';
    } else if (i % 3 === 0) {
      status = 'Occupied';
      user = `Student_${100 + i}`;
    }
    return {
      id,
      specs: 'Intel i5, 16GB RAM, 512GB SSD',
      status,
      user,
      sessionStart: status === 'Occupied' ? '09:15 AM' : '-'
    };
  }),

  // Timetable & Bookings
  schedules: [
    { id: 'SLOT-101', date: '2026-09-02', time: '09:00 AM - 11:00 AM', purpose: 'CS101 Lab Session', bookedBy: 'Prof. Alan Turing', status: 'Confirmed' },
    { id: 'SLOT-102', date: '2026-09-02', time: '11:00 AM - 01:00 PM', purpose: 'Database Systems', bookedBy: 'Dr. Grace Hopper', status: 'Confirmed' }
  ],

  // Maintenance & Fault Logs
  maintenanceLogs: [
    { id: 'M-01', pcId: 'PC-03', component: 'Monitor', desc: 'Display flickers continuously', date: '2026-08-28', status: 'Under Repair' },
    { id: 'M-02', pcId: 'PC-09', component: 'Mouse', desc: 'Right click non-functional', date: '2026-08-30', status: 'Pending' }
  ],

  // Session Logs
  sessions: [
    { id: 'SES-501', student: 'Student_103', system: 'PC-04', checkIn: '09:00 AM', checkOut: '10:30 AM', duration: '1h 30m' },
    { id: 'SES-502', student: 'Student_106', system: 'PC-07', checkIn: '09:15 AM', checkOut: 'Active', duration: '-' }
  ]
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initRoleSwitcher();
  initModals();
  initAuthTabSystem();
  initForms();
  initFilters();
  initSessionToggle();
  initThemeToggle();
  renderAll();
});

// --- Theme Management ---
function initThemeToggle() {
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
  userAvatar.innerText = state.currentUserProfile.avatar;
  userName.innerText = state.currentUserProfile.name;
  userRoleBadge.innerText = state.currentUserProfile.role;

  if (state.currentUserRole === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    
    const activeSection = document.querySelector('.view-section.active');
    if (activeSection && activeSection.id === 'reports-section') {
      document.querySelector('[data-target="dashboard-section"]').click();
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

  document.getElementById('dash-total-pcs').innerText = total;
  document.getElementById('dash-free-pcs').innerText = free;
  document.getElementById('dash-occupied-pcs').innerText = occupied;
  document.getElementById('dash-faulty-pcs').innerText = fault;
}

function renderDashboardGrid() {
  pcGridContainer.innerHTML = '';
  state.workstations.forEach(pc => {
    const statusClass = pc.status === 'Free' ? 'status-free' : pc.status === 'Occupied' ? 'status-occupied' : 'status-repair';
    const card = document.createElement('div');
    card.className = `pc-node ${statusClass}`;
    card.innerHTML = `
      <i class="fa-solid fa-desktop pc-icon"></i>
      <div class="pc-id">${pc.id}</div>
      <div class="pc-user">${pc.user}</div>
    `;
    pcGridContainer.appendChild(card);
  });
}

function renderAllocationTable() {
  const query = pcSearchInput.value.toLowerCase();
  const filter = pcStatusFilter.value;

  const filtered = state.workstations.filter(pc => {
    const matchesSearch = pc.id.toLowerCase().includes(query) || pc.user.toLowerCase().includes(query);
    const matchesStatus = filter === 'all' || pc.status === filter;
    return matchesSearch && matchesStatus;
  });

  allocationTableBody.innerHTML = filtered.map(pc => {
    const badgeClass = pc.status === 'Free' ? 'badge-free' : pc.status === 'Occupied' ? 'badge-occupied' : 'badge-repair';
    let actionBtn = '-';
    
    if (state.currentUserRole === 'admin') {
      if (pc.status === 'Free') {
        actionBtn = `<button class="btn btn-outline" onclick="assignPC('${pc.id}')">Assign</button>`;
      } else if (pc.status === 'Occupied') {
        actionBtn = `<button class="btn btn-outline" onclick="releasePC('${pc.id}')">Release</button>`;
      }
    }

    return `
      <tr>
        <td><strong>${pc.id}</strong></td>
        <td>${pc.specs}</td>
        <td><span class="badge ${badgeClass}">${pc.status}</span></td>
        <td>${pc.user}</td>
        <td>${pc.sessionStart}</td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function renderScheduleTable() {
  scheduleTableBody.innerHTML = state.schedules.map(slot => `
    <tr>
      <td><strong>${slot.id}</strong></td>
      <td>${slot.date}</td>
      <td>${slot.time}</td>
      <td>${slot.purpose}</td>
      <td>${slot.bookedBy}</td>
      <td><span class="badge badge-info">${slot.status}</span></td>
    </tr>
  `).join('');
}

function renderMaintenanceTable() {
  maintenanceTableBody.innerHTML = state.maintenanceLogs.map(log => `
    <tr>
      <td><strong>${log.id}</strong></td>
      <td>${log.pcId}</td>
      <td>${log.component}</td>
      <td>${log.desc}</td>
      <td>${log.date}</td>
      <td><span class="badge ${log.status === 'Under Repair' ? 'badge-repair' : 'badge-occupied'}">${log.status}</span></td>
      ${state.currentUserRole === 'admin' ? `<td><button class="btn btn-outline" onclick="resolveFault('${log.id}')">Mark Fixed</button></td>` : ''}
    </tr>
  `).join('');
}

function renderSessionTable() {
  sessionTableBody.innerHTML = state.sessions.map(ses => `
    <tr>
      <td><strong>${ses.id}</strong></td>
      <td>${ses.student}</td>
      <td>${ses.system}</td>
      <td>${ses.checkIn}</td>
      <td>${ses.checkOut}</td>
      <td>${ses.duration}</td>
    </tr>
  `).join('');
}

function populateFaultSelectOptions() {
  faultSystemSelect.innerHTML = state.workstations.map(pc => `<option value="${pc.id}">${pc.id} (${pc.status})</option>`).join('');
}

// --- Action Handlers ---
window.assignPC = function(pcId) {
  const user = prompt(`Enter student/user name for ${pcId}:`, 'Student_User');
  if (user) {
    const pc = state.workstations.find(w => w.id === pcId);
    if (pc) {
      pc.status = 'Occupied';
      pc.user = user;
      pc.sessionStart = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      renderAll();
    }
  }
};

window.releasePC = function(pcId) {
  const pc = state.workstations.find(w => w.id === pcId);
  if (pc) {
    pc.status = 'Free';
    pc.user = '-';
    pc.sessionStart = '-';
    renderAll();
  }
};

window.resolveFault = function(logId) {
  const logIndex = state.maintenanceLogs.findIndex(l => l.id === logId);
  if (logIndex !== -1) {
    const log = state.maintenanceLogs[logIndex];
    const pc = state.workstations.find(w => w.id === log.pcId);
    if (pc) { pc.status = 'Free'; }
    
    state.maintenanceLogs.splice(logIndex, 1);
    renderAll();
  }
};

// --- Check-In / Check-Out Toggle ---
function initSessionToggle() {
  sessionToggleBtn.addEventListener('click', () => {
    state.activeSession = !state.activeSession;
    if (state.activeSession) {
      sessionToggleBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Check-Out Session`;
      sessionToggleBtn.classList.replace('btn-outline', 'btn-warning');

      const freePC = state.workstations.find(w => w.status === 'Free');
      if (freePC) {
        freePC.status = 'Occupied';
        freePC.user = state.currentUserProfile.name;
        freePC.sessionStart = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        state.sessions.unshift({
          id: `SES-${Math.floor(500 + Math.random() * 100)}`,
          student: state.currentUserProfile.name,
          system: freePC.id,
          checkIn: freePC.sessionStart,
          checkOut: 'Active',
          duration: '-'
        });
      }
    } else {
      sessionToggleBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Check-In Session`;
      sessionToggleBtn.classList.replace('btn-warning', 'btn-outline');

      const userSession = state.workstations.find(w => w.user === state.currentUserProfile.name);
      if (userSession) {
        userSession.status = 'Free';
        userSession.user = '-';
        userSession.sessionStart = '-';
      }

      const activeSes = state.sessions.find(s => s.student === state.currentUserProfile.name && s.checkOut === 'Active');
      if (activeSes) {
        activeSes.checkOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        activeSes.duration = 'Completed';
      }
    }
    renderAll();
  });
}

// --- Filters & Printing ---
function initFilters() {
  pcSearchInput.addEventListener('input', renderAllocationTable);
  pcStatusFilter.addEventListener('change', renderAllocationTable);
  
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// --- Auth Modal & Dynamic Profile Switcher ---
function initAuthTabSystem() {
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
  openBookingBtn.addEventListener('click', () => bookingModal.classList.add('active'));
  openFaultBtn.addEventListener('click', () => faultModal.classList.add('active'));
  openAuthBtn.addEventListener('click', () => authModal.classList.add('active'));

  closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
      faultModal.classList.remove('active');
      authModal.classList.remove('active');
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
  // Login Form Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const nameFromEmail = email.split('@')[0].replace('.', ' ');
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    state.currentUserProfile.name = formattedName;
    state.currentUserProfile.email = email;
    state.currentUserProfile.avatar = formattedName.substring(0, 2).toUpperCase();
    
    updateUserProfileDisplay();
    authModal.classList.remove('active');
    loginForm.reset();
    renderAll();
  });

  // Signup Form Submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const role = document.getElementById('signup-role').value;

    state.currentUserRole = role;
    roleSelect.value = role;
    
    state.currentUserProfile.name = name;
    state.currentUserProfile.email = email;
    state.currentUserProfile.role = role === 'admin' ? 'Administrator' : 'Student User';
    state.currentUserProfile.avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    updateUserProfileDisplay();
    authModal.classList.remove('active');
    signupForm.reset();
    renderAll();
  });

  // Booking Form Submission
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const purpose = document.getElementById('book-purpose').value;

    state.schedules.push({
      id: `SLOT-${100 + state.schedules.length + 1}`,
      date,
      time,
      purpose,
      bookedBy: state.currentUserProfile.name,
      status: 'Confirmed'
    });

    bookingForm.reset();
    bookingModal.classList.remove('active');
    renderAll();
  });

  // Fault Ticket Form Submission
  faultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pcId = faultSystemSelect.value;
    const component = document.getElementById('fault-component').value;
    const desc = document.getElementById('fault-desc').value;

    state.maintenanceLogs.push({
      id: `M-0${state.maintenanceLogs.length + 1}`,
      pcId,
      component,
      desc,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Repair'
    });

    const pc = state.workstations.find(w => w.id === pcId);
    if (pc) {
      pc.status = 'Under Repair';
    }

    faultForm.reset();
    faultModal.classList.remove('active');
    renderAll();
  });
}