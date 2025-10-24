const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Email = require('../utils/email');

exports.createNotification = async (io, { userId, type, message, data }) => {
    const notification = await Notification.create({ userId, type, message, data });
    if (io) {
        io.to(`user_${userId}`).emit('newNotification', notification);
    }
    return notification;
};

exports.sendWelcomeNotification = async (user) => {
    await new Email(user).sendWelcome();
};

exports.sendPaymentSuccessNotification = async (io, { event, user }) => {
    const message = `Payment for "${event.title}" was successful!`;
    await this.createNotification(io, {
        userId: user.id,
        type: 'payment-success',
        message,
        data: { eventId: event.id }
    });
    const userDoc = await User.findById(user.id);
    if (userDoc) {
        await new Email(userDoc, event.title).sendPaymentSuccess();
    }
};

exports.sendEventReminderNotifications = async (io) => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = await Event.find({
        startAt: { $gte: now, $lte: in24Hours },
        remindersSent: { $ne: true }
    }).populate('attendees', 'id email name');

    for (const event of upcomingEvents) {
        const message = `Reminder: "${event.title}" is starting tomorrow!`;
        for (const attendee of event.attendees) {
            await this.createNotification(io, {
                userId: attendee.id,
                type: 'event-reminder',
                message,
                data: { eventId: event.id }
            });
            await new Email(attendee, event.title).sendEventReminder();
        }
        await Event.findByIdAndUpdate(event.id, { remindersSent: true });
        console.log(`Sent reminders for: ${event.title}`);
    }
};

