const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A payment must belong to a user.']
    },
    eventId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: [true, 'A payment must be for an event.']
    },
    stripeSessionId: {
        type: String,
        required: [true, 'A payment must have a Stripe session ID.'],
        unique: true
    },
    amount: {
        type: Number,
        required: [true, 'A payment must have an amount.']
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

