/**
 * @desc Stream push transform functions
 * @author hovenjay <hovenjay@outlook.com>
 */

import { ValidatorResponse } from 'formstate-x'

export function validateStreamPushTaskName(name: string): ValidatorResponse {
  if (!name) return '请输入任务名称'
  if (!/^[a-zA-Z0-9]{1,20}$/.test(name)) return '无效的任务名称'
}

export function validateStreamPushTaskSourceUrl(url: string): ValidatorResponse {
  return !url && '请输入拉流地址'
}
