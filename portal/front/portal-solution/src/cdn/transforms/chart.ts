import { ChartOptions, UnitOptions, LegendOptions, YAxisOptions, TooltipOptions, ToolTipPointDataObject } from 'react-icecream-charts'
import { merge, zipObject } from 'lodash'
import moment from 'moment'
import { TranslateFn } from 'portal-base/common/i18n'

import { basicChartOptions, reqcountUnit } from 'cdn/constants/chart'

export interface ISeriesData<T = string> {
  name: T
  data: Array<[number | string, number]>
  yAxis?: 0 | 1 // 该 series 对应哪个 y 轴, 0 左边 1 右边
  total?: number
  max?: number
}

export interface IPieSeriesData {
  name: string
  data: Array<[string, number]>
  total?: number
}

export interface IBarSeriesData {
  categories: string[]
  data: Array<{name: string, data: number[]}>
}

export type TooltipFormatterOptions = {
  humanizeNum: (val: number) => string
  pointData: ToolTipPointDataObject
  tooltipData?: any
}

export interface IBaseChartOptions {
  unit?: UnitOptions | [UnitOptions, UnitOptions]
  decimals?: number | [number, number]
  legend?: LegendOptions
  tooltipFormatter?: (options: TooltipFormatterOptions) => string
  tooltipData?: any
}

export interface ILineChartOptions extends IBaseChartOptions {
  yAxis?: YAxisOptions
}

export function getLineChartOptions(options?: ILineChartOptions): ChartOptions {
  const { unit, decimals, legend, yAxis } = options || {} as ILineChartOptions
  return merge<ChartOptions, ChartOptions, ChartOptions>({}, basicChartOptions, {
    height: 300,
    unit,
    decimals,
    legend,
    yAxis
  })
}

export interface IAreaChartOptions extends IBaseChartOptions {
  yAxis?: YAxisOptions | [YAxisOptions, YAxisOptions]
}

export function getAreaChartOptions(options?: IAreaChartOptions): ChartOptions {
  const { unit, decimals, legend, yAxis, tooltipFormatter, tooltipData } = options || {} as IAreaChartOptions

  const tooltip: TooltipOptions = tooltipFormatter
    ? {
      customFormatter(pointData, humanizeNum) {
        return tooltipFormatter({ humanizeNum, pointData, tooltipData })
      }
    }
    : {}

  return merge<ChartOptions, ChartOptions, ChartOptions>({}, basicChartOptions, {
    height: 300,
    unit,
    decimals,
    legend,
    yAxis,
    tooltip
  })
}

export interface IBarChartOptions extends IBaseChartOptions {
  categories: string[]
}

export function geBarChartOptions(options?: IBarChartOptions): ChartOptions {
  const { unit, decimals, categories, legend, tooltipFormatter, tooltipData } = options || {} as IBarChartOptions

  const tooltip: TooltipOptions = tooltipFormatter
    ? {
      customFormatter(pointData, humanizeNum) {
        return tooltipFormatter({ humanizeNum, pointData, tooltipData })
      }
    }
    : {}
  return merge<ChartOptions, ChartOptions, ChartOptions>({}, basicChartOptions, {
    height: 560,
    unit,
    decimals,
    legend,
    tooltip,
    xAxis: {
      categories
    }
  })
}

export interface IPieChartOptions extends IBaseChartOptions {}

export function getPieChartOptions(options?: IPieChartOptions): ChartOptions {
  const { unit, decimals, legend, tooltipFormatter, tooltipData } = options || {} as IPieChartOptions

  const tooltip: TooltipOptions = tooltipFormatter
    ? {
      customFormatter(pointData, humanizeNum) {
        return tooltipFormatter({ humanizeNum, pointData, tooltipData })
      }
    }
    : {}
  return merge<ChartOptions, ChartOptions, ChartOptions>({}, basicChartOptions, {
    height: 360,
    unit,
    decimals,
    legend,
    tooltip
  })
}

export type CSVDataType = { [key: string]: string | number | undefined | null }

export enum XAxisType {
  DateTime = 'dateTime',
  Category = 'category'
}

export const xAxisTextMap = {
  [XAxisType.DateTime]: 'DateTime',
  [XAxisType.Category]: 'Category'
}

/**
 * 根据 LineChart / AreaChart / PieChart series 数据来计算导出到 csv 的数据
 */
export function getChartCSVData(seriesData: ISeriesData[], xAxis = XAxisType.DateTime): CSVDataType[] {
  if (seriesData == null || seriesData.length < 1) return []

  const columns = [xAxisTextMap[xAxis]].concat(seriesData.map(series => series.name))
  const [startColumn, ...otherColumns] = seriesData.map(series => series.data)

  return startColumn.map((item, index) => {
    const otherValues = otherColumns.map(column => column[index][1])
    const [xValue, value] = item
    let formattedValue: string | number = ''

    if (xValue) {
      if (xAxis === XAxisType.DateTime) {
        formattedValue = moment(xValue).format('YYYY-MM-DD HH:mm')
      } else if (xAxis === XAxisType.Category) {
        formattedValue = xValue
      }
    }

    return zipObject(columns, [formattedValue, value].concat(otherValues))
  })
}

export const getReqcountUnit = (t: TranslateFn) => (
  reqcountUnit.map(
    ({ name, ...rest }) => ({ ...rest, name: t(name) })
  )
)
