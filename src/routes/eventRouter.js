const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');


const router = express.Router();
router.get('/organizers', eventController.getAllOrganizers);

router.route('/')
    .get(eventController.getAllEvents)
    .post(
        authMiddleware.protect,
        authMiddleware.restrictTo('event-organizer', 'event-admin', ''),
        upload.single('coverImage'),
        eventController.createEvent
    );
router.route('/my-events')
    .get(authMiddleware.protect, eventController.getmycreatedevents);

router.route('/:id')
    .get(eventController.getEvent)
    .patch(authMiddleware.protect, authMiddleware.restrictTo('event-organizer', 'event-admin'), eventController.updateEvent)
    .delete(authMiddleware.protect, authMiddleware.restrictTo('event-organizer', 'event-admin'), eventController.deleteEvent);

router.post('/:id/join', authMiddleware.protect, eventController.joinEvent);
router.post('/:id/purchase', authMiddleware.protect, eventController.purchaseEvent);

module.exports = router; 

