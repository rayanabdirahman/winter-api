import Joi from 'joi';

const signUpSchema: Joi.ObjectSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required(),
  avatarColor: Joi.string().required(),
  avatarImage: Joi.string().required()
});

export default signUpSchema;
