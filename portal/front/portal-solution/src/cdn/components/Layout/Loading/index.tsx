/**
 * @file component Loading
 * @author yinxulai <me@yinxulai.cn>
 */

import React from 'react'
import { Spin } from 'react-icecream/lib'
import { useTranslation } from 'portal-base/common/i18n'
import { GlobalLoading } from 'portal-base/common/loading'

import * as messages from 'cdn/locales/messages'

import { isQiniu } from 'cdn/constants/env'

import './style.less'

export default function Loading() {
  const t = useTranslation()

  if (isQiniu) {
    return <GlobalLoading />
  }

  return (
    <div className="comp-customize-loading">
      <Spin tip={t(messages.loading)} />
    </div>
  )
}
