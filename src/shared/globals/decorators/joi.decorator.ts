/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { ObjectSchema } from 'joi';
import { JoiValidationError } from '@globals/helpers/errorHandler';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export default function joiValidate(schema: ObjectSchema): IJoiDecorator {
  return (_target, _key, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new JoiValidationError(error.details[0]?.message);
      }

      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
