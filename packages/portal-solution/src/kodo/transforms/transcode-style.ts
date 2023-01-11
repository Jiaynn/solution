/**
 * @file transform functions for transcode-style
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { ITranscodeStyleInfo } from 'kodo/apis/bucket'
import { decodeUrlSafeBase64, encodeUrlSafeBase64 } from './base64'

export function decodeTargetName(data: ITranscodeStyleInfo) {
  return decodeUrlSafeBase64(data.command.split('|saveas/')[1]).split(data.bucket + ':')[1]
}

export function getTranscodeCommand(command: string, bucket: string, name: string) {
  return command + '|saveas/' + encodeUrlSafeBase64(bucket + ':' + name)
}
