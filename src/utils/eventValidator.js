const Joi = require('joi');
// using Joi to validate data
exports.createEventSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(5000),
    startAt: Joi.date().iso().required(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
    capacity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).optional(),
});

exports.updateEventSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().max(5000),
    startAt: Joi.date().iso(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')),
    capacity: Joi.number().integer().min(1),
    price: Joi.number().min(0),
}).min(1);
