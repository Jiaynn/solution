
import React from 'react'

import { useInjection } from 'qn-fe-core/di'
import { Iamed } from 'portal-base/user/iam'
import { ICertInfo } from 'portal-base/certificate'

import { shouldForbidModifyCache } from 'cdn/transforms/domain'
import { getIgnoreParamsTypeText, getIgnoreParamsEnabled } from 'cdn/transforms/domain/cache'

import AbilityConfig from 'cdn/constants/ability-config'
import IamInfo from 'cdn/constants/iam-info'
import { isQiniu } from 'cdn/constants/env'

import { IDomainDetail } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import ConfigTable from './ConfigTable'
import ConfigureButton from './ConfigureButton'
import ConfigStatus from './ConfigStatus'

export default function CacheConfigBlock(props: {
  domain: IDomainDetail
  isBucketMissing: boolean
  loading: boolean
  certInfo?: ICertInfo
  handleConfigure: () => void
}) {
  const { domain, isBucketMissing, loading, certInfo, handleConfigure } = props
  const { iamActions } = useInjection(IamInfo)
  const abilityConfig = useInjection(AbilityConfig)

  const infoList = [
    {
      name: abilityConfig.cacheControlFieldLabel,
      desc: '定义指定资源内容的缓存过期时间规则',
      value: `${domain.cache.cacheControls?.length ?? 0} 条缓存规则`
    },
    {
      name: '忽略 URL 参数',
      desc: (
        isQiniu
        ? <p>资源缓存时去除 URL「?」后的全部参数进行缓存，<br />备注：忽略全部参数同时会导致图片处理等 FOP 功能失效。</p>
        : <p>资源缓存时去除 URL「?」后的全部参数进行缓存。</p>
      ),
      value: (
        <ConfigStatus
          enabled={getIgnoreParamsEnabled(domain.cache)}
          enabledTip={getIgnoreParamsTypeText(domain.cache)}
        />
      )
    }
  ]

  const renderOperations = (_: unknown, __: unknown, index: number) => ({
    props: {
      rowSpan: index === 0 ? infoList.length : 0
    },
    children: (
      <Iamed actions={[iamActions.UpdateCache]}>
        <ConfigureButton
          shouldForbid={shouldForbidModifyCache(domain, isBucketMissing, certInfo)}
          onClick={handleConfigure}
        >修改配置</ConfigureButton>
      </Iamed>
    )
  })

  return (
    <section className="content-block">
      <BlockTitle>缓存配置</BlockTitle>
      <ConfigTable
        configList={infoList}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
}
