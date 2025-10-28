const Stripe = require('stripe');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');
const AppError = require('../utils/appError');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (eventId, user) => {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError('No event found with that ID', 404);
    if (event.price <= 0) throw new AppError('This is a free event.', 400);
    if (event.attendees.includes(user.id)) throw new AppError('You are already registered.', 400);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: { name: event.title },
                unit_amount: event.price * 100, 
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/#event/${eventId}?payment=success`,
        cancel_url: `${process.env.CLIENT_URL}/#event/${eventId}?payment=cancelled`,
        customer_email: user.email,
        metadata: { eventId: event.id, userId: user.id },
    });

    await Payment.create({
        userId: user.id,
        eventId: event.id,
        stripeSessionId: session.id,
        amount: event.price,
        status: 'pending',
    });

    return session;
};

exports.handleSuccessfulPayment = async (session) => {
    const { eventId, userId } = session.metadata;

    const payment = await Payment.findOne({ stripeSessionId: session.id });
    if (!payment || payment.status === 'succeeded') return null; // check

    const event = await Event.findOneAndUpdate({
        _id: eventId,
        $expr: { $lt: ["$attendeesCount", "$capacity"] },
        attendees: { $ne: userId }
    }, {
        $inc: { attendeesCount: 1 },
        $push: { attendees: userId }
    }, { new: true });

    if (!event) {
        payment.status = 'failed';
        await payment.save();
        throw new Error('Event is full or user already joined.');
    }

    payment.status = 'succeeded';
    await payment.save();

    return { event, user: { id: userId, email: session.customer_email } };
};

exports.getWebhookEvent = (payload, sig) => {
    try {
        return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        throw new AppError(`Webhook Error: ${err.message}`, 400);
    }
};

