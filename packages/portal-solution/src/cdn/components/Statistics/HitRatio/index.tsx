import React from 'react'
import { AreaChart, PieChart } from 'react-icecream-charts'
import { observer } from 'mobx-react'
import { useLocalStore } from 'portal-base/common/utils/store'

import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Table from 'react-icecream/lib/table'
import Radio from 'react-icecream/lib/radio'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import { Featured } from 'portal-base/user/feature-config'
import { useTranslation } from 'portal-base/common/i18n'

import { defaultPieChartOptions } from 'cdn/constants/chart'

import * as messages from './messages'
import LocalStore, { IStatisticsHitRatioProps } from './store'
import StatisticsPanel from '../Panel'

export default observer(function StatisticsHitRatio(props: IStatisticsHitRatioProps) {
  const store = useLocalStore(LocalStore, props)
  const t = useTranslation()

  return (
    <div className="statistics-content-wrapper">
      <Spin spinning={store.isTimelineLoading}>
        <Row justify="space-between" align="top" className="display-control">
          <Col span={4}>
            <div className="title">
              {t(messages.hitRatio)}
              <Tooltip
                title={(
                  <ul>
                    <li>{t(messages.trafficHitRatioCalc)}</li>
                    <li>{t(messages.requestHitRatioCalc)}</li>
                  </ul>
                )}
                overlayClassName="info-tip"
              >
                <Icon type="question-circle" className="info-icon" />
              </Tooltip>
            </div>
          </Col>
          <Col span={4} offset={16}>
            <Featured feature="STAT.STAT_ALLOW_EXPORT">
              <Button
                type="ghost"
                icon="download"
                disabled={!store.isOptionsValid || store.isTimelineDataEmpty}
                onClick={store.exportAreaData}
              >
                {t(messages.exportCsv)}
              </Button>
            </Featured>
          </Col>
        </Row>
        <div className="chart">
          <AreaChart
            series={store.seriesData}
            chartOptions={store.areaChartOptions}
          />
        </div>
      </Spin>
      <Spin spinning={store.isDetailLoading}>
        <StatisticsPanel title={t(messages.hitDetail)}>
          <Row justify="space-between" align="top" className="display-control">
            <Col span={4}>
              <Radio.Group value={store.currentType} onChange={e => store.updateCurrentType(e.target.value)}>
                <Radio.Button value="reqcount">{t(messages.request)}</Radio.Button>
                <Radio.Button value="traffic">{t(messages.flow)}</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={4} offset={16}>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  icon="download"
                  disabled={!store.isOptionsValid || store.isDetailDataEmpty}
                  onClick={store.exportPieData}
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
                  series={store.pieSeriesData}
                  chartOptions={store.pieChartOptions}
                  options={defaultPieChartOptions}
                />
              </div>
            </Col>
            <Col span={12}>
              <Table
                className="summary-table"
                rowKey="name"
                pagination={false}
                columns={store.pieTableColumns}
                dataSource={store.pieTableData}
              />
            </Col>
          </Row>
        </StatisticsPanel>
      </Spin>
    </div>
  )
})
