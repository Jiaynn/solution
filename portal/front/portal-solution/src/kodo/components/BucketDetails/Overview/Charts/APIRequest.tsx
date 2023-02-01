/**
 * @file component APIRequest
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, observable, reaction, computed, makeObservable } from 'mobx'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import ReactChart from 'portal-base/common/components/ReactHighcharts'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import merge from 'kodo/utils/merge'

import { getSplineChartBaseConfig } from 'kodo/transforms/chart'
import { getLatestDuration, getFormattedDateRangeValue, granularityFormatMap } from 'kodo/transforms/date-time'

import { RegionSymbol } from 'kodo/constants/region'
import { ISeries } from 'kodo/constants/chart'
import { flowSrcValueMap, SelectField } from 'kodo/constants/statistics'
import { Granularity } from 'kodo/constants/date-time'

import { StatisticsApis, IReportData, IAPIValue } from 'kodo/apis/statistics'

import { IProps as CommonProps } from '.'
import style from './style.m.less'

export interface IProps extends CommonProps { }

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'api'

@observer
class InternalAPIRequest extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @observable.ref apiData: ISeries[] = []
  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @action.bound updateData(data: Array<IReportData<IAPIValue>>) {
    const [getData, putData] = data
    this.apiData = [
      {
        name: 'Get',
        data: getData.map<[number, number]>(item => ([moment(item.time).valueOf(), item.values.hits]))
      },
      {
        name: 'Put',
        data: putData.map<[number, number]>(item => ([moment(item.time).valueOf(), item.values.hits]))
      }
    ]
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  fetchData() {
    const statisticsApis = this.props.inject(StatisticsApis)
    const [begin, end] = getFormattedDateRangeValue(getLatestDuration(6, undefined, 'days'))
    const { bucketName, region, ftype } = this.props
    const basicOptions = {
      begin,
      end,
      select: SelectField.Hits,
      $bucket: bucketName,
      $region: region as RegionSymbol,
      g: Granularity.OneDay,
      $ftype: ftype
    }
    const req = Promise.all([
      statisticsApis.getOutflowData<IAPIValue>({
        ...basicOptions,
        $src: flowSrcValueMap.api
      }),
      statisticsApis.getAPIPutData<IAPIValue>(basicOptions)
    ])

    req.then(this.updateData).catch(() => { /**/ })
    return req
  }

  @computed get config() {
    return merge(
      getSplineChartBaseConfig(undefined, granularityFormatMap[Granularity.OneDay]),
      { series: this.apiData }
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => ({
        ftype: this.props.ftype,
        region: this.props.region
      }),
      data => {
        if (data.region) {
          this.fetchData()
        }
      },
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
          <span className={style.chartTitle}>API请求</span>
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

export default function APIRequest(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalAPIRequest {...props} inject={inject} />
    )} />
  )
}
