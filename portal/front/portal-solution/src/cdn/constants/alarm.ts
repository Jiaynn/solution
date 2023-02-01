import { valuesOfEnum } from 'cdn/utils'

import {
  getOptionListWithChildren,
  getOptionPropWithChildren
} from 'cdn/transforms/alarm'

export enum AlarmType {
  Traffic = 'traffic',
  Bandwidth = 'bandwidth',
  StatusCode = 'statuscode',
  TrafficHitRate = 'traffichitrate',
  ReqHitRate = 'reqhitrate'
}

export const alarmType = valuesOfEnum(AlarmType)

export const alarmTypeNameMap = {
  [AlarmType.Bandwidth]: '带宽',
  [AlarmType.Traffic]: '流量',
  [AlarmType.StatusCode]: '状态码',
  [AlarmType.TrafficHitRate]: '流量命中率',
  [AlarmType.ReqHitRate]: '请求命中率'
}

export enum AlarmRuleSearchType {
  Domain = 'domain',
  Rule = 'rule',
}

export const defaultAlarmRuleSearchType = AlarmRuleSearchType.Rule

export const alarmRuleSearchTypeNameMap: {[key: string]: string} = {
  [AlarmRuleSearchType.Domain]: '域名',
  [AlarmRuleSearchType.Rule]: '规则名称'
}

export const alarmRuleSearchTypeOptions = valuesOfEnum(AlarmRuleSearchType).map(
  key => ({
    value: key,
    label: alarmRuleSearchTypeNameMap[key]
  })
)

export enum StatusCodeSubType {
  StatusCode2xx = '2xx',
  StatusCode3xx = '3xx',
  StatusCode4xx = '4xx',
  StatusCode5xx = '5xx'
}

export const statusCodeSubNameMap = {
  [StatusCodeSubType.StatusCode2xx]: '2xx',
  [StatusCodeSubType.StatusCode3xx]: '3xx',
  [StatusCodeSubType.StatusCode4xx]: '4xx',
  [StatusCodeSubType.StatusCode5xx]: '5xx'
  // [StatusCodeSubType.statusCodeSpecific]: '自定义' // 暂不支持
}

export const statusCodeSubOptionMap = getOptionListWithChildren(
  StatusCodeSubType,
  statusCodeSubNameMap
)

// 每一项都转化成 { value, label, children } 的格式
export const alarmItemOptionList = [
  getOptionPropWithChildren(
    AlarmType.StatusCode,
    alarmTypeNameMap[AlarmType.StatusCode],
    statusCodeSubOptionMap
  ),
  getOptionPropWithChildren(
    AlarmType.TrafficHitRate,
    alarmTypeNameMap[AlarmType.TrafficHitRate]
  ),
  getOptionPropWithChildren(
    AlarmType.ReqHitRate,
    alarmTypeNameMap[AlarmType.ReqHitRate]
  ),
  getOptionPropWithChildren(
    AlarmType.Bandwidth,
    alarmTypeNameMap[AlarmType.Bandwidth]
  ),
  getOptionPropWithChildren(
    AlarmType.Traffic,
    alarmTypeNameMap[AlarmType.Traffic]
  )
]

// TODO 换成 enum
export enum ThresholdType {
  Above = 'above', // 大于
  Below = 'below', // 小于
  Range = 'range',  // 区间
  RingRise = 'ring_rise', // 环比上升
  RingDrop = 'ring_drop', // 环比下降
  RingSwing = 'ring_swing' // 环比波动
}

export const thresholdTypeValues = valuesOfEnum(ThresholdType)

export const thresholdNameMap = {
  [ThresholdType.Above]: '高于',
  [ThresholdType.Below]: '低于',
  [ThresholdType.Range]: '区间',
  [ThresholdType.RingRise]: '环比上升',
  [ThresholdType.RingDrop]: '环比下降',
  [ThresholdType.RingSwing]: '环比波动'
}

// 后端暂不支持区间
export const thresholdTypeOptions = [
  {
    value: ThresholdType.Above,
    label: thresholdNameMap[ThresholdType.Above]
  },
  {
    value: ThresholdType.Below,
    label: thresholdNameMap[ThresholdType.Below]
  },
  {
    value: ThresholdType.RingRise,
    label: thresholdNameMap[ThresholdType.RingRise]
  },
  {
    value: ThresholdType.RingDrop,
    label: thresholdNameMap[ThresholdType.RingDrop]
  },
  {
    value: ThresholdType.RingSwing,
    label: thresholdNameMap[ThresholdType.RingSwing]
  }
]

// 数据点下拉框相关定义
export enum DataPointNumType {
  One = 1,
  Two,
  Three,
  Four,
  Five
}

export const dataPointNumTypeValues = valuesOfEnum(DataPointNumType)

export const dataPointNumTypeNameMap = {
  [DataPointNumType.One]: '持续 1 个数据点',
  [DataPointNumType.Two]: '持续 2 个数据点',
  [DataPointNumType.Three]: '持续 3 个数据点',
  [DataPointNumType.Four]: '持续 4 个数据点',
  [DataPointNumType.Five]: '持续 5 个数据点'
}

export const dataPointNumTypeOptions = [
  DataPointNumType.One,
  DataPointNumType.Two,
  DataPointNumType.Three,
  DataPointNumType.Four,
  DataPointNumType.Five
].map(value => ({
  value,
  label: dataPointNumTypeNameMap[value]
}))

export const notificationMethods = {
  qq: 'qq',
  wechat: 'wechat',
  msg: 'sms',
  mail: 'email'
}

export const notificationMethodNameMap = {
  [notificationMethods.qq]: 'QQ',
  [notificationMethods.msg]: '短信',
  [notificationMethods.wechat]: '微信',
  [notificationMethods.mail]: '邮箱'
}

// 目前只支持两种
export const notificationMethodOptions = [
  notificationMethods.msg,
  notificationMethods.mail
].map(method => ({
  value: method,
  label: notificationMethodNameMap[method]
}))

// 告警列表分页数量
export const PAGE_SIZE = 10

// 普通用户监控指标项数量限制
export const maxAlarmLength = 10

// 规则可绑定的域名数量
export const maxDomainsLength = 50

// 告警规则的高级功能白名单（监控指标项可超 10 项，指标名可配置状态码、命中率）
export const alarmAdvancedFeatureConfigKey = 'FUSION.FUSION_ALARM'

// 告警回调通知功能 feature key
export const alarmCallbackFeatureConfigKey = 'FUSION.FUSION_ALARM_CALLBACK'

// 事件项 ID
export const alarmChannelId = 'trafficAlarm'

// 模版 ID
export const alarmTemplateId = 'trafficAlarm'
