import { ValidationError } from 'class-validator';
import { ValidationException } from 'src/exception';

export function validationExceptionFactory(
  errors: ValidationError[],
): ValidationException {
  return new ValidationException(errors ?? []);
}
