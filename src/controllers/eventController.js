const eventService = require('../services/eventServices');
const paymentService = require('../services/paymentServices');
const asyncHandler = require('../utils/asyncErrorHandler');
const AppError = require('../utils/appError');
const { createEventSchema, updateEventSchema } = require('../utils/eventValidator');

exports.createEvent = asyncHandler(async (req, res, next) => {
    const { error, value } = createEventSchema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));
    if (!req.file) return next(new AppError('Cover image is required.', 400));

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
    const event = await eventService.joinFreeEvent(req.params.id, req.user.id);
    if (!event) return next(new AppError('Could not join event. It may be full or you already joined.', 400));
    
    const io = req.app.get('io');
    if (io) {
        io.to(`event:${req.params.id}`).emit('userJoined', { eventId: req.params.id });
    }
    res.status(200).json({ status: 'success', message: 'Successfully joined event.', data: { event } });
});

exports.purchaseEvent = asyncHandler(async (req, res, next) => {
    const session = await paymentService.createCheckoutSession(req.params.id, req.user);
    res.status(200).json({ status: 'success', data: { sessionUrl: session.url } });
});

