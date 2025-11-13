const Event = require('../models/eventModel');
const User = require('../models/userModel'); 

exports.createEvent = async (eventData) => {
    return await Event.create(eventData);
};

exports.getEventById = async (id) => {
    return await Event.findById(id).populate('organizerId', 'name email').populate('attendees', 'name email');
};

exports.getAllEvents = async (filters = {}, pagination = {}) => {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters?.date) query.startAt = { $gte: new Date(filters.date) };
    if (filters?.price) query.price = filters.price === 'free' ? 0 : { $gt: 0 };
    
    const [events, total] = await Promise.all([
        Event.find(query).skip(skip).limit(limit).sort({ startAt: 1 }).lean(),
        Event.countDocuments(query)
    ]);
    return { events, total, page, limit };
};

exports.updateEvent = async (eventId, updateData, organizerId) => {
    return await Event.findOneAndUpdate(
        { _id: eventId, organizerId: organizerId },
        updateData,
        { new: true, runValidators: true }
    );
};

exports.deleteEvent = async (eventId, organizerId) => {
    return await Event.findOneAndDelete({ _id: eventId, organizerId: organizerId });
};

// Corrected atomic operation to prevent race conditions
exports.joinFreeEvent = async (eventId, userId) => {
    return await Event.findOneAndUpdate(
        {
            _id: eventId,
            price: 0,
            $expr: { $lt: ["$attendeesCount", "$capacity"] }, // Atomic check
            attendees: { $ne: userId }
        },
        {
            $inc: { attendeesCount: 1 },
            $push: { attendees: userId }
        },
        { new: true }
    );
};

exports.getEventsByUserId = async (userId) => {
    return await Event.find({ organizerId: userId }).populate('organizerId', 'name email');
};

exports.getAllOrganizers = async () => {
  return await User.find({ role: "event-organizer" }).select('_id name');
};