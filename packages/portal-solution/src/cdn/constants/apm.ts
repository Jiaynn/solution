import { Freq } from 'cdn/apis/apm'

export const freqList = [
  {
    label: '15 分钟',
    value: '15min' as Freq
  },
  {
    label: '1 小时',
    value: '1hour' as Freq
  },
  {
    label: '1 天',
    value: '1day' as Freq
  }
]

interface ISeriesMap {
  [key: string]: string
}

export const responseTimeSeriesMap: ISeriesMap = {
  value: '响应时间'
}

export const downloadSpeedSeriesMap: ISeriesMap = {
  value: '下载速度'
}

export const errorCodeMsgForTicket = {
  500004001: '域名历史线路不在我们配置的线路中，如果有监测需求请'
}

export type ErrorCodeForTicket = keyof typeof errorCodeMsgForTicket

export function getErrorCodesForTicket() {
  return Object.keys(errorCodeMsgForTicket).map(code => Number(code))
}

export const APM_START_DATE = '2019-06-28'
