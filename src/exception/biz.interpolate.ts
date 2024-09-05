export function interpolateMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  if (!Object.keys(values)?.length) return template;

  let result = template;
  Object.keys(values).forEach((key: string) => {
    const regx = RegExp(`\#${key}\{\}`, 'g');
    result = result.replaceAll(regx, String(values[key]));
  });

  return result;
}
