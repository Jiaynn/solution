/**
 * @file highcharts relative transforms
 * @author lizhifeng <lizhifeng@qiniu.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { escape as lodashEscape } from 'lodash' // 区别于全局 escape

import merge from 'kodo/utils/merge'

import {
  IPointContext, ITooltipFormatterContext, areaSplineChartBase,
  splineChartBaseConfig, areaSplineStackedChartBase, columnCharBase
} from 'kodo/constants/chart'
import { humanizeTimestamp } from './date-time'

export type Humanizer = (value: number) => React.ReactText // 限制范围

export const isValueAvailable = value => value != null && Number.isFinite(value)

export function tooltipPointFormatter(this: IPointContext, humanizer?: Humanizer): string {
  return [
    `<span class="highcharts-tooltip-point" style="color: ${lodashEscape(this.color)}">\u25cf</span> `,
    `<span class="highcharts-tooltip-name"> ${lodashEscape(this.series.name)}: </span>`,
    `<span class="highcharts-tooltip-value"><b>
      ${lodashEscape((humanizer ? humanizer(this.y) : this.y) + '')}
    </b></span>`,
    '<br/>'
  ].join('')
}

// TODO 数量太多的情况下如何优化
export function tooltipFormatter(
  this: ITooltipFormatterContext,
  humanizer?: Humanizer,
  format?: string
): string {
  const series = this.points
    .filter(point => isValueAvailable(point.y))
    .sort((a, b) => b.y - a.y)
    .map(point => tooltipPointFormatter.call(point, humanizer))

  return [
    `<span>${lodashEscape(humanizeTimestamp(this.x, format))}</span>`,
    '<br/>',
    series.join('')
  ].join('')
}

export function getOptimizedConfig(humanizer: Humanizer, format: string) {
  return {
    tooltip: {
      followPointer: false,
      shared: true,
      useHTML: true,
      formatter() {
        return [
          '<div style="height: 100px; overflow-y: auto !important; position: relative; z-index: 50">',
          tooltipFormatter.call(this, humanizer, format),
          '</div>'
        ].join('')
      }
    },
    yAxis: {
      labels: {
        formatter() {
          return `${humanizer ? humanizer(this.value) : this.value}`
        }
      }
    }
  }
}

export function getAreaSplineStackedChartBaseConfig(humanizer: Humanizer = v => v, format = 'YYYY-MM-DD HH:mm:ss'): Highcharts.Options {
  return merge(areaSplineStackedChartBase, getOptimizedConfig(humanizer, format))
}

export function getAreaSplineChartBaseConfig(humanizer: Humanizer = v => v, format = 'YYYY-MM-DD HH:mm:ss'): Highcharts.Options {
  return merge(areaSplineChartBase, getOptimizedConfig(humanizer, format))
}

export function getSplineChartBaseConfig(humanizer: Humanizer = v => v, format = 'YYYY-MM-DD HH:mm:ss'): Highcharts.Options {
  return merge(splineChartBaseConfig, getOptimizedConfig(humanizer, format))
}

export function getColumnChartBaseConfig(humanizer: Humanizer = v => v, format = 'YYYY-MM-DD HH:mm:ss') {
  return merge(columnCharBase, getOptimizedConfig(humanizer, format))
}
