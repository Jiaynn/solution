/**
 * @file CreateDomainSummary Summary Component
 * @author linchen gakiclin@gmail.com
 */

import React from 'react'
import cns from 'classnames'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'

import cnameDoc from 'cdn/docs/config-cname.pdf'

import { isOEM } from 'cdn/constants/env'
import { CreateDomainSummary } from 'cdn/constants/domain'
import Routes from 'cdn/constants/routes'

import './style.less'

const resultSummaryTextMap = {
  [CreateDomainSummary.Failure]: '域名创建失败',
  [CreateDomainSummary.PartialFailure]: '部分域名创建失败',
  [CreateDomainSummary.Success]: '域名创建成功，配置部署中'
}

export interface IProps {
  status: CreateDomainSummary
}

export default function ResultSummary({ status }: IProps) {
  const routes = useInjection(Routes)
  const icon = (
    <Icon
      theme="filled"
      type={status === CreateDomainSummary.Success ? 'check-circle' : 'close-circle'}
      className={cns('summary-icon', CreateDomainSummary.Success)}
    />
  )

  const header = (
    <div className="result-summary-header">
      {icon}
      <span className="result-summary-header-title">
        {resultSummaryTextMap[status]}...
      </span>
    </div>
  )

  const routerStore = useInjection(RouterStore)
  const handleRedirectDomainList = () => {
    routerStore.push(routes.domainList)
  }

  const handleRedirectCnameDoc = () => {
    const url = isOEM ? cnameDoc : 'https://support.qiniu.com/hc/kb/article/68977/'
    window.open(url, '_blank', 'noopener')
  }

  const tip = (
    <div className="result-summary-tip">
      如需使用 CDN 加速服务，请配置 CNAME
    </div>
  )

  const actions = (
    <div className="result-summary-actions">
      <Button className="actions-btn" type="primary" onClick={handleRedirectCnameDoc}>如何配置 CNAME</Button>
      <Button className="actions-btn" onClick={handleRedirectDomainList}>返回域名管理</Button>
    </div>
  )

  return (
    <section className="result-summary">
      {header}
      {tip}
      {actions}
    </section>
  )
}
