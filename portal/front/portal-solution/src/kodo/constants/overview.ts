/**
 * @file constants for overview
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as Highcharts from 'highcharts'

import merge from 'kodo/utils/merge'

import { variablePieChartBase } from 'kodo/constants/chart'

export const variablePieChartConfig: Highcharts.Options = merge(variablePieChartBase, {
  chart: {
    height: 200,
    events: {
      load() {
        this.hasData = function() { return true } // eslint-disable-line func-names
      }
    }
  },
  title: {
    align: 'center',
    verticalAlign: 'middle',
    useHTML: true,
    y: -5
  },
  plotOptions: {
    variablepie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: false
      },
      showInLegend: true
    }
  },
  tooltip: {
    enabled: false
  },
  legend: {
    enabled: true,
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    itemMarginBottom: 10,
    useHTML: true,
    labelFormatter() {
      return `<span style="color: #B2B2B2">${this.name}</span>`
        + `<span style="padding-left: 10px">${this.y}</span>`
    }
  }
})
