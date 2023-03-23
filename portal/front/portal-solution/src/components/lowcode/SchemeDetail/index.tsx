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
        src={url?.toString()}
        className={`${prefixCls}-iframe-shrink`}
        width="135%"
        height="135%"
      ></iframe>
    </div>

  )
}
