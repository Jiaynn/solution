/**
 * @file byte transforms
 * @author yinxulai <yinxulai@qiniu.com>
 */

export function countByte(...strings: string[]): number {
  return new Blob(strings).size
}
