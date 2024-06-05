import Joi from 'joi';

export const createTodoSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  completed: Joi.boolean()
});

export const updateTodoSchema = Joi.object({
  description: Joi.string(),
  completed: Joi.boolean()
});
