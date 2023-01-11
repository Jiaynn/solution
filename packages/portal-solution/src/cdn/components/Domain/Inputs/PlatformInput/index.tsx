/**
 * @file Input for domain platform
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import Radio from 'react-icecream/lib/radio'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizePlatform, shouldForbidSourceTypeAndPlatform } from 'cdn/transforms/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { Platform, SourceType } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'

import './style.less'

export type State = FieldState<Platform>

export type Value = Platform

export function createState(platform: Platform): State {
  return new FieldState(platform)
}

export interface Props {
  state: State
  sourceType: SourceType
}

const DomainPlatformInput = observer(function _DomainPlatformInput(props: {
  value: string,
  sourceType: SourceType
  onChange: (value: string) => void
}) {
  const abilityConfig = useInjection(AbilityConfig)
  const t = useTranslation()

  const radios = abilityConfig.domainPlatforms.map(platform => {
    const shouldForbid = shouldForbidSourceTypeAndPlatform(props.sourceType, platform)
    const cnt = shouldForbid
      ? (
        <span>
          {t(humanizePlatform(platform))}
          <TipIcon
            size="12px"
            tip={shouldForbid}
          />
        </span>
      )
      : t(humanizePlatform(platform))

    return (
      <Radio
        className="ant-radio-border"
        key={platform}
        value={platform}
        disabled={!!shouldForbid}
      >{cnt}</Radio>
    )
  })

  return (
    <div className="domain-platform-input-wrapper">
      <div className="line">
        <Radio.Group
          value={props.value}
          onChange={e => props.onChange((e.target as any).value)}
        >{radios}</Radio.Group>
      </div>
    </div>
  )
})

export default observer(function DomainPlatformInputWrapper({ state, ...restProps }: Props) {
  return (
    <DomainPlatformInput {...bindInput(state)} {...restProps} />
  )
})
