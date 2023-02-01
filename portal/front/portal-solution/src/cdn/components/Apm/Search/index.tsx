
import React from 'react'
import { observer } from 'mobx-react'
import { Moment } from 'moment'

import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Radio from 'react-icecream/lib/radio'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { useLocalStore } from 'portal-base/common/utils/store'

import { freqList } from 'cdn/constants/apm'

import { Freq } from 'cdn/apis/apm'
import DateRangePicker from './DateRangePicker'
import DomainSelector from './DomainSelector'
import RegionSelector from './RegionSelector'
import IspSelector from './IspSelector'
import LocalStore, { ApmSearchProps } from './store'

import './style.less'

interface ISearchOption {
  label?: string | React.ReactElement
  input: any
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

interface PropsWithDeps extends ApmSearchProps {
  store: LocalStore
}

@observer
class ApmSearchInner extends React.Component<PropsWithDeps> {
  confirmSearch() {
    this.props.onSubmit(this.props.store.optionsForQuery)
  }

  render() {
    const { store } = this.props

    const domainLabel = (
      <span>
        域名
        <Tooltip title="目前仅支持配置在图片小文件、下载分发、点播场景下的非测试域名的监测，暂不支持动态加速场景。" overlayClassName="info-tip">
          <Icon type="info-circle" className="info-icon info-icon-domain" />
        </Tooltip>
      </span>
    )

    const domainOption = (
      <div className="search-control">
        <SearchOption label={domainLabel}
          input={(
            <DomainSelector
              value={store.domain}
              onChange={domain => store.updateDomain(domain)}
            />
          )} />
      </div>
    )

    const regionOption = (
      <div className="search-control">
        <SearchOption label="地区"
          input={(
            <RegionSelector
              value={store.regions}
              onChange={(regions: string[]) => store.updateRegions(regions)}
            />
          )} />
      </div>
    )

    const ispOption = (
      <div className="search-control">
        <SearchOption label="运营商"
          input={(
            <IspSelector
              value={store.isps}
              onChange={(isps: string[]) => store.updateIsps(isps)}
            />
          )} />
      </div>
    )

    const freqOption = (
      <div className="search-control">
        <SearchOption label="时间粒度"
          input={(
            <Radio.Group
              value={store.freq}
              defaultValue={store.freq}
              onChange={e => store.updateFreq(e.target.value as Freq)}
            >
              {
                freqList.map(
                  freq => <Radio.Button key={freq.value} value={freq.value}>{freq.label}</Radio.Button>
                )
              }
            </Radio.Group>
          )} />
      </div>
    )

    const timeRangeOption = (
      <div className="search-control">
        <SearchOption label="时间范围"
          input={(
            <DateRangePicker
              value={[store.startDate, store.endDate]}
              onChange={(dates: [Moment, Moment]) => {
                store.updateStartDate(dates[0])
                store.updateEndDate(dates[1])
              }} />
          )} />
      </div>
    )

    const optionErrorTip = (
      store.searchOptionsError
      ? <div className="range-picker-error">{store.searchOptionsError}</div>
      : null
    )

    const submitOption = (
      <div className="search-control search-submit">
        <SearchOption input={(
          <Button type="primary"
            disabled={!store.isValid}
            onClick={() => this.confirmSearch()}
          >确认查询</Button>
        )} />
        {/* 显示错误信息 */}
        { optionErrorTip }
      </div>
    )

    return (
      <>
        <div className="apm-search-wrapper">
          <Spin spinning={store.isLoading}>
            <div className="search-line">
              {domainOption}{timeRangeOption}{submitOption}
            </div>
            <div className="search-line">
              {regionOption}{ispOption}{freqOption}
            </div>
          </Spin>
        </div>
      </>
    )
  }
}

export default function ApmSearch(props: ApmSearchProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <ApmSearchInner {...props} store={store} />
  )
}
