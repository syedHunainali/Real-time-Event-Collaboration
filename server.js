require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Correct path to app.js
const socketHandlers = require('./src/sockets/socketHandlers'); // Correct path
const connectDB = require('./src/config/db'); // Correct path

// --- Connect to Database ---
connectDB();

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// --- Initialize Socket.IO ---
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*', // Allow requests from your client URL
        methods: ['GET', 'POST'],
    },
});
socketHandlers(io);
// Make 'io' accessible to other parts of your app (e.g., controllers)
app.set('io', io);
// --- Initialize Scheduled Jobs (if any) ---
require('./src/jobs/reminderJob');

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
