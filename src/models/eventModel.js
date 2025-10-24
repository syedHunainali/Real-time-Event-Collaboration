const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'An event must have a title.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startAt: {
        type: Date,
        required: [true, 'An event must have a start date and time.'],
    },
    endAt: {
        type: Date,
        required: [true, 'An event must have an end date and time.'],
    },
    capacity: {
        type: Number,
        required: [true, 'Please specify the event capacity.']
    },
    price: {
        type: Number,
        default: 0
    },
    organizerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'An event must have an organizer.']
    },
    attendees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    attendeesCount: {
        type: Number,
        default: 0
    },
    coverImageUrl: {
        type: String,
        required: true
    },
    remindersSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);

