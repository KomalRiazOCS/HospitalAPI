import Joi from 'joi';

const validateLogin = Joi.object().keys({
    email: Joi.string().email().required(),
    gameCode: Joi.string().required()
});

export default validateLogin;