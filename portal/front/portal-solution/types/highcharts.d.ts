/**
 * @file support highchart.d.ts
 * @author zhangheng <zhangheng01@qiniu.com>
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Highcharts from 'highcharts'

declare module 'highcharts' {
  export interface Chart {
    downloadCSV: () => void
  }
}
