/*
 * @file error code messages for fusion/defy-monitor apis
 * @author zhouhang <zhouhang@qiniu.com>
 */

export const errorCodeMsg = {
  400001: {
    cn: '告警规则名称 / id 不能为空',
    en: 'The alarm rule name or id cannot be empty.'
  },
  400003: {
    cn: 'ChannelId 不能为空',
    en: 'ChannelId cannot be empty.'
  },
  400004: {
    cn: 'TemplateId 不能为空',
    en: 'TemplateId cannot be empty.'
  },
  400005: {
    cn: '告警规则不存在',
    en: 'The alarm rule does not exist.'
  },
  400006: {
    cn: '该规则存在绑定域名，无法删除',
    en: 'This rule cannot be deleted, you need to unbind all of binds before deleting.'
  }

} as const

export type ErrorCodeType = keyof typeof errorCodeMsg
