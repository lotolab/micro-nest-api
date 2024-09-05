import {
  Injectable,
  Optional,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Injectable()
export class LotoValidationPipe extends ValidationPipe {
  constructor(@Optional() options?: ValidationPipeOptions) {
    super(options);
  }

  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      if (this.isDetailedOutputDisabled) {
        return new HttpErrorByCode[this.errorHttpStatusCode]();
      }

      const errors = this.flattenValidationErrors(validationErrors);

      return new HttpErrorByCode[this.errorHttpStatusCode](errors);
    };
  }
}
