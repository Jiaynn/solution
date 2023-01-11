/**
 * @file component Transfer of Dashboard
 * @author yinxulai <yinxulai@qiniu.com>
 */

import moment from 'moment'
import * as React from 'react'

import autobind from 'autobind-decorator'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Button, Radio, Spin } from 'react-icecream'
import { bindInput, FieldState } from 'formstate-x'
import { bindRadioGroup } from 'portal-base/common/form'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { getAreaSplineChartBaseConfig, getSplineChartBaseConfig } from 'kodo/transforms/chart'
import { humanizeBigNumber, humanizeStorageSize } from 'kodo/transforms/unit'
import { getFormattedDateRangeValue, granularityFormatMap } from 'kodo/transforms/date-time'

import { ISeries, fillColor } from 'kodo/constants/chart'
import { Granularity } from 'kodo/constants/date-time'

import { Auth } from 'kodo/components/common/Auth'

import { StatisticsApis, IReportData, ITransferFlowValue } from 'kodo/apis/statistics'

import { IQueryOptions } from '../store'
import GranularityTab from '../GranularityTab'

import styles from '../style.m.less'

enum Loading {
  FetchData = 'FetchData'
}

enum ChartType {
  Flow = 'flow',
  Bandwidth = 'bandwidth'
}

const chartTypeName = {
  [ChartType.Flow]: '流量',
  [ChartType.Bandwidth]: '带宽'
}

export interface IProps {
  queryOptions: Omit<IQueryOptions, 'ftype'>
}

interface DiDeps {
  inject: InjectFunc
}

// value * 8bit / 5分钟
function transformBandwidth(value: number) {
  return value * 8 / 300
}

@observer
class InternalTransfer extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)
  disposable = new Disposable()
  chartRef = React.createRef<ReactChart>()
  loadings = Loadings.collectFrom(this, Loading)
  chartTypeSelectState = new FieldState(ChartType.Flow)
  granularityState = new FieldState(Granularity.FiveMinutes)
  @observable.ref rawData: Array<IReportData<ITransferFlowValue>>

  @action.bound
  updateRawData(data: Array<IReportData<ITransferFlowValue>>) {
    this.rawData = data
  }

  @computed
  get baseOptions() {
    const { dateRange } = this.props.queryOptions
    const chartType = this.chartTypeSelectState.value
    const [dateStart, dateEnd] = getFormattedDateRangeValue(dateRange)

    // 带宽固定查询 5 分钟的数据
    const g = chartType === ChartType.Bandwidth
      ? Granularity.FiveMinutes
      : this.granularityState.value

    return {
      g,
      end: dateEnd,
      select: 'size',
      begin: dateStart
    }
  }

  @computed
  get flowChartDate(): ISeries[] {
    if (!this.rawData || this.rawData.length === 0) {
      return []
    }

    return [
      {
        name: '国内',
        data: this.rawData[0]
          .map(item => [moment(item.time).valueOf(), item.values.size])
      },
      {
        name: '海外',
        data: this.rawData[1]
          .map(item => [moment(item.time).valueOf(), item.values.size])
      }
    ]
  }

  @computed
  get bandwidthChartData(): ISeries[] {
    if (!this.rawData || this.rawData.length === 0) {
      return []
    }

    let domestic: Array<[number, number]> = []
    let overseas: Array<[number, number]> = []

    if (this.granularityState.value === Granularity.OneDay) {
      // 取每天的 5min 最大值作为当天的数据进行显示
      domestic = Array.from(this.rawData[0].reduce((map, { time, values }) => {
        const date = moment(time).startOf('day').valueOf()
        const currentValue = map.get(date)
        if (currentValue == null || values.size > currentValue) {
          map.set(date, values.size)
        }
        return map
      }, new Map<number, number>()).entries())

      // 取每天的 5min 最大值作为当天的数据进行显示
      overseas = Array.from(this.rawData[1].reduce((map, { time, values }) => {
        const date = moment(time).startOf('day').valueOf()
        const currentValue = map.get(date)
        if (currentValue == null || values.size > currentValue) {
          map.set(date, values.size)
        }
        return map
      }, new Map<number, number>()).entries())

    } else {
      domestic = this.rawData[0].map(
        item => [moment(item.time).valueOf(), item.values.size]
      )
      overseas = this.rawData[1].map(
        item => [moment(item.time).valueOf(), item.values.size]
      )
    }

    const data: ISeries[] = [
      {
        fillColor,
        name: '国内',
        data: domestic
          .sort(([timeA], [timeB]) => timeA - timeB)
          .map(([time, value]) => [time, transformBandwidth(value)])
      },
      {
        fillColor,
        name: '海外',
        data: overseas
          .sort(([timeA], [timeB]) => timeA - timeB)
          .map(([time, value]) => [time, transformBandwidth(value)])
      }
    ]

    return data
  }

  @computed
  get flowStatisticalInfo(): IStatisticalProps['items'] {
    if (!this.rawData || this.rawData.length === 0) {
      return [
        { name: '访问总流量', value: '--' },
        { name: '访问平均流量', value: '--' }
      ]
    }

    const domestic = this.rawData[0].reduce(
      (acc, { values }) => values && values.size + acc, 0
    )

    const overseas = this.rawData[1].reduce(
      (acc, { values }) => values && values.size + acc, 0
    )

    return [
      { name: '访问总流量', value: humanizeStorageSize(overseas + domestic) },
      { name: '访问平均流量', value: humanizeStorageSize((overseas + domestic) / this.rawData[0].length) }
    ]
  }

  @computed
  get bandwidthStatisticalInfo(): IStatisticalProps['items'] {
    if (!this.rawData || this.rawData.length === 0) {
      return [
        { name: '国内峰值', value: '--' },
        { name: '海外峰值', value: '--' }
      ]
    }

    const domestic = this.rawData[0].slice()
      .sort((a, b) => b.values.size - a.values.size)[0]
    const overseas = this.rawData[1].slice()
      .sort((a, b) => b.values.size - a.values.size)[0]

    const humanize = (value: number) => humanizeBigNumber(
      transformBandwidth(value),
      { sep: ' ', unit: 'bps' }
    )

    const formatTemplate = {
      [Granularity.OneDay]: 'YYYY-MM-DD',
      [Granularity.FiveMinutes]: 'YYYY-MM-DD HH:mm'
    }[this.granularityState.value]

    return [
      {
        name: '国内带宽峰值',
        label: `出现在 ${moment(domestic.time).format(formatTemplate)}`,
        value: humanize(domestic.values.size)
      },
      {
        name: '海外带宽峰值',
        label: `出现在 ${moment(overseas.time).format(formatTemplate)}`,
        value: humanize(overseas.values.size)
      }
    ]
  }

  @computed
  get chartConfig() {
    const chartType = this.chartTypeSelectState.value

    const humanize = {
      [ChartType.Flow]: humanizeStorageSize,
      [ChartType.Bandwidth]: (value: number) => humanizeBigNumber(
        value, { sep: ' ', unit: 'bps' }
      )
    }[chartType]

    const series = {
      [ChartType.Flow]: this.flowChartDate,
      [ChartType.Bandwidth]: this.bandwidthChartData
    }[chartType]

    const baseChartConfig = {
      [ChartType.Flow]: getAreaSplineChartBaseConfig,
      [ChartType.Bandwidth]: getSplineChartBaseConfig
    }[chartType]

    const format = granularityFormatMap[this.granularityState.value]
    const exporting = { filename: `跨区域同步-${chartTypeName[chartType]}` }
    return merge(baseChartConfig(humanize, format), { exporting, series })
  }

  @autobind
  exportCSV() {
    this.chartRef.current!.getChart().downloadCSV()
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.FetchData)
  async fetchData() {
    this.updateRawData([])

    return Promise.all([
      this.statisticsApis.getTransferFlow({ ...this.baseOptions, isOversea: false }),
      this.statisticsApis.getTransferFlow({ ...this.baseOptions, isOversea: true })
    ]).then(this.updateRawData)
  }

  @autobind
  refreshChart() {
    setTimeout(() => {
      if ((!this.flowChartDate || this.flowChartDate.length === 0) && this.chartRef.current) {
        this.chartRef.current.chart!.redraw()
      }
    }, 250)
  }

  @computed
  get chartTypeSelectView() {
    return (
      <Radio.Group
        buttonStyle="solid"
        {...bindRadioGroup(this.chartTypeSelectState)}
      >
        <Radio.Button value={ChartType.Flow}>
          {chartTypeName[ChartType.Flow]}
        </Radio.Button>
        <Radio.Button value={ChartType.Bandwidth}>
          {chartTypeName[ChartType.Bandwidth]}
        </Radio.Button>
      </Radio.Group>
    )
  }

  @computed
  get granularitySelectView() {
    return (
      <GranularityTab
        className={styles.tabLeftGap}
        {...bindInput(this.granularityState)}
        granularities={[Granularity.FiveMinutes, Granularity.OneDay]}
      />
    )
  }

  @computed
  get statisticalView() {
    const statisticalList = {
      [ChartType.Flow]: this.flowStatisticalInfo,
      [ChartType.Bandwidth]: this.bandwidthStatisticalInfo
    }[this.chartTypeSelectState.value]

    return (
      <Statistical
        items={statisticalList}
        isLoading={this.loadings.isLoading(Loading.FetchData)}
      />
    )
  }

  @computed
  get exportButtonView() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <Button
            disabled={disabled}
            icon="cloud-download"
            onClick={this.exportCSV}
          >
            导出 CSV
          </Button>
        )}
      />
    )
  }

  @computed
  get chartView() {
    return (
      <div className={styles.reactChart}>
        <ReactChart
          ref={this.chartRef}
          config={this.chartConfig}
          isLoading={this.loadings.isLoading(Loading.FetchData)}
        />
      </div>
    )
  }

  render() {
    return (
      <div>
        <div className={styles.contentHeaderBox}>
          <span>
            {this.chartTypeSelectView}
            {this.granularitySelectView}
          </span>
          {this.exportButtonView}
        </div>
        {this.statisticalView}
        {this.chartView}
      </div>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => [
          this.props.queryOptions,
          this.granularityState.value,
          this.chartTypeSelectState.value
        ],
        ([queryOptions]) => queryOptions && this.fetchData(),
        { fireImmediately: true }
      ),
      reaction(
        () => this.flowChartDate,
        _ => this.refreshChart(),
        { fireImmediately: true }
      )
    )

    this.disposable.addDisposer(this.granularityState.dispose)
    this.disposable.addDisposer(this.chartTypeSelectState.dispose)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function Transfer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTransfer {...props} inject={inject} />
    )} />
  )
}

interface IStatisticalProps {
  isLoading: boolean
  items: Array<{ name: string, label?: string, value: string }>
}

function Statistical(props: IStatisticalProps) {
  return (
    <Spin spinning={props.isLoading}>
      <div className={styles.statistical}>
        {props.items.map(item => (
          <div key={item.name} className={styles.item}>
            <span className={styles.value}>
              {item.value || '--'}
            </span>
            <p className={styles.name}>
              {item.name}
            </p>
            {item.label && (
              <p className={styles.label}>
                {item.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </Spin>
  )
}
