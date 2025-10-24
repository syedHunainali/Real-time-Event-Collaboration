const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// This route is for creating the checkout session
router.post(
    '/checkout-session/:id',
    authMiddleware.protect,
    paymentController.createCheckoutSession
);
// This route is for handling Stripe webhooks
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.stripeWebhook
);

module.exports = router;
