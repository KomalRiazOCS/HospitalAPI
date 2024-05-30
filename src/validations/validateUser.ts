import Joi from 'joi';

const validateUser = Joi.object().keys({
    email: Joi.string().email().required(),
    gameCodes: Joi.array().items(Joi.string()),
    noOfGameCodes: Joi.number().integer().min(0)
});

export default validateUser;