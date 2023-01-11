/*
 * @file 数据统计下载速度 tab 页内容
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { makeObservable, observable, action, computed, reaction } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import { ChartOptions, MapChart, colors, SeriesMapOptions } from 'react-icecream-charts'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Disposable from 'qn-fe-core/disposable'
import { Iamed } from 'portal-base/user/iam'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { I18nStore } from 'portal-base/common/i18n'

import { humanizeMapRegion, humanizeRegion } from 'cdn/transforms/region'
import { isOptionsValid } from 'cdn/transforms/statistics'
import { humanizeSpeed } from 'cdn/transforms/unit'

import IamInfo from 'cdn/constants/iam-info'
import { speedUnit } from 'cdn/constants/chart'
import { SearchType } from 'cdn/constants/statistics'
import { regionGeoNameMap, RegionGeoNameKey } from 'cdn/constants/region'

import StatisticsApis, { IDownloadSpeedData, IDownloadSpeedOptions } from 'cdn/apis/statistics'

export interface IProps {
  options: IDownloadSpeedOptions
}

// 0 - slow 慢
// slow - fast 一般
// fast - Infinity 快
const boundaries = {
  slow: 100 * 1024, // 100 KB/s
  fast: 200 * 1024 // 200 KB/s
}

enum LoadingType {
  Data = 'data',
  MapData = 'mapData'
}

interface PropsWithDeps extends IProps {
  toasterStore: ToasterStore
  statisticsApis: StatisticsApis
  iamInfo: IamInfo
  i18n: I18nStore
}

@observer
class StatisticsSpeedInner extends React.Component<PropsWithDeps> {
  loadings = Loadings.collectFrom(this, LoadingType)

  disposable = new Disposable()

  @observable.ref data?: IDownloadSpeedData

  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed get filteredData() {
    if (!this.data) {
      return []
    }
    return (this.data.regions || []).map(
      (region, index) => ({ region, value: this.data!.value[index] })
    ).filter(
      ({ value }) => value != null
    ) || []
  }

  @computed get dataInTable() {
    return this.filteredData.map(
      ({ region, value }) => ({
        key: region,
        region: this.props.i18n.t(humanizeRegion(region)),
        speed: humanizeSpeed(value)
      })
    )
  }

  @computed get dataInMap() {
    return this.filteredData.map(
      ({ value, region }) => ({
        name: getGeoName(region),
        value
      })
    )
  }

  @action updateData(data: IDownloadSpeedData) {
    this.data = data
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.props.options, SearchType.Speed)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.Data)
  fetchData(options: IDownloadSpeedOptions) {
    return this.props.statisticsApis.batchFetchDownloadSpeed(options).then(
      data => this.updateData(data)
    )
  }

  @observable.ref mapData?: Record<string, unknown>

  @action updateMapData(mapData: Record<string, unknown>) {
    this.mapData = mapData
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.MapData)
  fetchMapData() {
    return import('cdn/constants/chart/map/china.json').then(
      mapData => this.updateMapData(mapData)
    )
  }

  @computed get isMapLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get seriesData(): SeriesMapOptions[] {
    return [{
      data: this.dataInMap,
      mapData: this.mapData!,
      joinBy: 'name',
      name: '下载速度'
    }]
  }

  @computed get chartOptions(): ChartOptions {
    const i18n = this.props.i18n
    return {
      unit: speedUnit,
      decimals: 2,
      colorAxis: {
        dataClasses: [{
          to: boundaries.slow,
          color: colors.Blue.blue5
        }, {
          from: boundaries.slow,
          to: boundaries.fast,
          color: colors.Blue.blue7
        }, {
          from: boundaries.fast,
          color: colors.Blue.blue9
        }]
      },
      tooltip: {
        customFormatter(pointData, humanizeNum) {
          const { pointDot, name, value } = pointData
          return `${pointDot} ${i18n.t(humanizeMapRegion(name))}: <b>${humanizeNum(value)}</b><br/>`
        }
      }
    }
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.isOptionsValid && this.props.options,
      options => {
        if (options) {
          this.fetchData(options)
        }
      },
      { fireImmediately: true }
    ))
    this.fetchMapData()
  }

  render() {
    const iamActions = this.props.iamInfo.mustCdnIamActions()

    return (
      <div style={{ marginTop: '30px' }}>
        <Iamed actions={[iamActions.GetSpeed]}>
          <Row justify="space-between" align="top" gutter={20}>
            <Col span={18}>
              <Spin spinning={this.isMapLoading}>
                <div className="chart">
                  <MapChart
                    series={this.seriesData}
                    chartOptions={this.chartOptions}
                  />
                </div>
              </Spin>
            </Col>
            <Col span={6}>
              <Table
                className="summary-table"
                loading={this.loadings.isLoading(LoadingType.Data)}
                rowKey="key"
                dataSource={this.dataInTable}
              >
                <Table.Column title="地区" dataIndex="region" />
                <Table.Column title="速度" dataIndex="speed" />
              </Table>
            </Col>
          </Row>
        </Iamed>
      </div>
    )
  }
}

export default function StatisticsSpeed(props: IProps) {
  const statisticsApis = useInjection(StatisticsApis)
  const toasterStore = useInjection(ToasterStore)
  const iamInfo = useInjection(IamInfo)
  const i18n = useInjection(I18nStore)

  return (
    <StatisticsSpeedInner
      {...props}
      toasterStore={toasterStore}
      statisticsApis={statisticsApis}
      iamInfo={iamInfo}
      i18n={i18n}
    />
  )
}

// 转换以适配地图中的省份名
function getGeoName(region: string): string {
  return regionGeoNameMap[region as RegionGeoNameKey]
}
