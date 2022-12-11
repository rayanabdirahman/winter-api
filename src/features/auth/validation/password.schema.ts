import Joi from 'joi';

export const emailSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema: Joi.ObjectSchema = Joi.object({
  password: Joi.string().min(8).max(15).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Password must match',
    'any.required': '"confirmPassword" is required'
  })
});
