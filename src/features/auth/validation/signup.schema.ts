import Joi from 'joi';

const signUpSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  avatar: Joi.string().required(),
  password: Joi.string().min(8).max(15).required()
});

export default signUpSchema;
