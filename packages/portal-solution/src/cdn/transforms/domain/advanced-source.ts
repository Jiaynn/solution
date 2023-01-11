import {
  and, or, textPattern, textRequired, textEmpty,
  numberMin, numberMax, numberNotNaN, notSameWith
} from 'cdn/transforms/form'

import { IAdvancedSource } from 'cdn/components/Domain/Inputs/AdvancedSourcesInput'

import { IDomainDetail } from 'cdn/apis/domain'

export const validatePort = and(
  numberMin(1),
  numberMax(65535)
)

export const validatePortText = (portText: string) => or(
  textEmpty,
  and(
    textPattern(/^\d+$/),
    port => validatePort(parseInt(port, 10))
  )
)(portText, '请输入正确的端口号')

export const validateWeight = and(
  (weight: number) => numberNotNaN(weight, '请输入正确的权重'),
  (weight: number) => (
    weight > 0 && Math.floor(weight) === weight
    ? null
    : '权重请输入正整数'
  )
)

export const validateAdvancedSource = (domains: IDomainDetail[]) => and<IAdvancedSource>(
  v => textRequired(v.host, '域名/ip 必填'),
  v => and(...domains.map(domain => notSameWith(domain.name)))(v.host, '回源地址不能与加速域名相同'),
  v => validatePortText(v.port),
  v => validateWeight(v.weight)
)

// export const validateAdvancedSources = (domains: IDomainDetail[]) => listOf(validateAdvancedSource(domains))
