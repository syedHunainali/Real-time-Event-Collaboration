const eventService = require('../services/eventServices');
const paymentService = require('../services/paymentServices');
const asyncHandler = require('../utils/asyncErrorHandler');
const AppError = require('../utils/appError');
const { createEventSchema, updateEventSchema } = require('../utils/eventValidator');

exports.createEvent = asyncHandler(async (req, res, next) => {
    const { error, value } = createEventSchema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));
    if (!req.file) return next(new AppError('Cover image is required.', 400));
    if (req.body.startAt && req.body.endAt && new Date(req.body.startAt) > new Date(req.body.endAt)) {
        return next(new AppError('Invalid event dates.', 400));
    }
    if (req.body.capacity && req.body.capacity <= 0){
        return next(new AppError('Capacity must be greater than zero.', 400));
    }
    if (req.body.startAt && new Date(req.body.startAt) < Date.now()) {
        return next(new AppError('Start date must be in the future.', 400));
    }
    const eventData = { ...value, organizerId: req.user.id, coverImageUrl: req.file.path };
    const newEvent = await eventService.createEvent(eventData);
    res.status(201).json({ status: 'success', data: { event: newEvent } });
});

exports.getEvent = asyncHandler(async (req, res, next) => {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return next(new AppError('No event found with that ID', 404));
    res.status(200).json({ status: 'success', data: { event } });
});

exports.getAllEvents = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const eventData = await eventService.getAllEvents(filters, { page, limit });
    res.status(200).json({ status: 'success', results: eventData.events.length, data: eventData });
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
    const { error } = updateEventSchema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));
    if (req.body.endAt && new Date(req.body.startAt) > new Date(req.body.endAt)) {
        return next(new AppError('Invalid event dates.', 400));
    }
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.id);
    if (!event) return next(new AppError('No event found or you are not the organizer.', 404));
    res.status(200).json({ status: 'success', data: { event } });
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
    const event = await eventService.deleteEvent(req.params.id, req.user.id);
    if (!event) return next(new AppError('No event found or you are not the organizer.', 404));
    res.status(204).send();
});

exports.joinEvent = asyncHandler(async (req, res, next) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const eventToJoin = await eventService.getEventById(eventId); 

    if (eventToJoin.endAt && new Date(eventToJoin.endAt) < new Date()) {
        return next(new AppError('This event has already ended and can no longer be joined.', 400));
    }

    const event = await eventService.joinFreeEvent(eventId, userId);

    // This check handles other failures (e.g., full, already joined)
    if (!event) {
        return next(new AppError('Could not join event. It may be full or you already joined.', 400));
    }
    
    // 5. Emit socket event and send success response
    const io = req.app.get('io');
    if (io) {
        io.to(`event:${eventId}`).emit('userJoined', { eventId: eventId }); // Use eventId from params
    }
    
    res.status(200).json({ status: 'success', message: 'Successfully joined event.', data: { event } });
});

exports.purchaseEvent = asyncHandler(async (req, res, next) => {
    const session = await paymentService.createCheckoutSession(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: { sessionUrl: session.url } });
});
exports.getAllOrganizers = asyncHandler(async (req, res) => {
    const organizers = await eventService.getAllOrganizers();
    res.status(200).json({ status: 'success', data: { organizers } });
});
exports.getmycreatedevents = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const events = await eventService.getEventsByUserId(userId);
    res.status(200).json({ status: 'success', data: { events } });
});
