export const IgnoreTransformPropertyName = Symbol('PROPS_IGNORE_TRANSFORM_API');

export function IgnoreTransformApi() {
  return function (
    _target,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    descriptor.value[IgnoreTransformPropertyName] = true;
  };
}
