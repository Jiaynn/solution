/**
 * @file HTTP 头部设置模块
 * @author zhuhao <zhuhao@qiniu.com>
 * @author hejinxin <hejinxin@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ICertInfo } from 'portal-base/certificate'

import { shouldForbidModifyHttpHeader } from 'cdn/transforms/domain'

import responseHeaderDoc from 'cdn/docs/response-header.pdf'

import Links from 'cdn/constants/links'
import IamInfo from 'cdn/constants/iam-info'

import TipIcon from 'cdn/components/TipIcon'
import HelpLink from 'cdn/components/common/HelpLink'

import { IDomainDetail } from 'cdn/apis/domain'

import ConfigureButton from './ConfigureButton'
import ConfigTable, { IConfigInfo } from './ConfigTable'
import BlockTitle from './BlockTitle'

export interface IResponseHeaderConfigBlockProps {
  domain: IDomainDetail
  loading: boolean
  certInfo?: ICertInfo
  handleConfigStart: () => void
  handleConfigCancel?: () => void
}

export default observer(function ResponseHeaderConfigBlock(props: IResponseHeaderConfigBlockProps) {
  const { domain, loading, certInfo, handleConfigStart } = props
  const { iamActions } = useInjection(IamInfo)
  const links = useInjection(Links)

  const length = domain.responseHeaderControls
    ? domain.responseHeaderControls.length
    : 0
  const info: IConfigInfo[] = [{
    name: 'HTTP 响应头',
    desc: '支持常见的 HTTP 请求响应头配置，可向客户端提供额外信息',
    value: `${length} 条配置`,
    configureHandler: handleConfigStart,
    iamAction: iamActions.UpdateResponseHeader
  }]

  const renderOperations = (_: unknown, record: any) => (
    <ConfigureButton
      shouldForbid={shouldForbidModifyHttpHeader(domain, certInfo)}
      onClick={record.configureHandler}
    >修改配置</ConfigureButton>
  )

  return (
    <section className="content-block">
      <BlockTitle>
        HTTP 响应头配置
        <TipIcon className="content-block-title-tip-icon"
          tip={
            <>支持用户选择添加已有的 HTTP 响应头，点击
              <HelpLink
                oemHref={responseHeaderDoc}
                href={links.responseHeader}
              >
                了解更多
              </HelpLink>
            </>
          }
        />
      </BlockTitle>
      <ConfigTable
        configList={info}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
})
