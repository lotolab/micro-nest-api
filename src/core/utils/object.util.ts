type ObjectType = Record<string, number | string | boolean>;

export const objectKeySorted = (
  obj: Record<string, any>,
): Record<string, any> => {
  if (!Object.keys(obj)?.length) return obj;

  return Object.keys(obj)
    .sort()
    .reduce(
      (sortedObj, key) => {
        sortedObj[key] = obj[key];
        return sortedObj;
      },
      {} as { [key: string]: any },
    );
};

export const mapToObj = (map: Map<string, any>): ObjectType => {
  const obj: ObjectType = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  return obj;
};
