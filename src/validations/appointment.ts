import Joi from 'joi';

const validateAppointment = Joi.object().keys({
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().required(),
    feeStatus: Joi.string().valid('USD', 'EUR', 'Bitcoin', 'unpaid').required(),
    amount: Joi.string().required()
});

export default validateAppointment;