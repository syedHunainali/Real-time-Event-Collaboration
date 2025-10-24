const Message = require('../models/messageModel');
const User = require('../models/userModel'); // Assuming path to userModel
const AppError = require('../utils/appError'); // Assuming path to appError

exports.sendMessageFromPostman = async (req, res, next) => {
    try {
        // 1. Get the io instance from the app object
        const io = req.app.get('io');
        
        // 2. Get data from Postman's request body
        const { eventId, userId, text } = req.body;

        if (!eventId || !userId || !text) {
            return next(new AppError('Please provide eventId, userId, and text', 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        let message = await Message.create({
            eventId,
            userId,
            text
        });

        message = await message.populate('userId', 'name');

        const room = `event:${eventId}`;
        io.to(room).emit('newMessage', message);

        // 5. Send a success response back to Postman
        res.status(201).json({
            status: 'success',
            message: 'Message sent via socket',
            data: {
                message
            }
        });

    } catch (err) {
        console.error('Error in sendMessageFromPostman:', err);
        return next(new AppError('Failed to send message', 500));
    }
};