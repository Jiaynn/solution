/**
 * @file Code Locale Messages
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

import httpCodeDoc from 'cdn/docs/http-code.pdf'

import HelpLink from 'cdn/components/common/HelpLink'

export { exportCsv } from 'cdn/locales/messages'

export { total, dailyAvg } from '../messages'

export const statusCode = {
  cn: '状态码',
  en: 'Status code'
}

export const statusCodeDetail = {
  cn: '状态码详情',
  en: 'Status code detail'
}

export const count = {
  cn: '数量',
  en: 'Count'
}

export const percent = {
  cn: '比例',
  en: 'Percent'
}

export const statusCodeDistribution = {
  cn: '状态码分布',
  en: 'Status code distribution'
}

export const others = {
  cn: '其他',
  en: 'Others'
}

export const statusCodeDefinition = {
  cn: (
    <>
      查看常见
      <HelpLink
        oemHref={httpCodeDoc}
        href="https://support.qiniu.com/hc/kb/article/184931"
      >
        状态码释义
      </HelpLink>
    </>
  ),
  en: (
    <>
      Definition of&nbsp;
      <HelpLink
        oemHref="https://en.wikipedia.org/wiki/List_of_HTTP_status_codes"
        href="https://support.qiniu.com/hc/kb/article/184931"
      >
        status code
      </HelpLink>
    </>
  )
}
