
import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { Iamed } from 'portal-base/user/iam'
import { ICertInfo } from 'portal-base/certificate'

import { shouldForbidImageOptimization } from 'cdn/transforms/domain'

import IamInfo from 'cdn/constants/iam-info'

import { IDomainDetail } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import ConfigTable from './ConfigTable'
import ConfigureButton from './ConfigureButton'
import ConfigStatus from './ConfigStatus'

export default function ImageOptimizationConfigBlock(props: {
  domain: IDomainDetail
  isBucketMissing: boolean
  loading: boolean
  certInfo?: ICertInfo
  handleConfigureImageSlimConfig: () => void
  handleConfigureFopConfig: () => void
}) {
  const iamInfo = useInjection(IamInfo)

  const {
    domain,
    certInfo,
    isBucketMissing,
    loading,
    handleConfigureImageSlimConfig,
    handleConfigureFopConfig
  } = props
  const infoList = [
    {
      name: '图片自动瘦身',
      desc: '无需添加任何参数，自动瘦身；图片体积大幅减少，节省 CDN 流量',
      value: <ConfigStatus enabled={domain.external.imageSlim.enableImageSlim} />,
      configureHandler: handleConfigureImageSlimConfig
    },
    {
      name: '图片处理',
      desc: '缩略图，裁剪，选择，格式等多种图片处理，需用户添加参数主动调用',
      value: <ConfigStatus enabled={domain.external.enableFop} />,
      configureHandler: handleConfigureFopConfig
    }
  ]

  const renderOperations = (_: unknown, record: any) => (
    <Iamed actions={[iamInfo.mustCdnIamActions().UpdateExternal]}>
      <ConfigureButton
        shouldForbid={shouldForbidImageOptimization(domain, isBucketMissing, certInfo)}
        onClick={record.configureHandler}
      >修改配置</ConfigureButton>
    </Iamed>
  )

  return (
    <section className="content-block">
      <BlockTitle>图片优化</BlockTitle>
      <ConfigTable
        configList={infoList}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
}
