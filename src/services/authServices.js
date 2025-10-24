const User = require('../models/usermodel');
const signToken = require('../utils/generateToken');
const Joi = require('joi');
const AppError = require('../utils/appError');

exports.signup = async (userData) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid('user', 'event-organizer', 'event-admin', '')
    });

    const { error } = schema.validate(userData);
    if (error) throw new AppError(error.details[0].message, 400);

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role || 'user',
    });

    const token = signToken(newUser._id);
    newUser.password = undefined;

    return { user: newUser, token };
};

exports.login = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    const token = signToken(user._id);
    return { token, role: user.role };
};

