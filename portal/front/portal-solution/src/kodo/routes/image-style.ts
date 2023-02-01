/**
 * @file image-style route
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'

export function getImageStyleSetPath(bucketName: string, name?: string) {
  return `/dora/fop/imageprocess?bucket=${bucketName}` + (name ? `&name=${encodeUrlSafeBase64(name)}` : '')
}

export function getPresetListPath() {
  return '/dora/media-gate/preset'
}

export function getCreatePresetPath() {
  return '/dora/media-gate/preset/transcode/create'
}
