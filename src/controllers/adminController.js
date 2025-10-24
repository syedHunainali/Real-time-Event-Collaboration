const adminService = require('../services/adminServices');
const asyncHandler = require('../utils/asyncErrorHandler');

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await adminService.getAllUsers();
    res.status(200).json({ status: 'success', data: { users } });
});

exports.getEvents = asyncHandler(async (req, res) => {
    const events = await adminService.getAllEvents();
    res.status(200).json({ status: 'success', data: { events } });
});

exports.getPayments = asyncHandler(async (req, res) => {
    const payments = await adminService.getAllPayments();
    res.status(200).json({ status: 'success', data: { payments } });
});

exports.getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getStats();
    res.status(200).json({ status: 'success', data: { stats } });
});

