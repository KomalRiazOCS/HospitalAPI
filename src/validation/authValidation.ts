import Joi from 'joi';

function validateAuth(req: any): Joi.ValidationResult {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(req);
}

export default validateAuth;
