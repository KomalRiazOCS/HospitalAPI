import Joi from 'joi';

const validatePatient = Joi.object().keys({
    petName: Joi.string().required(),
        petType: Joi.string().valid('cat', 'dog', 'bird').required(),
        ownerName: Joi.string().required(),
        ownerAddress: Joi.string().required(),
        ownerPhone: Joi.string().min(11).required(),
        appointmentid: Joi.string().required
    });

export default validatePatient;