/**
 * @file component Storage
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { action, observable, reaction, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { getLatestDuration, getFormattedDateRangeValue, granularityFormatMap } from 'kodo/transforms/date-time'
import { humanizeStorageSize } from 'kodo/transforms/unit'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'

import { ISeries, fillColor } from 'kodo/constants/chart'
import { Granularity } from 'kodo/constants/date-time'
import { RegionSymbol } from 'kodo/constants/region'

import { StatisticsApis, IStatdBaseData } from 'kodo/apis/statistics'

import { IProps as CommonProps } from '.'
import style from './style.m.less'

export interface IProps extends CommonProps { }

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'storage'

@observer
class InternalStorage extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  @observable.ref storageData: ISeries[] = []
  loadings = Loadings.collectFrom(this, loadingId)

  @action.bound updateStorage(data: IStatdBaseData) {
    this.storageData = [
      {
        name: '存储',
        fillColor,
        data: data.times.map((time, index) => (
          [time * 1000, data.datas[index]]
        ))
      }
    ]
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  async fetchStorageData() {
    const { ftype } = this.props
    const statisticsApis = this.props.inject(StatisticsApis)
    const fetchStorageData = statisticsApis.getStorageTypeStorageDataFetchMethod(ftype)

    if (!fetchStorageData) { return Promise.reject('无效的存储类型') }

    const [begin, end] = getFormattedDateRangeValue(getLatestDuration(6, undefined, 'days'))

    const data = await fetchStorageData({
      bucket: this.props.bucketName,
      region: this.props.region as RegionSymbol,
      g: Granularity.OneDay,
      begin,
      end,
      ...(hasPreDelQueryOption(ftype) ? { no_predel: 1 } : {})
    })

    this.updateStorage(data)
  }

  @computed get config() {
    return merge(
      getAreaSplineChartBaseConfig(humanizeStorageSize, granularityFormatMap[Granularity.OneDay]),
      { series: this.storageData }
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.ftype,
      () => this.fetchStorageData(),
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <div className={style.chart}>
        <div className={style.header}>
          <span className={style.chartTitle}>存储量</span>
        </div>
        <div>
          <ReactChart
            config={this.config}
            isLoading={this.loadings.isLoading(loadingId)}
          />
        </div>
      </div>
    )
  }
}

export default function Storage(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalStorage {...props} inject={inject} />
    )} />
  )
}
