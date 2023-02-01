/*
 * @file transform methods for domain name in url path
 * @author nighca <nighca@live.cn>
 */

export function decodeName(encoded: string) {
  return decodeURIComponent(encoded)
}
export function encodeName(decoded: string) {
  return encodeURIComponent(decoded)
}
