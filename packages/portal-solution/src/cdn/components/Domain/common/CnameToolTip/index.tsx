/**
 * @file CnameToolTip Component
 * @author linchen gakiclin@gmail.com
 */

import React from 'react'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import { useTranslation } from 'portal-base/common/i18n'

import cnameDoc from 'cdn/docs/config-cname.pdf'

import HelpLink from 'cdn/components/common/HelpLink'

import './style.less'

const cnameTipMsg = {
  cn: (
    <>
      如需使用 CDN 加速，需要配置加速域名指向 CNAME。配置 CNAME 后大约有 10 分钟延迟才会生效。
      <HelpLink oemHref={cnameDoc} href="https://developer.qiniu.com/fusion/kb/1322/how-to-configure-cname-domain-name">如何配置</HelpLink>
    </>
  ),
  en: (
    <>
      To use CDN acceleration, you need to configure the accelerated domain name to point to CNAME.
      After CNAME is configured, it will take about 10 minutes to take effect.
    </>
  )
}

export default function CnameToolTip() {
  const t = useTranslation()

  const title = (
    <div style={{ fontSize: '12px' }}>
      {t(cnameTipMsg)}
    </div>
  )

  return (
    <span className="comp-cname-tool-tip">
      CNAME
      <Tooltip title={title}>
        <Icon className="tool-tip-icon" type="question-circle" theme="filled" />
      </Tooltip>
    </span>
  )
}
