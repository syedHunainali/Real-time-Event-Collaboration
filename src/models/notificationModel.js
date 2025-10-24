const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A notification must belong to a user.']
    },
    type: {
        type: String,
        enum: ['event-reminder', 'payment-success', 'welcome'],
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        eventId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Event'
        }
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

