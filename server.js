require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandlers = require('./src/sockets/socketHandlers'); 
const connectDB = require('./src/config/db'); 

// Connecting to Database
connectDB();

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initializing Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*', 
        methods: ['GET', 'POST'],
    },
});
socketHandlers(io);
// Make 'io' accessible to other parts of my app (ex:controllers)
app.set('io', io);
// Initialize Scheduled Jobs (if any)
require('./src/jobs/reminderJob');

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
