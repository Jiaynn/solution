/**
 * @file chart config & options
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as Highcharts from 'highcharts'

import merge from 'kodo/utils/merge'

// https://api.highcharts.com/highcharts/colors
export const highchartsColors = Highcharts.getOptions().colors || [
  '#7cb5ec',
  '#434348',
  '#90ed7d',
  '#f7a35c',
  '#8085e9',
  '#f15c80',
  '#e4d354',
  '#2b908f',
  '#f45b5b',
  '#91e8e1'
]

export const defaultChartHeight = 400

export const totalOfSeriesName = '合计'

export enum Align {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}

export enum VerticalAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom'
}

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Proximate = 'proximate'
}

export interface ISeries {
  name: string
  data: Array<[number, number]>
  fillColor?: Highcharts.GradientColorObject
}

export interface IPointContext {
  isNull: boolean
  color: string
  colorIndex: number
  x: number
  y: number
  series: ISeries
}

export interface ITooltipFormatterContext {
  points: IPointContext[]
  x: number
}

export const fillColor: Highcharts.GradientColorObject = {
  linearGradient: { x1: 0, x2: 1, y1: 0, y2: 1 },
  stops: [
    [0, 'rgba(0,167,225,0.16)'],
    [0.28, 'rgba(0,167,225,0.16)'],
    [1, 'rgba(25,137,250,0.00)']
  ]
}

// 用于分别在图表初始化和重新渲染时，更新默认图例高度
function updateLegendsSymbolHeight(event) {
  const { container, options } = event.target
  if (options.legend.enabled) {
    const elements: NodeListOf<Element> = container.querySelectorAll('.highcharts-legend-item path.highcharts-graph')
    Array.from(elements).forEach(element => element.setAttribute('stroke-width', '4'))
  }
}

export const basicChartOptions: Highcharts.Options = {
  series: [],
  colors: [
    '#00A7E1',
    '#2F7ADA',
    ...highchartsColors
  ],
  chart: {
    width: null,
    height: null,
    zoomType: 'x',
    spacingLeft: 0,
    spacingRight: 0,
    events: {
      load: updateLegendsSymbolHeight,
      redraw: updateLegendsSymbolHeight
    }
  },
  credits: {
    // 默认取消右下角版权信息
    enabled: false
  },
  navigation: {
    buttonOptions: {
      enabled: false
    }
  },
  noData: {
    style: {
      fontSize: '14px'
    }
  },
  tooltip: {
    borderRadius: 4,
    backgroundColor: '#fff',
    shared: true
  },
  title: {
    text: '',
    align: 'center'
  },

  xAxis: {
    crosshair: true,
    type: 'datetime',
    dateTimeLabelFormats: {
      day: '%Y-%m-%d'
    }
  } as Highcharts.XAxisOptions,
  yAxis: {
    crosshair: true,
    offset: -4,
    title: {
      text: null
    },
    labels: {
      y: 0,
      align: 'right'
    }
  },
  plotOptions: {
    series: {
      shadow: false,
      states: {
        hover: {
          halo: {
            size: 0
          }
        }
      },
      marker: {
        radius: 2,
        symbol: 'circle'
      }
    }
  },
  legend: {
    maxHeight: 200,
    navigation: {
      enabled: true
    },
    enabled: true,
    // 考虑到大多数表格图例都在下方，保留图例的默认设置，图例在图表的正下方居中平铺
    layout: Layout.Horizontal,
    align: Align.Center,
    verticalAlign: VerticalAlign.Bottom,
    symbolWidth: 16
  }
}

// 线图基本配置
export const lineChartBaseConfig: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'line',
    width: null,
    height: null
  },
  title: {
    text: '',
    align: 'center'
  },
  plotOptions: {
    series: {
      lineWidth: 1
    }
  },
  legend: {
    y: -30 // 能适应大部分场景，但不适用图例在右侧这种低概率场景，图例在右侧的折线图，应该使用 lineChartLegendRightConfig
  },
  xAxis: {
    labels: {
      y: 30
    }
  }
})

// 线图配置：图例底部居中
export const lineChartLegendBottomConfig: Highcharts.Options = merge(lineChartBaseConfig, {
  chart: {
    spacingBottom: 15
  },
  legend: {
    y: 20
  }
})

// 线图配置：图例右侧居上
export const lineChartLegendRightConfig: Highcharts.Options = merge(lineChartBaseConfig, {
  chart: {
    spacingBottom: 5
  },
  legend: {
    layout: Layout.Vertical,
    align: Align.Right,
    verticalAlign: VerticalAlign.Top,
    y: -10
  }
})

export const pieChartBaseConfig: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'pie'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  legend: {
    y: 20
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      innerSize: '0%',
      showInLegend: true, // 饼图的图例是通过该参数来控制的
      dataLabels: {
        enabled: false
      }
    }
  }
})

// 目前散点图的 tooltip 是无法获得 points 的，所以这里 hack 下：
// 1. chart type 为 line 类型并设置 line-width 为 0
// 2. 通过设置 plotOptions 的 series 中的 marker 来使数据点始终可见
export const scatterChartBaseConfig: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'line'
  },
  legend: {
    layout: Layout.Vertical,
    align: Align.Right,
    verticalAlign: VerticalAlign.Top,
    y: 20
  },
  plotOptions: {
    series: {
      marker: {
        enabled: true,
        radius: 4,
        symbol: 'circle'
      },
      states: {
        hover: {
          lineWidth: 0, // 去除散点图鼠标 hover 上默认的连线效果
          lineWidthPlus: 0 // 最后显示的线宽默认为( lineWidth + lineWidthPlus ),所以两者都要置0
        }
      }
    },
    label: {
      connectorAllowed: false
    },
    line: {
      lineWidth: 0 // make the lines disappear
    }
  }
})

// 曲线图
export const splineChartBaseConfig: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'spline',
    height: 400
  },
  plotOptions: {
    series: {
      lineWidth: 2
    }
  }
})

export const areaSplineChartBase: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'areaspline',
    height: 400
  },
  plotOptions: {
    series: {
      stacking: false
    }
  }
})

export const areaSplineStackedChartBase: Highcharts.Options = merge(basicChartOptions, {
  chart: {
    type: 'areaspline',
    height: 400
  },
  plotOptions: {
    series: {
      stacking: 'normal'
    }
  }
})

export const variablePieChartBase: Highcharts.Options = merge(basicChartOptions, {
  colors: [
    '#819FF7',
    '#33C8EF',
    '#7BD842',
    '#C2E643',
    '#FBCA46',
    '#FB834D',
    '#EB7DC1',
    '#B571F7',
    '#5272F4',
    '#00AAE7',
    '#4BC310',
    '#A0D911'
  ],
  chart: {
    type: 'variablepie'
  }
})

export const columnCharBase: Highcharts.Options = merge(basicChartOptions, {
  colors: ['#819FF7', '#33C8EF', '#7BD842'],
  chart: {
    type: 'column',
    width: 160,
    height: 183
  },
  xAxis: {
    tickColor: '#BFBFBF'
  },
  yAxis: {
    gridLineColor: 'transparent',
    crosshair: false
  },
  plotOptions: {
    column: {
      maxPointWidth: 48
    }
  }
})
