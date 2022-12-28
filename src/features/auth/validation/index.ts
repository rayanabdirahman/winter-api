import Joi from 'joi';

export const signUpSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required()
});

export const signInSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required()
});

export const forgotPasswordEmailSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema: Joi.ObjectSchema = Joi.object({
  password: Joi.string().min(8).max(15).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Password must match',
    'any.required': '"confirmPassword" is required'
  })
});
