const authService = require('../services/authServices');
const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncErrorHandler');

exports.signup = asyncHandler(async (req, res, next) => {
    const { user, token } = await authService.signup(req.body);
    await notificationService.sendWelcomeNotification(user); // welcome email
    res.status(201).json({ status: 'success', token, data: { user } });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { token, role } = await authService.login(email, password);
    res.status(200).json({ status: 'success', token, role });
});

exports.getMe = (req, res, next) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
};

