import { SetMetadata } from '@nestjs/common';

export const PublicApiPropertyName = Symbol('PROPS_IS_PUBLIC_API');

export const PublicApi = () => SetMetadata(PublicApiPropertyName, true);
