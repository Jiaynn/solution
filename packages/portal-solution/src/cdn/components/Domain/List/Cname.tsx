/**
 * @file cname Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { ReactNode } from 'react'

import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import Tag from 'react-icecream/lib/tag'
import { useTranslation } from 'portal-base/common/i18n'

import * as commonMessages from 'cdn/locales/messages'

import { DomainType } from 'cdn/constants/domain'

import CopyLinkContent from 'cdn/components/common/CopyContent'

const messages = {
  copy: commonMessages.copy,
  searching: commonMessages.searching,
  notConfig: {
    cn: '未配置',
    en: 'Not Configured'
  },
  noNeedConfig: {
    cn: '无需配置',
    en: 'Unnecessary'
  },
  configured: {
    cn: '已配置',
    en: 'Configured'
  }
}

export interface Props {
  type: string
  cname: string
  checked: boolean
  loading: boolean
}

export default function DomainCname({
  type,
  cname,
  checked,
  loading
}: Props) {
  const t = useTranslation()

  if (loading) {
    return (
      <div className="comp-domain-cname">
        <Tooltip title={t(messages.searching)} overlayStyle={{ fontSize: '12px' }}>
          <Icon type="sync" spin className="cname-loading" />
        </Tooltip>
      </div>
    )
  }

  let cnt: ReactNode = null

  if (type === DomainType.Test) {
    cnt = (
      <Tag color="grey5">{t(messages.noNeedConfig)}</Tag>
    )
  } else {
    cnt = checked
      ? (
        <Tag color="green5">{t(messages.configured)}</Tag>
      )
      : (
        <Tag color="yellow3">{t(messages.notConfig)}</Tag>
      )
  }

  const title = (
    <>
      {cname}
      <CopyLinkContent className="copy-cname" title={t(messages.copy)} content={cname} />
    </>
  )

  return (
    <div className="comp-domain-cname">
      <Tooltip overlayClassName="cname-tooltip" title={title}>
        {cnt}
      </Tooltip>
    </div>
  )
}
