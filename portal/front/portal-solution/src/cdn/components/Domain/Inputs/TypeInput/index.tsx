/**
 * @file Input for domain type
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { FieldState, bindInput } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import ToolTip from 'react-icecream/lib/tooltip'
import { useTranslation } from 'portal-base/common/i18n'

import {
  humanizeType,
  shouldForbidTypePan,
  shouldForbidBucketUsedByDomain
} from 'cdn/transforms/domain'

import BucketStore from 'cdn/stores/bucket'

import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType } from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'
import { IBucketSimplified } from 'cdn/apis/bucket'

import './style.less'

export type State = FieldState<DomainType>

export type Value = DomainType

export function createState(val?: DomainType): State {
  return new FieldState(val == null ? DomainType.Normal : val)
}

export interface Props {
  domain: IDomainDetail
  buckets: IBucketSimplified[]
  shouldDisableBasedOnBucket: boolean
  state: State
}

interface DomainTypeInputProps {
  domain: IDomainDetail
  buckets: IBucketSimplified[]
  shouldDisableBasedOnBucket: boolean
  value: DomainType
  onChange: (val: DomainType) => void
}

const DomainTypeInput = observer(function _DomainTypeInput(props: DomainTypeInputProps) {
  const { domain, buckets, shouldDisableBasedOnBucket, value } = props
  const shouldForbidTypePanMessage = shouldForbidTypePan(domain.source.sourceType, !!buckets.length)
  const bucketStore = useInjection(BucketStore)
  const { domainTypes, supportMidSource } = useInjection(AbilityConfig)
  const t = useTranslation()

  const radios = domainTypes.map(
    type => {
      const shouldForbidTypeByBucketNameMessage = (
        shouldDisableBasedOnBucket && shouldForbidTypeByBucketName(bucketStore, domain.source.sourceQiniuBucket, type)
        || null
      )
      const shouldForbid = (
        type === DomainType.Pan && shouldForbidTypePanMessage
        || shouldForbidTypeByBucketNameMessage
      )

      const radioOption = (
        <Radio
          key={type}
          value={type}
          disabled={!!shouldForbid}
        >
          {t(humanizeType(type))}
        </Radio>
      )

      const radioContent = shouldForbid
        ? <ToolTip key={type} title={shouldForbid}>{radioOption}</ToolTip>
        : radioOption

      return (
        {
          shouldForbid,
          radioButton: radioContent
        }
      )
    }
  )

  const radioButtons = radios.map(radio => radio.radioButton)

  const helpBlock = getHelpBlock(value, supportMidSource)

  return (
    <div className="domain-type-input-wrapper">
      <div className="line">
        <Radio.Group
          value={props.value}
          onChange={e => props.onChange((e.target as any).value)}
        >{radioButtons}</Radio.Group>
      </div>
      {helpBlock}
    </div>
  )
})

function getHelpBlock(type: DomainType, supportMidSource: boolean) {
  if (type === DomainType.Wildcard) {
    if (supportMidSource) {
      return <p className="line help">配置成功后可任意指定前缀进行访问；可基于该泛域名创建多个泛子域名来指定不同源站。</p>
    }
    return <p className="line help">配置成功后可任意指定前缀进行访问。</p>
  }
  if (type === DomainType.Pan) {
    return <p className="line help">基于泛域名创建的子域名；秒级创建；可独立指定源站，其它配置继承泛域名。</p>
  }
  return null
}

function shouldForbidTypeByBucketName(bucketStore: BucketStore, bucketName: string, type: string): string | undefined {
  const bucket = bucketStore.getBucket(bucketName)
  if (bucket == null) {
    return '非法的 bucket'
  }
  return shouldForbidBucketUsedByDomain(bucket, type)
}

export default observer(function DomainTypeInputWrapper(props: Props) {
  const { state, ...restProps } = props
  return (
    <DomainTypeInput
      {...bindInput(state)}
      {...restProps}
    />
  )
})
