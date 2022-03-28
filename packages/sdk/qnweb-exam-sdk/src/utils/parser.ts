/**
 * string => object
 * @param str
 */
export function parseStringToObject(str: string): Record<string, unknown> {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}
