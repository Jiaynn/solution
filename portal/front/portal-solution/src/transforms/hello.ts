/**
 * @file hello-relative transforms
 * @author nighca <nighca@live.cn>
 */

import { textMap } from 'constants/hello'

export function humanize(input: keyof typeof textMap) {
  return textMap[input] ?? input
}
