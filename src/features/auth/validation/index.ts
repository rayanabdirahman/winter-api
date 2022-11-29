import Joi from 'joi';
import signInSchema from './signin.schema';
import signUpSchema from './signup.schema';

export default class AuthValidator {
  static signUp(model: any): Joi.ValidationResult {
    return signUpSchema.validate(model);
  }
  signIn(model: any): Joi.ValidationResult {
    return signInSchema.validate(model);
  }
}
