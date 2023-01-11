
import React from 'react'

import { RendererUtils as Renderer } from 'test'

import { AlarmType, DataPointNumType, StatusCodeSubType, ThresholdType } from 'cdn/constants/alarm'

import { MetricsItem } from 'cdn/apis/alarm/rule'
import RuleConfigMetricsItem from './RuleConfigMetricsItem'

const alarmItem: MetricsItem = {
  alarmType: AlarmType.StatusCode,
  alarmSubType: StatusCodeSubType.StatusCode2xx,
  threshold: {
    thresholdType: ThresholdType.Above,
    thresholdVal: 80
  },
  dataPointNum: DataPointNumType.One
}

const alarmItem2: MetricsItem = {
  alarmType: AlarmType.Traffic,
  threshold: {
    thresholdType: ThresholdType.Above,
    thresholdVal: 80
  },
  dataPointNum: DataPointNumType.One
}

it('renders RuleConfigMetricsItem correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <RuleConfigMetricsItem item={alarmItem} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders RuleConfigMetricsItem correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <RuleConfigMetricsItem item={alarmItem2} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
