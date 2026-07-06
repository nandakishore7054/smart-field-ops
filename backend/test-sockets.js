require('dotenv').config({ path: './.env' });
const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const WorkerLocation = require('./src/modules/tracking/location.model');
const http = require('http');
const { Server } = require('socket.io');

// We'll spin up a quick dummy server to test the handler
const server = http.createServer();
const ioServer = new Server(server);
const { setupTrackingSockets } = require('./src/modules/tracking/tracking.socket');
setupTrackingSockets(ioServer);
ioServer.on('connection', (socket) => {
  socket.on('join', (data) => {
    if (data?.role === 'admin') socket.join('admin');
  });
});

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  await User.deleteMany({ email: 'socketworker@test.com' });
  const worker = await User.create({ name: 'Socket Worker', email: 'socketworker@test.com', password: 'password', role: 'worker' });

  server.listen(5005, () => {
    console.log('Test server listening on 5005');
    
    const adminSocket = io('http://localhost:5005');
    const workerSocket = io('http://localhost:5005');

    let eventsReceived = 0;

    adminSocket.on('connect', () => {
      adminSocket.emit('join', { role: 'admin' });
      
      workerSocket.on('connect', () => {
        // Send first update
        workerSocket.emit('worker:location-update', {
          workerId: worker._id,
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 5
        });

        // Send second update immediately (should be throttled)
        workerSocket.emit('worker:location-update', {
          workerId: worker._id,
          latitude: 40.7130,
          longitude: -74.0065,
          accuracy: 5
        });

        setTimeout(() => {
          // Send third update after 5.5 seconds (should pass)
          workerSocket.emit('worker:location-update', {
            workerId: worker._id,
            latitude: 40.7140,
            longitude: -74.0070,
            accuracy: 5
          });
        }, 5500);
      });
    });

    adminSocket.on('location:updated', async (data) => {
      eventsReceived++;
      console.log(`Received location update ${eventsReceived}:`, data);
      
      if (eventsReceived === 2) {
        // Verify DB
        const records = await WorkerLocation.find({ workerId: worker._id });
        console.log(`DB records found: ${records.length} (expect 2)`);
        
        adminSocket.disconnect();
        workerSocket.disconnect();
        server.close();
        await mongoose.disconnect();
        console.log('Test complete!');
        process.exit(0);
      }
    });
  });
}

runTest().catch(console.error);
