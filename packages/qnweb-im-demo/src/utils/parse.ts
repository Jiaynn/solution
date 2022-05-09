/**
 * 字符串 JSON.parse 为 对象
 * @param source
 */
export function jsonStringToObject(source: string) {
  try {
    return JSON.parse(source);
  } catch (e) {
    return source;
  }
}