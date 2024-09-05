export class ProxyAIError extends Error {
  statusCode?: number;
  statusText?: string;
  isFinal?: boolean;
  response?: any;
  errorCode?: number;

  constructor(message?: string, options?: { cause?: any; errorCode?: number }) {
    super(message);

    if (options?.cause) {
      this.response = options.cause;
    }

    if (options.errorCode) {
      this.errorCode = options.errorCode;
    }

    this.name = new.target.name;

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, new.target);
    }

    if (typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(this, new.target.prototype);
    } else {
      (this as any).__proto__ = new.target.prototype;
    }
  }

  static createError(
    message: string,
    res?: Response | null,
    errorCode?: number,
  ): ProxyAIError {
    const e = new ProxyAIError(message, { cause: res });
    if (res) {
      e.statusCode = res.status;
      e.statusText = res.statusText;
    }
    e.errorCode = errorCode ?? res?.status;

    return e;
  }

  static createUnknownError(ex?: any): ProxyAIError {
    let msg = 'Unknown Error';
    if (typeof ex === 'string') {
      msg = ex as unknown as string;
    } else if (typeof ex === 'object' && ex?.message) {
      msg = ex.message as unknown as string;
    }
    const e = new ProxyAIError(msg);
    e.statusCode = 500;
    e.statusText = msg;
    return e;
  }
}
