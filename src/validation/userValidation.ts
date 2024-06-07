import Joi from 'joi';

interface User {
  firstname?: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string;
  profileImage?: string;
}

function validateUser(user: User): Joi.ValidationResult {
  const schema = Joi.object({
    firstname: Joi.string().min(1).max(50),
    lastname: Joi.string().min(1).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    confirmpassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'confirmpassword must match password'
    }),
    profileImage: Joi.string().uri().allow('')
  });

  return schema.validate(user);
}

export default validateUser;
