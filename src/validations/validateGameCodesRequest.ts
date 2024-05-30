import Joi from 'joi';

const validateGameCodesRequest = Joi.object().keys({
    email: Joi.string().email().required(),
    noOfGameCodes: Joi.number().integer().min(1).max(100).required()
});

export default validateGameCodesRequest;