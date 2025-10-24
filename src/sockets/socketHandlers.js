const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Message = require('../models/messageModel'); 
const User = require('../models/userModel'); 

const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided.'));
    }
    try {
        // Verify the token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
        // Find the user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new Error('Authentication error: User not found.'));
        }
        
        // Attach user to the socket object
        socket.user = currentUser;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token.'));
    }
};

const socketHandlers = (io) => {
    // Middleware to authenticate socket connections
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id} with user ID: ${socket.user.id}`);

        // Personal room for notifications (if needed later)
        socket.join(`user_${socket.user.id}`);

        // Handle user joining an event room
        socket.on('joinRoom', async (eventId) => {
            const room = `event:${eventId}`;
            socket.join(room);

            // --- Load and send chat history ---
            try {
                const messages = await Message.find({ eventId })
                    .populate('userId', 'name') // Populate sender's name
                    .sort({ createdAt: 'asc' }); // Get messages in chronological order
                
                // Send history only to the user who just joined
                socket.emit('chatHistory', messages);
            } catch (err) {
                console.error('Error fetching chat history:', err);
                socket.emit('error', { message: 'Could not load chat history.' });
            }
            // --- End of chat history ---

            // Announce new user to everyone else in the room
            io.to(room).emit('announcement', `${socket.user.name} has joined the chat.`);
        });

        // Handle user leaving an event room
        socket.on('leaveRoom', (eventId) => {
            const room = `event:${eventId}`;
            socket.leave(room);
            io.to(room).emit('announcement', `${socket.user.name} has left the chat.`);
        });

        // Handle incoming chat messages
        socket.on('chatMessage', async ({ eventId, text }) => {
            const room = `event:${eventId}`;
            
            // TODO: You might want to add a check here to ensure the event is actually live
            
            const messageData = { 
                eventId, 
                userId: socket.user.id, 
                text 
            };

            let message;
            try {
                // Save the message to the database
                message = await Message.create(messageData);
                // Manually populate user since .create doesn't trigger 'find' middleware
                message = await message.populate('userId', 'name');
            } catch(err) {
                console.error('Error saving message:', err);
                socket.emit('error', { message: 'Could not send message.' });
                return;
            }

            // Broadcast the new message to everyone in the room
            io.to(room).emit('newMessage', message);
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            // You could add logic here to emit 'leave' announcements
            // to rooms the user was in, if needed.
        });
    });
};

module.exports = socketHandlers;
