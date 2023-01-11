/**
 * @file init highcharts options
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as Highcharts from 'highcharts'
import HighchartExporting from 'highcharts/modules/exporting'
import HighchartExportData from 'highcharts/modules/export-data'
import HightchartNoDataToDisplay from 'highcharts/modules/no-data-to-display'
import HighchartsVariablePie from 'highcharts/modules/variable-pie'

export default function initHighchartsOptions() {
  HighchartExporting(Highcharts)
  HighchartExportData(Highcharts)
  HightchartNoDataToDisplay(Highcharts)
  HighchartsVariablePie(Highcharts)

  Highcharts.setOptions({
    global: {
      // Highcharts 中默认开启了UTC（世界标准时间），由于中国所在时区为+8，所以经过 Highcharts 的处理后会减去8个小时
      // 这里把 UTC 关掉
      useUTC: false
    },
    lang: {
      noData: '暂无数据',
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      rangeSelectorZoom: '时间范围',
      loading: '加载中...',
      rangeSelectorFrom: '从',
      rangeSelectorTo: '到',
      resetZoom: '重置'
    }
  })

  // TODO: react highcharts' version
  // ReactHighcharts.withHighcharts(Highcharts)
}
