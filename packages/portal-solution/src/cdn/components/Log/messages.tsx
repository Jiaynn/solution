/**
 * @file Log Locale Messages
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

import logFormatDoc from 'cdn/docs/log-format.pdf'
import logFormatEnDoc from 'cdn/docs/log-format-english.pdf'

import HelpLink from 'cdn/components/common/HelpLink'

export const logSaveTime = {
  cn: '日志默认保留时间为 30 天，生成大概延迟 6 小时；',
  en: 'The default retention time of logs is 30 days, and the generation delay is about 6 hours.'
}

export const logFormat = {
  cn: <>关于日志格式请参考<HelpLink oemHref={logFormatDoc} href="https://support.qiniu.com/hc/kb/article/160890/"> CDN日志格式简介 </HelpLink>。</>,
  en: <>For log format, please refer to <HelpLink oemHref={logFormatEnDoc} href="https://support.qiniu.com/hc/kb/article/160890/">CDN log format introduction</HelpLink>.</>
}
