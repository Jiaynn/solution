/**
 * @file statistics page config
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { I18nStore } from 'portal-base/common/i18n'

import { booleanPredicate } from 'cdn/utils'

import { isQiniu } from 'cdn/constants/env'
import { iamDontExistsAction } from 'cdn/constants/iam'
import { SearchType, searchTypeTextMap } from 'cdn/constants/statistics'
import IamInfo from 'cdn/constants/iam-info'

import StatisticsUsage from './Usage'
import StatisticsAccess from './Access'
import StatisticsCode from './Code'
import StatisticsHitRatio from './HitRatio'
import StatisticsUv from './Uv'
import StatisticsSpeed from './Speed'
import StatisticsVideoSlim from './VideoSlim'
import StatisticsTop from './Top'

export type PageConfig = {
  type: SearchType
  text: string
  iamActions?: string[]
  featureConfigKey?: string
  component: React.ComponentType<any>
}

// 用量统计
export function getUsagePageConfig(iamInfo: IamInfo, i18n: I18nStore): PageConfig[] {
  const { iamActions } = iamInfo

  return [
    {
      type: SearchType.Flow,
      text: i18n.t(searchTypeTextMap[SearchType.Flow]),
      iamActions: [iamActions.GetBandwidthAndFlux],
      component: StatisticsUsage
    },
    {
      type: SearchType.Bandwidth,
      text: i18n.t(searchTypeTextMap[SearchType.Bandwidth]),
      iamActions: [iamActions.GetBandwidthAndFlux],
      component: StatisticsUsage
    },
    {
      type: SearchType.Reqcount,
      text: i18n.t(searchTypeTextMap[SearchType.Reqcount]),
      iamActions: [iamActions.GetBandwidthAndFlux],
      component: StatisticsUsage
    }
  ]
}

// 日志分析
export function getCdnLogPageConfig(iamInfo: IamInfo, i18n: I18nStore): PageConfig[] {
  const iamActions = iamInfo.mustCdnIamActions()

  return [
    {
      type: SearchType.Access,
      text: i18n.t(searchTypeTextMap[SearchType.Access]),
      iamActions: [iamActions.GetReqCount, iamActions.GetTop],
      component: StatisticsAccess
    },
    {
      type: SearchType.Code,
      text: i18n.t(searchTypeTextMap[SearchType.Code]),
      iamActions: [iamActions.GetStateCode],
      component: StatisticsCode
    },
    {
      type: SearchType.Hit,
      text: i18n.t(searchTypeTextMap[SearchType.Hit]),
      iamActions: [iamActions.GetHitRate],
      component: StatisticsHitRatio
    },
    {
      type: SearchType.Top,
      text: i18n.t(searchTypeTextMap[SearchType.Top]),
      iamActions: [iamActions.GetTop],
      component: StatisticsTop
    },
    {
      type: SearchType.Uv,
      text: i18n.t(searchTypeTextMap[SearchType.Uv]),
      iamActions: [iamActions.GetUV],
      component: StatisticsUv
    },
    isQiniu && {
      type: SearchType.Speed,
      text: i18n.t(searchTypeTextMap[SearchType.Speed]),
      iamActions: [iamActions.GetSpeed],
      featureConfigKey: 'FUSION.FUSION_SPEED_CHART',
      component: StatisticsSpeed
    },
    isQiniu && {
      type: SearchType.VideoSlim,
      text: i18n.t(searchTypeTextMap[SearchType.VideoSlim]),
      iamActions: [iamDontExistsAction],
      featureConfigKey: 'FUSION.FUSION_VIDEO_SLIM',
      component: StatisticsVideoSlim
    }
  ].filter(booleanPredicate)
}

export function getDcdnLogPageConfig(iamInfo: IamInfo, i18n: I18nStore): PageConfig[] {
  const iamActions = iamInfo.mustDcdnIamActions()

  return [
    {
      type: SearchType.Access,
      text: i18n.t(searchTypeTextMap[SearchType.Access]),
      iamActions: [iamActions.GetReqCount, iamActions.GetTop],
      component: StatisticsAccess
    },
    {
      type: SearchType.Code,
      text: i18n.t(searchTypeTextMap[SearchType.Code]),
      iamActions: [iamActions.GetStateCode],
      component: StatisticsCode
    },
    {
      type: SearchType.Top,
      text: i18n.t(searchTypeTextMap[SearchType.Top]),
      iamActions: [iamActions.GetTop],
      component: StatisticsTop
    },
    {
      type: SearchType.Uv,
      text: i18n.t(searchTypeTextMap[SearchType.Uv]),
      iamActions: [iamActions.GetUV],
      component: StatisticsUv
    }
  ]
}
