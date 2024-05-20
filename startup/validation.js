const Joi = require('joi');

module.exports = function(app) {
    Joi.objectId = require('joi-objectid')(Joi);
}

