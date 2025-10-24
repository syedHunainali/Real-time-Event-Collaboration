const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect, authMiddleware.restrictTo('event-admin','event-organizer', 'super-admin'));

router.get('/users', adminController.getUsers);
router.get('/events', adminController.getEvents);
router.get('/payments', adminController.getPayments);
router.get('/stats', adminController.getStats);

module.exports = router;

