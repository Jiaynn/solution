import { ChartOptions, PlotPieOptions } from 'react-icecream-charts'

export const basicChartOptions: ChartOptions = {
  tooltip: {
    shared: true,
    xDateFormat: '%Y-%m-%d %H:%M'
  },
  xAxis: {
    type: 'datetime'
  },
  yAxis: {
    decimals: 0
  }
}

export const bandwidthUnit = [
  {
    name: 'bps',
    threshold: 0
  },
  {
    name: 'Kbps',
    threshold: 1000 ** 1
  },
  {
    name: 'Mbps',
    threshold: 1000 ** 2
  }
]

export const flowUnit = [
  {
    name: 'B',
    threshold: 0
  },
  {
    name: 'KB',
    threshold: 1024 ** 1
  },
  {
    name: 'MB',
    threshold: 1024 ** 2
  },
  {
    name: 'GB',
    threshold: 1024 ** 3
  }
]

export const reqcountUnit = [
  {
    name: {
      cn: '次',
      en: ''
    },
    threshold: 0
  },
  {
    name: {
      cn: '千次',
      en: 'thousand'
    },
    threshold: 1000 ** 1
  }
]

export const speedUnit = [
  {
    name: 'B/s',
    threshold: 0
  },
  {
    name: 'KB/s',
    threshold: 1024 ** 1
  },
  {
    name: 'MB/s',
    threshold: 1024 ** 2
  },
  {
    name: 'GB/s',
    threshold: 1024 ** 3
  }
]

export const apmDownloadSpeedUnit = [
  {
    name: 'KB/s',
    threshold: 0
  },
  {
    name: 'MB/s',
    threshold: 1024 ** 1
  },
  {
    name: 'GB/s',
    threshold: 1024 ** 2
  }
]

// 饼图 options 的默认值
export const defaultPieChartOptions: PlotPieOptions = {
  dataLabels: false,
  size: 240,
  innerSize: 160
}
