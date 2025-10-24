const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: [true, 'A message must belong to an event.']
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A message must have a sender.']
    },
    text: {
        type: String,
        required: [true, 'A message cannot be empty.'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Populate user details when finding messages
messageSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'name'
    });
    next();
});


const Message = mongoose.model('Message', messageSchema);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
