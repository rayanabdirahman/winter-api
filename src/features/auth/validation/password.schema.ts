import Joi from 'joi';

const emailSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required()
});

export default emailSchema;
