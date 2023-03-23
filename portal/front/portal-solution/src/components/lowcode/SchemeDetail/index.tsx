import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'
import React from 'react'

import './style.less'

const prefixCls = 'lowcode-scheme-detail'

export function LowcodeSchemeDetail() {
  const { query } = useInjection(RouterStore)
  const { url } = query

  return (
    <div className={`${prefixCls}-iframe`}>
      <iframe
        className={`${prefixCls}-iframe-shrink`}
        src={url?.toString()}
        width="100%"
        height="100%"
      ></iframe>
    </div>

  )
}
