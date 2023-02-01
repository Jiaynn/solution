import React from 'react'
import { BarChart, PieChart } from 'react-icecream-charts'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'portal-base/common/utils/store'

import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Radio from 'react-icecream/lib/radio'
import { Featured } from 'portal-base/user/feature-config'
import { Iamed } from 'portal-base/user/iam'
import { useTranslation } from 'portal-base/common/i18n'

import { SearchType } from 'cdn/constants/statistics'
import { defaultPieChartOptions } from 'cdn/constants/chart'
import IamInfo from 'cdn/constants/iam-info'

import * as messages from './messages'
import LocalStore, { FlowData, BandwidthData, ReqCountData, IStatisticsAccessProps } from './stores'
import StatisticsPanel from '../Panel'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group

export default observer(function StatisticsAccess(props: IStatisticsAccessProps) {
  const store = useLocalStore(LocalStore, props, [FlowData, BandwidthData, ReqCountData])
  const { iamActions } = useInjection(IamInfo)
  const t = useTranslation()

  return (
    <div className="statistics-content-wrapper">
      <Iamed actions={[iamActions.GetReqCount]}>
        <Spin spinning={store.isRegionLoading}>
          <StatisticsPanel title={t(messages.regionDistribution)}>
            <Row justify="end" align="top" className="display-control">
              <Col span={12} className="access-region-header">
                <RadioGroup
                  value={store.regionCurrentType}
                  onChange={e => store.updateRegionCurrentType(e.target.value)}
                >
                  <RadioButton value={SearchType.Flow}>{t(messages.flow)}</RadioButton>
                  <RadioButton value={SearchType.Bandwidth}>{t(messages.bandwidth)}</RadioButton>
                  <RadioButton value={SearchType.Reqcount}>{t(messages.reqCount)}</RadioButton>
                </RadioGroup>
                <span className="access-chart-desc">{t(messages.top20Region)}</span>
              </Col>
              <Col span={12}>
                <Featured feature="STAT.STAT_ALLOW_EXPORT">
                  <Button
                    type="ghost"
                    icon="download"
                    disabled={!store.isOptionsValid || store.isRegionDataEmpty}
                    onClick={store.exportRegionData}
                  >
                    {t(messages.exportCsv)}
                  </Button>
                </Featured>
              </Col>
            </Row>
            <Row gutter={20} justify="space-between" align="top" className="access-chart-wrap">
              <Col span={12} className="region-chart-wrap">
                <BarChart
                  series={store.regionSeriesData.data}
                  chartOptions={store.regionChartOptions}
                />
              </Col>
              <Col span={12}>
                <Table
                  className="summary-table access-table"
                  rowKey="name"
                  {...store.regionTableData}
                />
              </Col>
            </Row>
          </StatisticsPanel>
        </Spin>
      </Iamed>
      <Iamed actions={[iamActions.GetISPReqCount]}>
        <Spin spinning={store.isIspLoading}>
          <StatisticsPanel title={t(messages.ispDistribution)}>
            <Row justify="end" align="top" className="display-control">
              <Col span={12}>
                <RadioGroup
                  value={store.ispCurrentType}
                  onChange={e => store.updateIspCurrentType(e.target.value)}
                >
                  <RadioButton value={SearchType.Flow}>{t(messages.flow)}</RadioButton>
                  <RadioButton value={SearchType.Bandwidth}>{t(messages.bandwidth)}</RadioButton>
                  <RadioButton value={SearchType.Reqcount}>{t(messages.reqCount)}</RadioButton>
                </RadioGroup>
              </Col>
              <Col span={12}>
                <Featured feature="STAT.STAT_ALLOW_EXPORT">
                  <Button
                    type="ghost"
                    icon="download"
                    disabled={!store.isOptionsValid || store.isIspDataEmpty}
                    onClick={store.exportIspData}
                  >
                    {t(messages.exportCsv)}
                  </Button>
                </Featured>
              </Col>
            </Row>
            <Row gutter={20} justify="space-between" align="top">
              <Col span={12}>
                <div className="chart pie">
                  <PieChart
                    series={store.ispSeriesData}
                    chartOptions={store.ispChartOptions}
                    options={defaultPieChartOptions}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Table
                  className="summary-table access-table"
                  rowKey="name"
                  {...store.ispTableData}
                />
              </Col>
            </Row>
          </StatisticsPanel>
        </Spin>
      </Iamed>
    </div>
  )
})
