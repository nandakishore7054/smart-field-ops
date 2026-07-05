require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const Shift = require('./src/modules/attendance/shifts.model');
const AttendanceRecord = require('./src/modules/attendance/attendance.model');
const attendanceService = require('./src/modules/attendance/attendance.service');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // 1. Clean up
  await User.deleteMany({ email: { $in: ['testworker1@test.com', 'testworker2@test.com'] } });
  await Shift.deleteMany({ name: 'Test Shift Flow' });
  await AttendanceRecord.deleteMany({});

  // 2. Create Workers
  const worker1 = await User.create({ name: 'Worker One', email: 'testworker1@test.com', password: 'password', role: 'worker' });
  const worker2 = await User.create({ name: 'Worker Two', email: 'testworker2@test.com', password: 'password', role: 'worker' });
  console.log('Workers created');

  // 3. Create Shift & Assign
  const shift = await attendanceService.createShift({
    name: 'Test Shift Flow',
    startTime: '09:00',
    endTime: '17:00',
    gracePeriodMinutes: 15,
    workers: [worker1._id, worker2._id]
  });
  console.log('Shift created and assigned to workers');

  // 4. Verify Users have shiftId
  const w1 = await User.findById(worker1._id);
  const w2 = await User.findById(worker2._id);
  console.log('Worker 1 shiftId:', w1.shiftId);
  console.log('Worker 2 shiftId:', w2.shiftId);

  // 5. Simulate Check In (late)
  const OriginalDate = Date;
  global.Date = class extends OriginalDate {
    constructor(...args) {
      if (args.length === 0) {
        // Mock time to 09:16 AM
        const mockNow = new OriginalDate();
        mockNow.setHours(9, 16, 0, 0);
        super(mockNow.getTime());
      } else {
        super(...args);
      }
    }
  };

  try {
    const record = await attendanceService.checkIn(worker1._id, { method: 'manual' });
    console.log('Checked in! Status:', record.status);
    console.log('Saved shiftId in record:', record.shiftId);
  } catch(e) {
    console.log('Check-in error:', e.message);
  }

  // Restore Date
  global.Date = OriginalDate;

  // 6. Test getAllAttendance
  const logs = await attendanceService.getAllAttendance({});
  console.log('Admin Logs shift populated:', logs[0].shiftId?.name);
  console.log('Admin Logs worker populated:', logs[0].workerId?.name);

  await mongoose.disconnect();
}

runTest().catch(console.error);
