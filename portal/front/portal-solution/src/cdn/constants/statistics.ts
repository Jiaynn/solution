import { valuesOfEnum } from 'cdn/utils'

import { Freq } from 'cdn/apis/statistics'

// 统计分析数据源
export enum StatisticsDataSource {
  /** 日志分析数据 */
  Analysis = 'analysis',
  /** 计量数据 */
  Traffic = 'traffic'
}

export const flowSummaryNames = {
  total: 'flowTotal',
  average: 'flowAverage',
  static: 'flowStatic',
  dynamic: 'flowDynamic',
  china: 'flowChina',
  oversea: 'flowOversea',
  totalInLeisure: 'flowTotalInLeisure',
  totalInDaytime: 'flowTotalInDaytime'
}

export const reqcountSummaryNames = {
  total: 'reqcountTotal',
  average: 'reqcountAverage',
  static: 'reqcountStatic',
  dynamic: 'reqcountDynamic',
  china: 'reqcountChina',
  oversea: 'reqcountOversea',
  totalInLeisure: 'reqcountTotalInLeisure',
  totalInDaytime: 'reqcountTotalInDaytime'
}

export const summaryNameMap = {
  [flowSummaryNames.total]: {
    cn: '访问总流量',
    en: 'Total traffic'
  },
  [flowSummaryNames.average]: {
    cn: '日均流量',
    en: 'Average daily traffic'
  },
  [flowSummaryNames.static]: {
    cn: '静态加速流量',
    en: undefined
  },
  [flowSummaryNames.dynamic]: {
    cn: '动态加速流量',
    en: undefined
  },
  [flowSummaryNames.china]: {
    cn: '国内总流量',
    en: undefined
  },
  [flowSummaryNames.oversea]: {
    cn: '海外总流量',
    en: undefined
  },
  [flowSummaryNames.totalInLeisure]: {
    cn: '闲时总流量',
    en: 'Leisure total traffic'
  },
  [flowSummaryNames.totalInDaytime]: {
    cn: '日间总流量',
    en: 'Daily total traffic'
  },

  peak: {
    cn: '峰值带宽',
    en: 'Peak bandwidth'
  },
  peak95: {
    cn: '95 峰值带宽',
    en: 'Peak 95 bandwidth'
  },
  peakAverage: {
    cn: '平均峰值带宽',
    en: 'Average peak bandwidth'
  },
  peak95Average: {
    cn: '平均 95 峰值带宽',
    en: 'Average peak 95 bandwidth'
  },

  [reqcountSummaryNames.total]: {
    cn: '访问总次数',
    en: 'Total requests'
  },
  [reqcountSummaryNames.average]: {
    cn: '日均访问次数',
    en: 'Average daily requests'
  },
  [reqcountSummaryNames.static]: {
    cn: '静态加速次数',
    en: undefined
  },
  [reqcountSummaryNames.dynamic]: {
    cn: '动态加速次数',
    en: undefined
  },
  [reqcountSummaryNames.china]: {
    cn: '国内访问次数',
    en: undefined
  },
  [reqcountSummaryNames.oversea]: {
    cn: '海外访问次数',
    en: undefined
  },
  [reqcountSummaryNames.totalInLeisure]: {
    cn: '闲时访问总次数',
    en: 'Leisure total requests'
  },
  [reqcountSummaryNames.totalInDaytime]: {
    cn: '日间访问总次数',
    en: 'Daily total requests'
  }
}

export const diagramTypes = {
  bandwidth: 'bandwidth',
  flow: 'flow',
  reqcount: 'reqcount',
  code: 'code',
  hitratio: 'hitratio',
  uv: 'uv'
}

export const diagramTypeNameMap = {
  [diagramTypes.bandwidth]: {
    cn: '带宽',
    en: 'Bandwidth'
  },
  [diagramTypes.flow]: {
    cn: '流量',
    en: 'Traffic'
  },
  [diagramTypes.reqcount]: {
    cn: '请求数',
    en: 'Request count'
  },
  [diagramTypes.code]: {
    cn: '状态码',
    en: 'Status code'
  },
  [diagramTypes.hitratio]: {
    cn: '命中率',
    en: 'Hit ratio'
  },
  [diagramTypes.uv]: {
    cn: '独立 IP 统计',
    en: 'Indepentent IP'
  }
}

export enum SearchType {
  Flow = 'flow', // 用量统计 - 流量
  Bandwidth = 'bandwidth', // 用量统计 - 带宽
  NightBandwidth = 'nightbandwidth', // 用量统计 - 夜间带宽
  Reqcount = 'reqcount', // 用量统计 - 请求数

  Access = 'access', // 日志分析 - 地区运营商
  Code = 'code', // 日志分析 - 状态码
  Hit = 'hit', // 日志分析 - 命中率
  Uv = 'uv', // 日志分析 - 独立 IP
  Speed = 'speed', // 日志分析 - 下载速度
  VideoSlim = 'videoslim', // 日志分析 - 视频瘦身
  Top = 'top' // 日志分析 - TOP IP & URL
}

export const searchTypeTextMap = {
  [SearchType.Flow]: {
    cn: '流量',
    en: 'Traffic'
  },
  [SearchType.Bandwidth]: {
    cn: '带宽',
    en: 'Bandwidth'
  },
  [SearchType.NightBandwidth]: {
    cn: '夜间带宽',
    en: 'Night bandwidth'
  },
  [SearchType.Reqcount]: {
    cn: '请求数',
    en: 'Request count'
  },
  [SearchType.Access]: {
    cn: '地区运营商',
    en: 'Region&ISP'
  },
  [SearchType.Code]: {
    cn: '状态码',
    en: 'Status code'
  },
  [SearchType.Hit]: {
    cn: '命中率',
    en: 'Hit ratio'
  },
  [SearchType.Uv]: {
    cn: '独立 IP 统计',
    en: 'Independent IP'
  },
  [SearchType.Speed]: {
    cn: '下载速度',
    en: 'Download speed'
  },
  [SearchType.VideoSlim]: {
    cn: '视频瘦身',
    en: 'Video slim'
  },
  [SearchType.Top]: {
    cn: 'TOP URL / IP',
    en: 'TOP URL / IP'
  }
}

export const freqList = [
  {
    label: {
      cn: '5分钟',
      en: 'Five minutes'
    },
    value: '5min' as Freq
  },
  {
    label: {
      cn: '1小时',
      en: 'One hour'
    },
    value: '1hour' as Freq
  },
  {
    label: {
      cn: '1天',
      en: 'One day'
    },
    value: '1day' as Freq
  }
]

/** 单位为毫秒 */
export const trafficFreqTimesMap = {
  '5min': 5 * 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 3600 * 1000
}

export const nightBandwidthStartHour = 1
export const nightBandwidthEndHour = 8

// 夜间带宽版本2，从 2019-11-01 开始时间改为1-9点
export const nightBandwidth2Date = '2019-11-01'
export const nightBandwidth2StartHour = 1
export const nightBandwidth2EndHour = 9

export const leisureStartHour = 0
export const leisureEndHour = 9
export const daytimeStartHour = 9
export const daytimeEndHour = 18

export const flowLeisureSummaryTitle = '每日 0:00 - 9:00 时段的总流量'
export const reqcountLeisureSummaryTitle = '每日 0:00 - 9:00 时段的访问总次数'
export const flowDaytimeSummaryTitle = '每日 9:00 - 18:00 时段的总流量'
export const reqcountDaytimeSummaryTitle = '每日 9:00 - 18:00 时段的访问总次数'

// 流量方向
export enum FlowDirection {
  Down = 'down',
  Up = 'up'
}

export const flowDirectionTextMap = {
  [FlowDirection.Down]: '下行',
  [FlowDirection.Up]: '上行'
}

const flowDirectionValues = valuesOfEnum(FlowDirection)
export const flowDirectionList = flowDirectionValues.map(it => ({
  label: flowDirectionTextMap[it],
  value: it
}))

export const trafficDateFormat = 'YYYYMMDDHHmmss'

export const trafficSimpleDateFormat = 'YYYY-MM-DD'

/** 按域名堆叠的数量限制 */
export const maxStackByDomainCount = 15

export const logAnalysisDateFormat = 'YYYY-MM-DD-00-00'
