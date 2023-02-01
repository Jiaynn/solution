/**
 * @file 流量、带宽、请求数统计
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { AreaChart } from 'react-icecream-charts'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Radio from 'react-icecream/lib/radio'
import Row from 'react-icecream/lib/row'
import Spin from 'react-icecream/lib/spin'
import Tabs from 'react-icecream/lib/tabs'
import { bindRadioGroup } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import * as commonMessages from 'cdn/locales/messages'

import AbilityConfig from 'cdn/constants/ability-config'
import { timeRangeValues, timeRangeTextMap, trafficTypeValues, trafficTypeTextMap, TrafficType } from 'cdn/constants/overview'

import EmptyBlock from 'cdn/components/common/EmptyBlock'

import Card from '../Card'
import SummaryCard from './Summary'
import LocalStore from './stores'

import './style.less'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button

export default observer(function Statistics() {
  const store = useLocalStore(LocalStore)
  const { hideDynTraffic } = useInjection(AbilityConfig)
  const trafficTypesForDisplay = hideDynTraffic
    ? trafficTypeValues.filter(li => li !== TrafficType.Reqcount)
    : trafficTypeValues

  const t = useTranslation()

  return (
    <Card className="comp-overview-statistics">
      <Tabs
        animated={false}
        activeKey={store.timeRange}
        onChange={store.handleTimeRangeChange}
      >
        {timeRangeValues.map(key => (
          <Tabs.TabPane tab={t(timeRangeTextMap[key])} key={key} />
        ))}
      </Tabs>

      <div className="statistics-content">
        <Row className="summary-cards" type="flex" justify="start">
          {store.summaryItems.map((it, index) => (
            <SummaryCard {...it} key={index} colSpan={hideDynTraffic ? 12 : 8} />
          ))}
        </Row>

        <RadioGroup {...bindRadioGroup(store.trafficType)}>
          {trafficTypesForDisplay.map(key => (
            <RadioButton key={key} value={key}>{t(trafficTypeTextMap[key])}</RadioButton>
          ))}
        </RadioGroup>
        <div className="charts-wrap">
          <Spin spinning={store.isChartLoading}>
            {store.isTimelineDataEmpty
            ? (
              <EmptyBlock type="sad">{t(commonMessages.noData)}</EmptyBlock>
            )
            : (
              <AreaChart
                series={store.seriesData}
                chartOptions={store.chartOptions}
                options={{ stacking: 'normal' }}
              />
            )}
          </Spin>
        </div>
      </div>
    </Card>
  )
})
