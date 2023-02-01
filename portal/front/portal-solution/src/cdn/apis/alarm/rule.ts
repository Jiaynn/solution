/**
 * @file alarm rule config apis
 * @author zhouhang <zhouhang@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import { ThresholdType, DataPointNumType, AlarmType, StatusCodeSubType } from 'cdn/constants/alarm'

import DefyMonitorClient from 'cdn/apis/clients/defy-monitor'

export interface ThresholdItem {
  thresholdType: ThresholdType
  thresholdVal: number | null
}

export interface MetricsItem {
  alarmType: AlarmType // 监控项
  alarmSubType?: StatusCodeSubType //  监控细分类 只有当alarmType为"statuscode"可选"2xx","3xx","4xx","5xx". 其他情况忽略
  threshold: ThresholdItem // 监控项阈值
  dataPointNum: DataPointNumType
}

export interface RecipientItem {
  recipientUserIds?: string[]
  recipientGroupIds?: string[]
  webhookIds?: string[]
  channelId?: string
  templateId?: string
}

export interface AlarmConfig {
  domains: string[]
  rule: AlarmRuleConfig // 告警配置
}

export interface AlarmRuleConfig {
  ruleId: string,
  name: string // 规则名称
  independent: boolean
  isEnable: boolean // 告警启停
  modified: string
  recipient?: RecipientItem
  metrics: MetricsItem[]
}

export type AlarmConfigForEdit = Omit<AlarmRuleConfig, 'modified' | 'ruleId'> & { domains: string[] }

export interface GetAlarmConfigResp {
  result: AlarmConfig[]
}

const formatResponse = (resp: GetAlarmConfigResp) => {
  const list = (resp.result || []).map(it => {
    it.rule.metrics = it.rule.metrics || []
    return it
  })
  return { ...resp, list }
}

@injectable()
export default abstract class AlarmApis {

  abstract apiPrefix: string

  constructor(
    private client: DefyMonitorClient
  ) {}

  getConfigList(): Promise<GetAlarmConfigResp> {
    return this.client.post(`${this.apiPrefix}/list`)
      .then(formatResponse)
  }

  upsertConfig(config: AlarmConfigForEdit) {
    return this.client.post<void>(`${this.apiPrefix}/create`, config)
  }

  deleteConfig(ruleId: string) {
    return this.client.post<void>(`${this.apiPrefix}/delete`, { ruleId })
  }

}

export class CdnAlarmApis extends AlarmApis {
  apiPrefix = '/v3/fusion/cdn/alarm/rule'
}

export class DcdnAlarmApis extends AlarmApis {
  apiPrefix = '/v3/fusion/dcdn/alarm/rule'
}
