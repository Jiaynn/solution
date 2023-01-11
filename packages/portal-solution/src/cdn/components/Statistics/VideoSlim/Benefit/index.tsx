/**
 * @desc 数据统计 - 视频瘦身 - 效益统计
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { AreaChart } from 'react-icecream-charts'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import { Featured } from 'portal-base/user/feature-config'
import { useLocalStore } from 'portal-base/common/utils/store'
import { bindTextInput } from 'portal-base/common/form'
import { TranslateFn, useTranslation } from 'portal-base/common/i18n'

import { humanizeTraffic, humanizeReqcount } from 'cdn/transforms/unit'

import { IVideoSlimOptions, IVideoSlimBenefitValue } from 'cdn/apis/statistics'

import SummaryItem from '../../SummaryItem'

import LocalStore, { Loading } from './store'

const Column = Table.Column

export interface IProps {
  options: IVideoSlimOptions
}

type PropsWithDeps = IProps & {
  store: LocalStore
  t: TranslateFn
}

@observer
class VideoSlimBenefitInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get summaryItems() {
    const { store } = this.props
    const { reqCount, save } = store.summary || {} as IVideoSlimBenefitValue

    return (
      <Row>
        <Col span={6}>
          <SummaryItem
            title="资源访问总次数"
            value={reqCount != null ? this.props.t(humanizeReqcount(reqCount)) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
        <Col span={6}>
          <SummaryItem
            title="节省流量（估算）"
            value={save != null ? humanizeTraffic(save) : null}
            isLoading={store.isTimelineLoading}
          />
        </Col>
      </Row>
    )
  }

  @computed get topURLsTable() {
    const { store, t } = this.props
    return (
      <div>
        <div className="table-title-wrapper">
          <h3 className="title">瘦身资源访问 TOP 1000</h3>
          <div className="table-search-input">
            <Input.Search size="small" {...bindTextInput(store.keywordState)} />
          </div>
        </div>
        <Table
          dataSource={store.tableDataSource}
          pagination={{ pageSize: 20, total: store.tableDataSource.length }}
          loading={store.loadings.isLoading(Loading.TopURL)}
          rowKey="url"
        >
          <Column title="#" dataIndex="index" />
          <Column title="URL" dataIndex="url" />
          <Column
            title="访问次数"
            dataIndex="reqCount"
            sorter={(a: any, b: any) => a.reqCount - b.reqCount}
            render={value => t(humanizeReqcount(value))}
          />
          <Column
            title="估算节省流量"
            dataIndex="save"
            sorter={(a: any, b: any) => a.save - b.save}
            render={value => humanizeTraffic(value)}
          />
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
              注：瘦身文件单次访问的估算节点流量 = 单次访问流量 * (视频瘦身比 - 1)<br />
              瘦身文件节省的流量是根据日志分析估算得出的结果，仅供参考，不能作为计量核对的依据。
            </p>
          </div>
        </Spin>
        {this.topURLsTable}
      </div>
    )
  }
}

export default function VideoSlimBenefit(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  const t = useTranslation()

  return (
    <VideoSlimBenefitInner {...props} t={t} store={store} />
  )
}
