const User = require('../models/usermodel');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');

exports.getAllUsers = async () => User.find().lean();
exports.getAllEvents = async () => Event.find().sort({ createdAt: -1 }).lean();
exports.getAllPayments = async () => Payment.find().populate('userId', 'name').populate('eventId', 'title').sort({ createdAt: -1 }).lean();

exports.getStats = async () => {
    const totalUsers = await User.countDocuments();
    const activeEvents = await Event.countDocuments({ startAt: { $gte: new Date() } });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueResult = await Payment.aggregate([
        { $match: { status: 'succeeded', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueLast30Days = revenueResult.length > 0 ? revenueResult[0].total : 0;
    return { totalUsers, activeEvents, revenueLast30Days };
};

