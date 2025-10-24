const paymentService = require('../services/paymentServices');
const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncErrorHandler');

exports.stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = paymentService.getWebhookEvent(req.body, sig);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const result = await paymentService.handleSuccessfulPayment(session);

        if (result) {
            const io = req.app.get('io');
            await notificationService.sendPaymentSuccessNotification(io, result);
        }
    }

    res.status(200).json({ received: true });
});

