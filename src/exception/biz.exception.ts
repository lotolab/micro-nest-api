import { BizCodeEnum } from './biz.code.enum';
import { BizMessages } from './biz.message';

export class BizException extends Error {
  private readonly _code: number;
  private _error: string | string[] | undefined;

  private _locale: LocaleType = 'zhCN';

  constructor(code: number, message: string, options?: BizErrorOptionType) {
    super(message);
    this._code = code;

    const { locale = 'zhCN', error } = options || { locale: 'zhCN' };
    this._locale = locale;
    if (error) this._error = error;
  }

  set message(message: string) {
    this.message = message;
  }

  get code(): number {
    return this._code;
  }

  // get message(): string {
  //   return JSON.stringify({ code: this.code, message: super.message });
  // }

  get error(): string | string[] | undefined {
    return this._error;
  }

  set error(err: string | string[]) {
    this._error = err;
  }

  static createError(
    code: BizException | number,
    message?: string,
    options?: BizErrorOptionType,
  ) {
    const { locale = 'enUS' } = options || {};

    let localeMessage = message;
    const messages: Record<number, string> = BizMessages(locale);
    const c = code.valueOf() as unknown as number;
    if (messages[c] && !message?.length) {
      localeMessage = messages[c];
    }

    if (!localeMessage) localeMessage = String(code.valueOf());

    return new BizException(c, message, options);
  }

  static IllegalParamterError(message?: string, options?: BizErrorOptionType) {
    const { locale = 'enUS' } = options || {};

    let localeMessage;
    const code = BizCodeEnum.ILLEGAL_ARGS;
    const messages: Record<number, string> = BizMessages(locale);
    if (message?.length) {
      localeMessage = message;
    } else {
      localeMessage = messages[code.valueOf()] ?? code.valueOf().toString();
    }

    return new BizException(code, localeMessage);
  }
}
