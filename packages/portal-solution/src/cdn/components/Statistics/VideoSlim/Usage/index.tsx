/**
 * @desc 数据统计 - 视频瘦身 - 使用统计
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { AreaChart } from 'react-icecream-charts'

import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import { Featured } from 'portal-base/user/feature-config'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore } from 'portal-base/common/utils/store'
import { useInjection } from 'qn-fe-core/di'
import { bindTextInput } from 'portal-base/common/form'
import { TranslateFn, useTranslation } from 'portal-base/common/i18n'

import { humanizeTimeUTC } from 'cdn/transforms/datetime'

import { humanizeReqcount, humanizeDuration, transformStorageSize } from 'cdn/transforms/unit'

import { videoDefDescTextMap } from 'cdn/constants/video-slim'

import { IVideoSlimTask } from 'cdn/apis/video-slim'
import { IVideoSlimOptions, IVideoSlimUsageValue } from 'cdn/apis/statistics'

import SummaryItem from '../../SummaryItem'

import LocalStore, { Loading } from './store'

const Column = Table.Column

export interface IProps {
  options: IVideoSlimOptions
}

type PropsWithDeps = IProps & {
  store: LocalStore
  toasterStore: ToasterStore
  t: TranslateFn
}

@observer
class VideoSlimUsageInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed get summaryItems() {
    const { store } = this.props
    const { slimCount, time2K, timeHD, timeSD } = (store.summary || {}) as IVideoSlimUsageValue

    return (
      <div>
        <Col span={6}>
          <SummaryItem
            title="瘦身总次数"
            value={slimCount != null ? this.props.t(humanizeReqcount(slimCount)) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
        <Col span={6}>
          <SummaryItem
            title="2K 视频总时长"
            value={time2K != null ? humanizeDuration(time2K) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
        <Col span={6}>
          <SummaryItem
            title="HD 视频总时长"
            value={timeHD != null ? humanizeDuration(timeHD) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
        <Col span={6}>
          <SummaryItem
            title="SD 视频总时长"
            value={timeSD != null ? humanizeDuration(timeSD) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
      </div>
    )
  }

  @autobind
  @ToasterStore.handle()
  handleSearch() {
    const { store } = this.props
    store.tasksStore.queryStore.applyParams()
    store.tasksStore.paginationStore.reset()
    return store.tasksStore.fetchList()
  }

  @computed get usageDetailTable() {
    const { store } = this.props
    return (
      <div>
        <div className="table-title-wrapper">
          <h3 className="title">瘦身服务使用详情</h3>
          <div className="table-search-input">
            <Input.Search
              {...bindTextInput(store.tasksStore.queryStore.urlState)}
              onSearch={this.handleSearch}
            />
          </div>
        </div>
        <Table
          dataSource={store.tasksStore.tasks}
          pagination={store.paginationInfo}
          loading={store.isTableLoading}
          rowKey="id"
        >
          <Column title="#" render={(_: unknown, __, index) => (store.paginationInfo.current - 1) * store.paginationInfo.pageSize + index + 1} />
          <Column title="时间" dataIndex="createAt" render={createAt => humanizeTimeUTC(createAt)} />
          <Column title="资源" dataIndex="resource" />
          <Column title="文件格式" dataIndex="avType" />
          <Column title="瘦身前后文件大小(MB)"
            render={
              (_: unknown, row: IVideoSlimTask) => `${transformStorageSize(row.originSize, { to: 'MB' }).toFixed(2)}/${transformStorageSize(row.afterSize, { to: 'MB' }).toFixed(2)}`
            } />
          <Column title="瘦身后规格"
            dataIndex="afterDef"
            render={
              (val: string) => `${val.toUpperCase()}(${videoDefDescTextMap[val as keyof typeof videoDefDescTextMap]})`
            } />
          <Column title="视频时长"
            render={
              (_: unknown, row: IVideoSlimTask) => humanizeDuration(row.afterDur)
            } />
        </Table>
      </div>
    )
  }

  render() {
    const { store } = this.props
    return (
      <div>
        <Spin spinning={store.loadings.isLoading(Loading.Timeline)}>
          <Row justify="space-between" align="top" className="display-control">
            <Col span={16}>
              {this.summaryItems}
            </Col>
            <Col span={4} offset={4}>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  icon="download"
                  disabled={store.isTimelineDataEmpty}
                  onClick={store.exportCSV}
                >
                  导出 CSV
                </Button>
              </Featured>
            </Col>
          </Row>
          <div className="chart">
            <AreaChart
              series={store.seriesData}
              chartOptions={store.chartOptions}
            />
            <p className="chart-tips">
              注：统计的视频时长，以秒四舍五入换算为分钟，与账单计费时长略有误差
            </p>
          </div>
        </Spin>
        {this.usageDetailTable}
      </div>
    )
  }
}

export default function VideoSlimUsage(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  const toasterStore = useInjection(ToasterStore)
  const t = useTranslation()

  return (
    <VideoSlimUsageInner {...props} t={t} store={store} toasterStore={toasterStore} />
  )
}
