const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const asyncHandler = require('../utils/asyncErrorHandler');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
    }

    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ status: 'fail', message: 'Invalid or expired token. Please log in again.' });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return res.status(401).json({ status: 'fail', message: 'The user belonging to this token does no longer exist.' });
    }

    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action.'
            });
        }
        next();
    };
};
