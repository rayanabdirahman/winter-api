import Joi from 'joi';

const signInSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required()
});

export default signInSchema;
