
import React from 'react'
import { observer } from 'mobx-react'
import { Moment } from 'moment'

import Select from 'react-icecream/lib/select'
import Button from 'react-icecream/lib/button'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'portal-base/common/utils/store'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { I18nStore } from 'portal-base/common/i18n'

import AbilityConfig from 'cdn/constants/ability-config'
import { isQiniu } from 'cdn/constants/env'
import { SearchType, freqList, flowDirectionList, FlowDirection } from 'cdn/constants/statistics'

import HelpLink from 'cdn/components/common/HelpLink'
import OEMDisabled from 'cdn/components/common/OEMDisabled'

import DomainSelector from 'cdn/components/common/DomainSelector'

import { Freq } from 'cdn/apis/statistics'

import DateRangePicker from './DateRangePicker'
import RegionSelector from './RegionSelector'
import TrafficRegionSelector from './TrafficRegionSelector'
import IspSelector from './IspSelector'
import * as messages from './messages'
import LocalStore, { ISearchOptionProps } from './store'

import './style.less'

const Option = Select.Option

interface ISearchOption {
  label?: React.ReactNode
  input: React.ReactNode
}

function SearchOption(props: ISearchOption) {
  const searchOptionLabel = props.label ? <div className="search-option-label">{ props.label }:</div> : null
  return (
    <div className="search-option">
      { searchOptionLabel }
      <div className="search-option-item">{ props.input }</div>
    </div>
  )
}

export interface Props {
  type: SearchType
  options: ISearchOptionProps
  onSubmit: (options: ISearchOptionProps) => void
}

export default observer(function StatisticsSearchWrapper(props: Props) {
  const store = useLocalStore(LocalStore, props)
  const featureConfig = useInjection(FeatureConfigStore)
  const abilityConfig = useInjection(AbilityConfig)
  const i18n = useInjection(I18nStore)

  return (
    <StatisticsSearch
      {...props}
      i18n={i18n}
      featureConfig={featureConfig}
      abilityConfig={abilityConfig}
      store={store}
    />
  )
})

type PropsWithDeps = Props & {
  i18n: I18nStore
  store: LocalStore
  featureConfig: FeatureConfigStore
  abilityConfig: AbilityConfig
}

const analysisDisableDays = 180

@observer
class StatisticsSearch extends React.Component<PropsWithDeps> {
  confirmSearch() {
    this.props.onSubmit(this.props.store.optionsForSearch)
  }

  render() {
    const { store, i18n } = this.props
    const searchType = store.searchFor

    const domainOption = (
      <div className="search-control">
        <SearchOption
          input={(
            <DomainSelector
              withTags
              state={store.state}
              queryParams={store.queryParams}
              showFullCheck={store.shouldShowFullCheck}
            />
          )}
        />
      </div>
    )

    const regionOption = (
      [SearchType.Speed, SearchType.Top].indexOf(searchType) >= 0
      ? (
        <div className="search-control">
          <SearchOption label={i18n.t(messages.region)}
            input={(
              <RegionSelector
                value={store.regions}
                onChange={(regions: string[]) => store.updateRegions(regions)}
              />
            )} />
        </div>
      )
      : null
    )

    const trafficRegionText = i18n.t(messages.trafficRegion)

    const trafficRegionLabel = (
      <span>
        {trafficRegionText}
        <Tooltip
          title={
            <div>
              该区域为七牛 CDN 计费区域，不同区域的定义及流量价格参考：
              <HelpLink href="https://www.qiniu.com/prices/qcdn">CDN 价格</HelpLink>
            </div>
          }
          overlayClassName="info-tip"
        >
          <Icon type="question-circle" className="info-icon" />
        </Tooltip>
      </span>
    )

    const trafficRegionOptions = (
      [SearchType.Flow, SearchType.Bandwidth].indexOf(searchType) >= 0
      ? (
        <div className="search-control">
          <SearchOption label={isQiniu ? trafficRegionLabel : trafficRegionText}
            input={(
              <TrafficRegionSelector
                value={store.trafficRegions}
                onChange={(regions: string[]) => store.updateTrafficRegions(regions)}
              />
            )} />
        </div>
      )
      : null
    )

    const ispOption = (
      [SearchType.Speed].indexOf(searchType) >= 0
      ? (
        <div className="search-control">
          <SearchOption label={i18n.t(messages.isp)}
            input={(
              <IspSelector
                value={store.isp}
                onChange={(isp: string) => store.updateIsp(isp)}
              />
            )} />
        </div>
      )
      : null
    )

    const freqOption = (
      [SearchType.Access, SearchType.VideoSlim, SearchType.Uv, SearchType.Top].indexOf(searchType) === -1
      ? (
        <div className="search-control">
          <SearchOption label={i18n.t(messages.granularity)}
            input={(
              <Select
                value={store.freq}
                defaultValue="1hour"
                style={{ width: 200 }}
                onChange={(freq: Freq) => store.updateFreq(freq)}
              >
                {
                  freqList.map(
                    freq => <Option key={freq.value} value={freq.value}>{i18n.t(freq.label)}</Option>
                  )
                }
              </Select>
            )} />
        </div>
      )
      : null
    )

    const flowDirectionOption = (
      [SearchType.Flow, SearchType.Bandwidth].indexOf(searchType) !== -1
        && !this.props.featureConfig.isDisabled('FUSION.FUSION_FLOW_DIRECTION')
        && !this.props.abilityConfig.hideFlowDirection
      ? (
        <OEMDisabled>
          <div className="search-control">
            <SearchOption label="流量方向"
              input={(
                <Select
                  value={store.flowDirection}
                  style={{ width: 240 }}
                  defaultValue={FlowDirection.Down}
                  onChange={store.updateFlowDirection}
                >
                  {
                    flowDirectionList.map(
                      it => <Option key={it.value} value={it.value}>{it.label}</Option>
                    )
                  }
                </Select>
              )} />
          </div>
        </OEMDisabled>
      )
      : null
    )

    const timeRangeOption = (
      <div className="search-control">
        <SearchOption label={i18n.t(messages.dateRange)}
          input={(
            <DateRangePicker
              value={store.timeRange}
              disableDays={store.isAnalysisSearch ? analysisDisableDays : undefined}
              onChange={(dates: [Moment, Moment]) => store.updateTimeRange(dates)} />
          )} />
      </div>
    )

    const submitOption = (
      // FIXME: searchOptionsError 类型
      <Tooltip title={store.searchOptionsError != null ? i18n.t(store.searchOptionsError) : undefined} overlayClassName="info-tip">
        <div className="search-control search-submit">
          <SearchOption input={(
            <Button type="primary"
              disabled={!store.isValid}
              onClick={() => this.confirmSearch()}
            >{i18n.t(messages.search)}</Button>
          )} />
        </div>
      </Tooltip>
    )

    return (
      <div className="statistics-search-wrapper">
        <div className="filter-items">
          {domainOption}
          {timeRangeOption}
          {freqOption}
          {regionOption}
          {trafficRegionOptions}
          {ispOption}
          {flowDirectionOption}
        </div>
        <div className="filter-button">
          {submitOption}
        </div>
      </div>
    )
  }
}
