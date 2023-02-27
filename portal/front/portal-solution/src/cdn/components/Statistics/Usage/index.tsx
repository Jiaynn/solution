
import React from 'react'
import { AreaChart } from 'react-icecream-charts'
import autobind from 'autobind-decorator'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import cx from 'classnames'

import Button from 'react-icecream/lib/button'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Spin from 'react-icecream/lib/spin'
import Radio from 'react-icecream/lib/radio'
import { Inject, InjectFunc, Provides, useInjection } from 'qn-fe-core/di'
import { Iamed } from 'portal-base/user/iam'
import { UserInfoStore } from 'portal-base/user/account'
import { Featured, FeatureConfigStore } from 'portal-base/user/feature-config'
import { useLocalStore } from 'portal-base/common/utils/store'
import { I18nStore } from 'portal-base/common/i18n'

import { humanizeUsageSummaryName } from 'cdn/transforms/statistics'

import { humanizeTraffic, humanizeBandwidth, humanizeReqcount } from 'cdn/transforms/unit'

import IamInfo from 'cdn/constants/iam-info'
import { isOEM, oemConfig } from 'cdn/constants/env'
import {
  flowSummaryNames, reqcountSummaryNames, flowLeisureSummaryTitle, reqcountLeisureSummaryTitle,
  reqcountDaytimeSummaryTitle, flowDaytimeSummaryTitle, SearchType, maxStackByDomainCount
} from 'cdn/constants/statistics'
import AbilityConfig from 'cdn/constants/ability-config'

import OEMDisabled from 'cdn/components/common/OEMDisabled'

import SummaryItem from '../SummaryItem'
import { BandwidthDataBase, FlowDataBase } from './stores/base'
import { Enabled302Bandwidth, Enabled302Flow } from './stores/traffic302'
import { Disabled302Bandwidth, Disabled302Flow } from './stores/traffic'
import LocalStore, { NightBandwidthData, ReqCountData, IStatisticsUsageProps } from './stores'
import * as messages from './messages'

import './style.less'
import ImageSolutionStore from 'store/imageSolution'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group

type PropsWithDeps = IStatisticsUsageProps & {
  store: LocalStore
  userInfoStore: UserInfoStore
  featureConfigStore: FeatureConfigStore
  iamInfo: IamInfo
  i18n: I18nStore
} & {
  inject:InjectFunc
}

@observer
class StatisticsUsageInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)

  }

  imageSolutionStore = this.props.inject(ImageSolutionStore)
  @computed get hasData() {
    return this.imageSolutionStore.hasBucket && this.props.store.usageSearchOptions.domains.length > 0
  }

  @autobind getFlowSummary() {
    const { store, i18n } = this.props
    if (!store.flowSummary) {
      return null
    }
    const { total, average, totalInLeisure, totalInDaytime } = store.flowSummary
    const leisureAndDaytimeSummary = store.usageSearchOptions.freq !== '1day'
    && store.stackBy === ''
    && (
      <>
        <SummaryItem
          title={<>
            {i18n.t(humanizeUsageSummaryName(flowSummaryNames.totalInLeisure))}
            <Tooltip title={flowLeisureSummaryTitle} overlayClassName="info-tip">
              <Icon type="question-circle" className="info-icon" />
            </Tooltip>
          </>}
          value={totalInLeisure != null ? humanizeTraffic(totalInLeisure) : null}
          isLoading={store.isLoadingTimeline}
        />
        <SummaryItem
          title={<>
            {i18n.t(humanizeUsageSummaryName(flowSummaryNames.totalInDaytime))}
            <Tooltip title={flowDaytimeSummaryTitle} overlayClassName="info-tip">
              <Icon type="question-circle" className="info-icon" />
            </Tooltip>
          </>}
          value={totalInDaytime != null ? humanizeTraffic(totalInDaytime) : null}
          isLoading={store.isLoadingTimeline}
        />
      </>
    )

    return (
      <>
        <SummaryItem
          title={i18n.t(humanizeUsageSummaryName(flowSummaryNames.total))}
          value={total != null ? humanizeTraffic(total) : null}
          isLoading={store.isLoadingTimeline}
        />
        <SummaryItem
          title={i18n.t(humanizeUsageSummaryName(flowSummaryNames.average))}
          value={average != null ? humanizeTraffic(average) : null}
          isLoading={store.isLoadingTimeline}
        />
        <OEMDisabled>
          {leisureAndDaytimeSummary}
        </OEMDisabled>
      </>
    )
  }

  @autobind getBandwidthSummary() {
    const { store, i18n } = this.props
    if (!store.bandwidthSummary) {
      return null
    }

    const { peak, peak95, peakAverage, peak95Average } = store.bandwidthSummary
    return (
      <>
        <Featured key="peak" feature="FUSION.FUSION_STAT_PEAK">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peak'))}
            value={peak.value != null ? humanizeBandwidth(peak.value) : null}
            time={peak.time}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
        <Featured key="peak95" feature="FUSION.FUSION_STAT_PEAK95">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peak95'))}
            value={peak95?.value != null ? humanizeBandwidth(peak95.value) : null}
            time={peak95?.time}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
        {
          !(isOEM && this.props.userInfoStore.parent_uid !== 0 && oemConfig.hideSubAccountStatsUsagePeakAverage) && (
            <Featured key="peakAverage" feature="FUSION.FUSION_STAT_PEAK_AVERAGE">
              <SummaryItem
                title={i18n.t(humanizeUsageSummaryName('peakAverage'))}
                value={peakAverage != null ? humanizeBandwidth(peakAverage) : null}
                isLoading={store.isLoadingTimeline}
              />
            </Featured>
          )
        }
        {
          !(isOEM && this.props.userInfoStore.parent_uid !== 0 && oemConfig.hideSubAccountStatsUsagePeak95Average) && (
            <Featured key="peak95Average" feature="FUSION.FUSION_STAT_PEAK_95_AVERAGE">
              <SummaryItem
                title={i18n.t(humanizeUsageSummaryName('peak95Average'))}
                value={peak95Average != null ? humanizeBandwidth(peak95Average) : null}
                isLoading={store.isLoadingTimeline}
              />
            </Featured>
          )
        }
      </>
    )
  }

  @autobind getReqcountSummary() {
    const { store, i18n } = this.props
    if (!store.reqcountSummary) {
      return null
    }

    const { total, average, totalInLeisure, totalInDaytime } = store.reqcountSummary
    const leisureAndDaytimeSummary = store.usageSearchOptions.freq !== '1day' && (
      <>
        <SummaryItem
          title={<>
            {i18n.t(humanizeUsageSummaryName(reqcountSummaryNames.totalInLeisure))}
            <Tooltip title={reqcountLeisureSummaryTitle} overlayClassName="info-tip">
              <Icon type="question-circle" className="info-icon" />
            </Tooltip>
          </>}
          value={totalInLeisure != null ? i18n.t(humanizeReqcount(totalInLeisure)) : null}
          isLoading={store.isLoadingTimeline}
        />
        <SummaryItem
          title={<>
            {i18n.t(humanizeUsageSummaryName(reqcountSummaryNames.totalInDaytime))}
            <Tooltip title={reqcountDaytimeSummaryTitle} overlayClassName="info-tip">
              <Icon type="question-circle" className="info-icon" />
            </Tooltip>
          </>}
          value={totalInDaytime != null ? i18n.t(humanizeReqcount(totalInDaytime)) : null}
          isLoading={store.isLoadingTimeline}
        />
      </>
    )

    return (
      <>
        <SummaryItem
          title={i18n.t(humanizeUsageSummaryName(reqcountSummaryNames.total))}
          value={total != null ? i18n.t(humanizeReqcount(total)) : null}
          isLoading={store.isLoadingTimeline}
        />
        <SummaryItem
          title={i18n.t(humanizeUsageSummaryName(reqcountSummaryNames.average))}
          value={average != null ? i18n.t(humanizeReqcount(average)) : null}
          isLoading={store.isLoadingTimeline}
        />
        <OEMDisabled>
          {leisureAndDaytimeSummary}
        </OEMDisabled>
      </>
    )
  }

  @autobind getNightBandwidthSummary() {
    const { store, i18n } = this.props
    if (!store.nightbandwidthSummary) {
      return null
    }

    const { peak, peak95, peakAverage, peak95Average } = store.nightbandwidthSummary
    return (
      <>
        <Featured key="peak" feature="FUSION.FUSION_STAT_PEAK">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peak'))}
            value={peak.value != null ? humanizeBandwidth(peak.value) : null}
            time={peak.time}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
        <Featured key="peak95" feature="FUSION.FUSION_STAT_PEAK95">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peak95'))}
            value={peak95?.value != null ? humanizeBandwidth(peak95.value) : null}
            time={peak95?.time}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
        <Featured key="peakAverage" feature="FUSION.FUSION_STAT_PEAK_AVERAGE">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peakAverage'))}
            value={peakAverage != null ? humanizeBandwidth(peakAverage) : null}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
        <Featured key="peak95Average" feature="FUSION.FUSION_STAT_PEAK_95_AVERAGE">
          <SummaryItem
            title={i18n.t(humanizeUsageSummaryName('peak95Average'))}
            value={peak95Average != null ? humanizeBandwidth(peak95Average) : null}
            isLoading={store.isLoadingTimeline}
          />
        </Featured>
      </>
    )
  }

  @computed get chartSummary() {
    if (this.hasData) {
      const { store } = this.props
      switch (store.currentType) {
        case SearchType.Flow:
          return this.getFlowSummary()
        case SearchType.Bandwidth:
          return this.getBandwidthSummary()
        case SearchType.Reqcount:
          return this.getReqcountSummary()
        case SearchType.NightBandwidth:
          return this.getNightBandwidthSummary()
        default:
      }
    }
    return null
  }

  render() {
    const { store, type, i18n } = this.props

    const searchTypeRadioGroup = (type === SearchType.Bandwidth || type === SearchType.NightBandwidth)
      && !this.props.featureConfigStore.isDisabled('FUSION.FUSION_NIGHT_BANDWIDTH')
      && (
        <OEMDisabled>
          <RadioGroup
            value={store.currentType}
            className="usage-type-radio-group"
            onChange={e => store.updateCurrentType(e.target.value)}
          >
            <RadioButton value={SearchType.Bandwidth}>带宽</RadioButton>
            <RadioButton value={SearchType.NightBandwidth}>夜间带宽</RadioButton>
          </RadioGroup>
        </OEMDisabled>
      )

    const groupTypeRadioGroup = (
      <RadioGroup
        value={store.stackBy}
        onChange={e => store.updateStackBy(e.target.value)}
        disabled={!store.isOptionsValid}
      >
        <RadioButton value="">{i18n.t(messages.usage)}</RadioButton>
        <Tooltip placement="bottom"
          title={store.isOverDomainLimit ? `域名用量对比暂不支持 ${maxStackByDomainCount} 个以上域名，建议选择全量域名进行查询` : ''}
        >
          <RadioButton value="domain" disabled={store.isOverDomainLimit}>{i18n.t(messages.domainStack)}</RadioButton>
        </Tooltip>
        <RadioButton value="geoCover">{i18n.t(messages.regionStack)}</RadioButton>
      </RadioGroup>
    )

    return (
      <div className="statistics-content-wrapper">
        <Iamed actions={[this.props.iamInfo.iamActions.GetBandwidthAndFlux]}>
          <Spin spinning={store.isLoadingTimeline}>
            <div className="usage-summary-container">
              <div className={cx('usage-summary-wrapper', { [`is-${type}`]: true })}>
                {type !== SearchType.Reqcount && <>{searchTypeRadioGroup}{groupTypeRadioGroup}</>}
                <div className="usage-summary">{this.chartSummary}</div>
              </div>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  icon="download"
                  disabled={!store.isOptionsValid || store.isTimelineDataEmpty}
                  onClick={store.exportCSV}
                >
                  {i18n.t(messages.exportCsv)}
                </Button>
              </Featured>
            </div>
            <div className="chart">
              <AreaChart
                series={this.hasData ? store.seriesData : []}
                chartOptions={store.chartOptions}
                options={{ stacking: 'normal' }}
              />
            </div>
          </Spin>
        </Iamed>
      </div>
    )
  }
}

export default function StatisticsUsage(props: IStatisticsUsageProps) {
  const abilityConfig = useInjection(AbilityConfig)
  const statisticsProvides: Provides = [NightBandwidthData, ReqCountData]
  if (abilityConfig.dynamic302Enabled) {
    statisticsProvides.push(
      { identifier: FlowDataBase, constr: Enabled302Flow },
      { identifier: BandwidthDataBase, constr: Enabled302Bandwidth }
    )
  } else {
    statisticsProvides.push(
      { identifier: FlowDataBase, constr: Disabled302Flow },
      { identifier: BandwidthDataBase, constr: Disabled302Bandwidth }
    )
  }
  const store = useLocalStore(LocalStore, props, statisticsProvides)
  const userInfoStore = useInjection(UserInfoStore)
  const featureConfigStore = useInjection(FeatureConfigStore)
  const iamInfo = useInjection(IamInfo)
  const i18n = useInjection(I18nStore)

  return (
    <Inject render={({ inject }) => <StatisticsUsageInner
      inject={inject}
      {...props}
      store={store}
      i18n={i18n}
      userInfoStore={userInfoStore}
      featureConfigStore={featureConfigStore}
      iamInfo={iamInfo}
    />} />
  )
}
