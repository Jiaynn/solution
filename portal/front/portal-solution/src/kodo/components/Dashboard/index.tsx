/**
 * @file component Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { keyBy } from 'lodash/fp'
import { computed, reaction, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Select, Tabs, DatePicker } from 'react-icecream/lib'
import PopupContainer from 'react-icecream/lib/popup-container'
import { useLocalStore } from 'qn-fe-core/local-store'
import Disposable from 'qn-fe-core/disposable'
import { InjectFunc, Inject } from 'qn-fe-core/di'

import { Route, RouterStore, Switch } from 'portal-base/common/router'

import { isTransferAvailable } from 'kodo/transforms/transfer'

import { ConfigStore } from 'kodo/stores/config'

import { getDashboardPath } from 'kodo/routes/dashboard'

import { granularityDateRangeLimitTextMap } from 'kodo/constants/date-time'
import { regionAll } from 'kodo/constants/region'
import { storageTypeTextMap, FlowSrcType } from 'kodo/constants/statistics'
import { ITabConfig, reportTextMap, ReportType } from 'kodo/constants/dashboard'

import { NotFoundRedirect } from 'kodo/components/common/NotFoundRedirect'
import OverviewDateRangeTab from 'kodo/components/common/Tabs/OverviewDateRangeTab'
import StorageReport from './StorageReport'
import FlowReport from './Flow/FlowReport'
import BandwidthReport from './Flow/BandwidthReport'
import APIReport from './APIReport'
import { StateStore, IQueryOptions } from './store'
import styles from './style.m.less'
import { kodoOverviewBasename } from 'components/image/Overview/overviewRouterConfig'

const { Option } = Select
const { TabPane } = Tabs

export interface IChildComponentProps {
  queryOptions: IQueryOptions
}

export interface IProps {
  type: string
}

interface DiDeps {
  store: StateStore
  inject: InjectFunc
}

@observer
class InternalDashboard extends React.Component<IProps & DiDeps> {
  disposable = new Disposable()
  configStore = this.props.inject(ConfigStore)

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  handleTabChange(key: ReportType) {
    // gotoDashboardPage(this.props.inject, key)
    const routerStore = this.props.inject(RouterStore)
    routerStore.push(`${kodoOverviewBasename}/${key}`)
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get tabsConfig(): ITabConfig[] {
    return [
      {
        name: reportTextMap.storage,
        key: ReportType.Storage,
        path: getDashboardPath(this.props.inject, ReportType.Storage)
      },
      {
        name: reportTextMap.flow,
        key: ReportType.Flow,
        path: getDashboardPath(this.props.inject, ReportType.Flow)
      },
      {
        name: reportTextMap.bandwidth,
        key: ReportType.Bandwidth,
        path: getDashboardPath(this.props.inject, ReportType.Bandwidth)
      },
      {
        name: reportTextMap.api,
        key: ReportType.API,
        path: getDashboardPath(this.props.inject, ReportType.API)
      }
    ]
  }

  @computed get isStorageTypeSelectorVisible() {
    /* 跨区域同步标签不显示存储类型选择 */
    if (this.props.type === ReportType.Transfer) { return false }

    /* 流量、带宽标签下流量类型非外网流入时才显示 */
    if ([ReportType.Flow, ReportType.Bandwidth].includes(this.props.type as ReportType)) {
      return this.props.store.currentFlowType !== FlowSrcType.ExternalInflow
    }

    return true
  }

  @computed get routesView() {
    const {
      bucketNames, currentFlowType, queryOptions,
      updateCurrentFlowType, updateCurrentGranularity
    } = this.props.store

    const { flow, bandwidth, storage, api } = keyBy<ITabConfig>('key')(this.tabsConfig)

    return (
      <Switch>
        <Route title="空间流量" path={`${kodoOverviewBasename}/${flow.key}`}>
          <Inject render={({ inject }) => (
            <FlowReport
              inject={inject}
              queryOptions={queryOptions}
              flowType={currentFlowType}
              bucketNumber={bucketNames.length}
              onFlowTypeChange={updateCurrentFlowType}
              onGranularityChanged={updateCurrentGranularity}
            />
          )} />

        </Route>
        <Route title="空间带宽" path={`${kodoOverviewBasename}/${bandwidth.key}`}>
          <Inject render={({ inject }) => (
            <BandwidthReport
              inject={inject}
              queryOptions={queryOptions}
              flowType={currentFlowType}
              bucketNumber={bucketNames.length}
              onFlowTypeChange={updateCurrentFlowType}
              onGranularityChanged={updateCurrentGranularity}
            />
          )} />

        </Route>
        <Route title="存储" path={`${kodoOverviewBasename}/${storage.key}`}>
          <StorageReport queryOptions={this.props.store.queryOptions} />
        </Route>
        <Route title="API 请求" path={`${kodoOverviewBasename}/${api.key}`}>
          <APIReport queryOptions={this.props.store.queryOptions} />
        </Route>
        <Route exact path="*">
          <NotFoundRedirect />
        </Route>
      </Switch>
    )
  }

  @computed get inputControlView() {
    const {
      regions, currentRegion, bucketNames, updateCurrentBucket,
      currentBucket, ftype, updateCurrentRegion, updateFtype
    } = this.props.store

    return (
      <div className={styles.headerBox}>
        <div>
          {
            this.isStorageTypeSelectorVisible && (<>
              <label className={styles.title}>存储类型：</label>
              <Select
                value={ftype}
                onChange={updateFtype}
                className={styles.ftypeSelect}
              >
                {this.configStore.supportedStorageTypes.map(type => (
                  <Option key={type} value={type}>
                    {storageTypeTextMap[type]}
                  </Option>
                ))}
              </Select>
            </>)
          }
          <label className={styles.title}>区域：</label>
          <Select
            className={styles.regionSelect}
            value={currentRegion}
            onChange={updateCurrentRegion}
            disabled={this.props.type === ReportType.Transfer}
          >
            {
              regions.filter(i => !i.invisible).map(region => (
                <Option value={region.symbol} key={region.symbol}>{region.name}</Option>
              ))
            }
          </Select>
          <label className={styles.title}>空间：</label>
          <Select
            showSearch
            className={styles.bucketSelect}
            value={currentBucket}
            onChange={updateCurrentBucket}
            disabled={this.props.type === ReportType.Transfer || bucketNames.length === 0}
          >
            {/* {isAllowAllBucket ? (<Option value={bucketAll} key={bucketAll}>{bucketAll}</Option>) : null} */}
            {
              bucketNames.map(bucket => (
                <Option value={bucket} key={bucket}>{bucket}</Option>
              ))
            }
          </Select>
        </div>
      </div>
    )
  }

  @computed
  get filteredDashboardTabs() {
    return this.tabsConfig.filter(({ key }) => {
      if (key === ReportType.Transfer) {
        return isTransferAvailable(
          this.props.inject,
          () => this.props.store.isAllowAllBucket
        )
      }
      return true
    })
  }

  @computed get tabView() {
    const {
      dateRange, currentGranularity, handleCalendarChange, isDisabledDate, overviewPredefinedTime,
      handlePredefinedTimeChange, updateDateRange
    } = this.props.store

    return (
      <div className={styles.tabBox}>
        <Tabs activeKey={this.props.type} onChange={this.handleTabChange}>
          {this.filteredDashboardTabs.map(tab => <TabPane tab={tab.name} key={tab.key} />)}
        </Tabs>
        <div className={styles.dateBox}>
          <OverviewDateRangeTab value={overviewPredefinedTime} onChange={handlePredefinedTimeChange} />
          <DatePicker.RangePicker
            className={styles.datePicker}
            disabledDate={isDisabledDate}
            value={dateRange}
            onChange={range => updateDateRange(range)}
            onCalendarChange={handleCalendarChange}
            format="YYYY-MM-DD"
            allowClear={false}
            renderExtraFooter={currentGranularity
              ? () => granularityDateRangeLimitTextMap[currentGranularity]
              : undefined}
          />
        </div>
      </div>
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.type,
      (type: ReportType) => {
        if (type === ReportType.Transfer) {
          this.props.store.updateCurrentRegion(regionAll.symbol)
        }
      },
      { fireImmediately: true }
    ))
  }

  render() {
    return (
      <div className={styles.main}>
        <PopupContainer>
          {this.inputControlView}
          {this.tabView}
          <div className={styles.content}>
            {this.routesView}
          </div>
        </PopupContainer>
      </div>
    )
  }
}

export default observer(function Dashboard(props: IProps) {
  const store = useLocalStore(StateStore)

  return (
    <Inject render={({ inject }) => (
      <InternalDashboard {...props} store={store} inject={inject} />
    )} />
  )
})
