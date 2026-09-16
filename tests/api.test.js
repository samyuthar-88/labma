import assert from 'node:assert';
import * as db from '../db/supabase.js';

async function runTests() {
  console.log('--- STARTING SUPABASE DATABASE MIGRATION INTEGRATION TESTS ---');

  // 1. Database Status
  console.log('\n[Test 1] Testing Database Connection & Status...');
  const status = await db.getDatabaseStatus();
  assert.ok(status, 'Database status object should exist');
  assert.ok(status.provider, 'Status should indicate database provider');
  console.log('✓ Database Status:', status.provider, status.connected ? '(Connected)' : '(Local Mode)');

  // 2. Workstations Listing (FR-02)
  console.log('\n[Test 2] Testing Workstation Listing (FR-02)...');
  const pcs = await db.getAllWorkstations();
  assert.strictEqual(Array.isArray(pcs), true, 'Workstations should be an array');
  assert.strictEqual(pcs.length, 30, 'Should return 30 workstations by default');
  const pc01 = pcs.find(p => p.id === 'PC-01');
  assert.ok(pc01, 'PC-01 must exist');
  assert.ok(pc01.status, 'PC-01 should have a status');
  console.log('✓ Workstations verified: 30 PCs listed');

  // 3. Workstation Assignment & Release (FR-02)
  console.log('\n[Test 3] Testing Workstation Assignment & Release...');
  // Find a free PC
  const freePc = pcs.find(p => p.status === 'Free');
  assert.ok(freePc, 'A free workstation must exist');
  const assigned = await db.assignWorkstation(freePc.id, 'TestStudent_999');
  assert.strictEqual(assigned.status, 'Occupied');
  assert.strictEqual(assigned.user, 'TestStudent_999');
  console.log(`✓ Workstation ${freePc.id} successfully assigned to TestStudent_999`);

  const released = await db.releaseWorkstation(freePc.id);
  assert.strictEqual(released.status, 'Free');
  assert.strictEqual(released.user, '-');
  console.log(`✓ Workstation ${freePc.id} successfully released back to Free`);

  // 4. Timetable & Schedule Reservation (FR-04)
  console.log('\n[Test 4] Testing Schedule Slots Reservation (FR-04)...');
  const initialSchedules = await db.getAllSchedules();
  const initialCount = initialSchedules.length;
  const newBooking = await db.createSchedule({
    id: 'SLOT-999',
    date: '2026-09-18',
    time: '02:00 PM - 04:00 PM',
    purpose: 'Distributed Systems Lab',
    bookedBy: 'Prof. Test Evaluator'
  });
  assert.strictEqual(newBooking.id, 'SLOT-999');
  assert.strictEqual(newBooking.purpose, 'Distributed Systems Lab');
  
  const updatedSchedules = await db.getAllSchedules();
  assert.strictEqual(updatedSchedules.length, initialCount + 1);
  console.log('✓ Lab slot reservation created & verified');

  // Cleanup test schedule
  await db.deleteSchedule('SLOT-999');
  console.log('✓ Cleaned up test reservation');

  // 5. Maintenance Ticket & Hardware Fault Logging (FR-03)
  console.log('\n[Test 5] Testing Maintenance Fault Ticket Reporting (FR-03)...');
  const testPc = pcs.find(p => p.status === 'Free') || pcs[0];
  const ticket = await db.createMaintenanceLog({
    id: 'M-TEST-01',
    pcId: testPc.id,
    component: 'GPU',
    desc: 'Fan stopped spinning',
    date: '2026-09-16'
  });
  assert.strictEqual(ticket.component, 'GPU');

  // Verify that workstation status was updated to Under Repair
  const pcUnderRepair = await db.getWorkstationById(testPc.id);
  assert.strictEqual(pcUnderRepair.status, 'Under Repair');
  console.log(`✓ Workstation ${testPc.id} set to Under Repair after ticket creation`);

  // Resolve the maintenance ticket
  const resolveResult = await db.resolveMaintenanceLog('M-TEST-01');
  assert.strictEqual(resolveResult.success, true);
  const pcRestored = await db.getWorkstationById(testPc.id);
  assert.strictEqual(pcRestored.status, 'Free');
  console.log(`✓ Ticket resolved and Workstation ${testPc.id} restored to Free`);

  // 6. Session Attendance Tracking (FR-05)
  console.log('\n[Test 6] Testing Session Attendance Tracking (FR-05)...');
  const checkIn = await db.checkInStudentSession('Student_AutomatedTest');
  assert.ok(checkIn.session);
  assert.strictEqual(checkIn.session.student, 'Student_AutomatedTest');
  assert.ok(checkIn.workstation);
  console.log(`✓ Student checked in to workstation: ${checkIn.workstation}`);

  const checkOut = await db.checkOutStudentSession('Student_AutomatedTest');
  assert.ok(checkOut);
  console.log(`✓ Student checked out and workstation released`);

  // 7. User Authentication & Roles (FR-01)
  console.log('\n[Test 7] Testing User Authentication & Registration (FR-01)...');
  const adminLogin = await db.authenticateUser('turing@university.edu', 'admin123');
  assert.strictEqual(adminLogin.role, 'admin');
  console.log(`✓ Admin user authenticated: ${adminLogin.name} (${adminLogin.role})`);

  const newRegistered = await db.registerUser({
    name: 'Ada Lovelace',
    email: 'ada.test@university.edu',
    role: 'student',
    password: 'securePassword!'
  });
  assert.strictEqual(newRegistered.email, 'ada.test@university.edu');
  assert.strictEqual(newRegistered.role, 'student');
  console.log(`✓ Student user registered: ${newRegistered.name}`);

  // 8. Administrative Reports Summary (FR-06)
  console.log('\n[Test 8] Testing Lab Reports & Aggregation (FR-06)...');
  const summary = await db.getLabReportSummary();
  assert.ok(summary.metrics);
  assert.strictEqual(summary.metrics.total, 30);
  assert.ok(typeof summary.metrics.utilizationRate === 'number');
  assert.ok(typeof summary.metrics.availabilityRate === 'number');
  console.log('✓ Lab Report Summary verified: Total PCs:', summary.metrics.total, 'Utilization:', summary.metrics.utilizationRate + '%');

  console.log('\n======================================================');
  console.log('>>> ALL 8 SUPABASE DATABASE MIGRATION TESTS PASSED! <<<');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
