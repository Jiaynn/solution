import React from 'react'
import { observer } from 'mobx-react'
import { AreaChart } from 'react-icecream-charts'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { useInjection } from 'qn-fe-core/di'
import { Featured } from 'portal-base/user/feature-config'
import { useLocalStore } from 'portal-base/common/utils/store'
import { I18nStore } from 'portal-base/common/i18n'

import { humanizeEntries } from 'cdn/transforms/unit'

import { SearchType, searchTypeTextMap } from 'cdn/constants/statistics'
import SummaryItem from '../SummaryItem'
import StatisticsPanel from '../Panel'

import LocalStore, { IStatisticsUvProps } from './store'
import * as messages from './messages'

export { IStatisticsUvProps }

type PropsWithDeps = IStatisticsUvProps & {
  store: LocalStore
  i18n: I18nStore
}

@observer
class StatisticsUvInner extends React.Component<PropsWithDeps> {
  getUvSummary() {
    const { store, i18n } = this.props

    return (
      <div>
        <Col span={12}>
          <SummaryItem
            title={
              <span>
                {i18n.t(messages.total)}
                <Tooltip title={i18n.t(messages.independentIpTips)}>
                  <Icon type="question-circle" className="info-icon" />
                </Tooltip>
              </span>
            }
            value={store.summary.total != null ? i18n.t(humanizeEntries(store.summary.total)) : null}
            isLoading={store.isLoading}
          />
        </Col>
        <Col span={12}>
          <SummaryItem
            title={i18n.t(messages.dailyAvg)}
            value={store.summary.average != null ? i18n.t(humanizeEntries(store.summary.average)) : null}
            isLoading={store.isLoading}
          />
        </Col>
      </div>
    )
  }

  render() {
    const i18n = this.props.i18n
    const chartSummary = this.getUvSummary()

    return (
      <div className="statistics-content-wrapper">
        <Spin spinning={this.props.store.isLoading}>
          <StatisticsPanel title={i18n.t(searchTypeTextMap[SearchType.Uv])}>
            <Row justify="end" align="top" className="display-control">
              <Col span={8}>
                { chartSummary }
              </Col>
              <Col span={4} offset={12}>
                <Featured feature="STAT.STAT_ALLOW_EXPORT">
                  <Button
                    type="ghost"
                    icon="download"
                    disabled={!this.props.store.isOptionsValid || this.props.store.isSeriesDataEmpty}
                    onClick={this.props.store.exportAreaData}
                  >
                    {i18n.t(messages.exportCsv)}
                  </Button>
                </Featured>
              </Col>
            </Row>
            <div className="chart">
              <AreaChart
                series={this.props.store.seriesData}
                chartOptions={this.props.store.areaChartOptions}
              />
            </div>
          </StatisticsPanel>
        </Spin>
      </div>
    )
  }
}

export default function StatisticsUv(props: IStatisticsUvProps) {
  const store = useLocalStore(LocalStore, props)
  const i18n = useInjection(I18nStore)

  return (
    <StatisticsUvInner {...props} i18n={i18n} store={store} />
  )
}
