// import { SetMetadata } from '@nestjs/common';

export const OAUTH_REDIRECT_METADATA = Symbol('PROPS_OAUTH_REDIRECT_METADATA');

// /**
//  * Redirects request to the specified URL.
//  *
//  * @OauthRedirect
//  */
export function OauthRedirect(url = '', statusCode?: number): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    console.log(target, key);
    // Reflect.defineMetadata(
    //   OAUTH_REDIRECT_METADATA,
    //   { statusCode, url },
    //   descriptor.value,
    // );
    descriptor.value[OAUTH_REDIRECT_METADATA] = {
      url,
      statusCode,
    } as OauthRedirectDecorateParams;
    // return descriptor;
  };
}
// export const OauthRedirect = (
//   url: string = '',
//   code: RedirectCodeType = 302,
// ) => {
//   return SetMetadata(OAUTH_REDIRECT_METADATA, { url, statusCode: code });
// };
