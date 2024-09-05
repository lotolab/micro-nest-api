import { ValidationError, ValidatorOptions } from 'class-validator';

export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean; // To enable this behavior globally, set the option on a global pipe
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
