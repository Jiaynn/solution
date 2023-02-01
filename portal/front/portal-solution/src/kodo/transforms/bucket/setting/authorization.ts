/**
 * @file transformers of bucket authorization
 * @author yinxulai <me@yinxulai.com>
 */

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

export function isShared(perm: ShareType) {
  return perm === ShareType.ReadOnly || perm === ShareType.ReadWrite
}

export function isWritable(perm: ShareType) {
  return perm === ShareType.Own || perm === ShareType.ReadWrite
}
