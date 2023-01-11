import React from 'react'
import { AreaChart, PieChart } from 'react-icecream-charts'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'

import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { useInjection } from 'qn-fe-core/di'
import { Featured } from 'portal-base/user/feature-config'
import { useLocalStore } from 'portal-base/common/utils/store'
import { I18nStore } from 'portal-base/common/i18n'

import { humanizeReqcount, humanizePercent } from 'cdn/transforms/unit'

import { defaultPieChartOptions } from 'cdn/constants/chart'

import StatisticsPanel from '../Panel'
import SummaryItem from '../SummaryItem'
import LocalStore, { IStatisticsCodeProps } from './store'

import * as messages from './messages'

type PropsWithDeps = IStatisticsCodeProps & {
  i18n: I18nStore
  store: LocalStore
}

@observer
class StatisticsCodeInner extends React.Component<PropsWithDeps> {
  @autobind getCodeSummary() {
    const { store, i18n } = this.props
    if (!store.summary) {
      return null
    }

    const { total, average } = store.summary

    return (
      <div>
        <Col span={12}>
          <SummaryItem
            title={i18n.t(messages.total)}
            value={total != null ? i18n.t(humanizeReqcount(total)) : null}
            isLoading={store.isLoading}
          />
        </Col>
        <Col span={12}>
          <SummaryItem
            title={i18n.t(messages.dailyAvg)}
            value={average != null ? i18n.t(humanizeReqcount(average)) : null}
            isLoading={store.isLoading}
          />
        </Col>
      </div>
    )
  }

  render() {
    const { store, i18n } = this.props
    const chartSummary = this.getCodeSummary()

    const columns = [{
      title: (
        <div>
          {i18n.t(messages.statusCode)}
          <Tooltip
            title={
              <div>
                {i18n.t(messages.statusCodeDefinition)}
              </div>
            }
            overlayClassName="info-tip"
          >
            <Icon type="question-circle" className="info-icon" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'code'
    }, {
      title: i18n.t(messages.count),
      dataIndex: 'count',
      render: (val: number) => i18n.t(humanizeReqcount(val))
    }, {
      title: i18n.t(messages.percent),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]

    return (
      <div className="statistics-content-wrapper">
        <Spin spinning={store.isLoading}>
          <Row justify="space-between" align="top" className="display-control">
            <Col span={8}>
              { chartSummary }
            </Col>
            <Col span={4} offset={12}>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  icon="download"
                  disabled={!store.isOptionsValid || store.isTimelineDataEmpty}
                  onClick={store.exportAreaData}
                >
                  {i18n.t(messages.exportCsv)}
                </Button>
              </Featured>
            </Col>
          </Row>
          <div className="chart">
            <AreaChart
              series={store.seriesData}
              chartOptions={store.areaChartOptions}
              options={{ stacking: 'normal' }}
            />
          </div>
          <StatisticsPanel title={i18n.t(messages.statusCodeDetail)}>
            <Row gutter={20} justify="space-between" align="top">
              <Col span={12}>
                <div className="chart pie">
                  <PieChart
                    series={store.pieSeriesData}
                    chartOptions={store.pieChartOptions}
                    options={defaultPieChartOptions}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Table
                  className="summary-table"
                  rowKey="code"
                  columns={columns}
                  dataSource={store.pieTableData}
                />
              </Col>
            </Row>
          </StatisticsPanel>
        </Spin>
      </div>
    )
  }
}

export default function StatisticsCode(props: IStatisticsCodeProps) {
  const store = useLocalStore(LocalStore, props)
  const i18n = useInjection(I18nStore)

  return (
    <StatisticsCodeInner {...props} i18n={i18n} store={store} />
  )
}
