/**
 * @desc StateStore for 数据统计 - 视频瘦身 - 使用统计
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { observable, action, computed, reaction } from 'mobx'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { I18nStore } from 'portal-base/common/i18n'

import { exportCSVFile } from 'cdn/utils/csv'

import { isOptionsValid, getExportName, transformNormalLineSeries } from 'cdn/transforms/statistics'
import { getChartCSVData, getAreaChartOptions, getReqcountUnit } from 'cdn/transforms/chart'
import { humanizeDuration } from 'cdn/transforms/unit'

import { SearchType } from 'cdn/constants/statistics'

import StatisticsApis, {
  IVideoSlimOptions,
  IVideoSlimUsageTimelineData,
  IVideoSlimUsageValue
} from 'cdn/apis/statistics'
import VideoSlimApis from 'cdn/apis/video-slim'

import { TasksStore, videoSlimUsageSpecificOptions } from './tasks'
import { IProps } from '.'

export enum Loading {
  Timeline = 'Timeline'
}

@injectable()
export default class LocalStore extends Store {
  loadings = new Loadings()

  constructor(
    @injectProps() private props: IProps,
    private statisticsApis: StatisticsApis,
    private videoSlimApis: VideoSlimApis,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isTimelineLoading() {
    return this.loadings.isLoading(Loading.Timeline)
  }

  // =============== data for 线图 & 总计 ================

  @observable.ref timelineData!: Omit<IVideoSlimUsageTimelineData, 'total'>
  @observable.ref summary!: IVideoSlimUsageValue

  @computed get isTimelineDataEmpty() {
    return isEmpty(this.timelineData) || isEmpty(this.timelineData.time) || isEmpty(this.timelineData.value)
  }

  @action updateTimelineDataAndSummary(data: IVideoSlimUsageTimelineData) {
    const { time, value, total } = data || {} as IVideoSlimUsageTimelineData
    this.timelineData = {
      time: time || [],
      value: value || []
    }
    this.summary = total
  }

  @computed get exportName() {
    return getExportName(
      this.props.options.startDate,
      this.props.options.endDate,
      '视频瘦身使用统计'
    )
  }

  @computed get seriesData() {
    return getLineSeries(this.timelineData)
      .map(({ name, ...rest }) => ({ ...rest, name: this.i18n.t(name) }))
  }

  @computed get chartOptions() {
    return getAreaChartOptions({
      unit: getReqcountUnit(this.i18n.t),
      decimals: 3,
      tooltipFormatter({ humanizeNum, pointData, tooltipData }) {
        const { index, value } = pointData
        const result = [
          `瘦身次数: ${humanizeNum(value)}`,
          `2K 时长: ${humanizeDuration(tooltipData[index].time2K)}`,
          `HD 时长: ${humanizeDuration(tooltipData[index].timeHD)}`,
          `SD 时长: ${humanizeDuration(tooltipData[index].timeSD)}`
        ]
        return result.join('<br/>')
      },
      tooltipData: this.timelineData && this.timelineData.value
    })
  }

  // =============== data for 表格 及其控制 ================

  tasksStore = new TasksStore(
    () => this.props.options,
    this.videoSlimApis
  )

  @computed get isTableLoading() {
    return this.tasksStore.isLoading
  }

  @computed get paginationInfo() {
    return {
      ...this.tasksStore.paginationStore.info,
      onChange: (page: number) => {
        this.tasksStore.paginationStore.updateCurrent(page)
        this.tasksStore.fetchList()
      }
    }
  }

  @autobind
  exportCSV() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  // =============== 请求数据相关逻辑 ================

  @ToasterStore.handle()
  fetchTimeline(options: IVideoSlimOptions) {
    const req = this.statisticsApis.fetchVideoSlimUsageTimeline({
      ...options,
      ...videoSlimUsageSpecificOptions
    }).then(
      res => this.updateTimelineDataAndSummary(res)
    )
    return this.loadings.promise(Loading.Timeline, req)
  }

  @ToasterStore.handle()
  fetchTasks() {
    this.tasksStore.resetParams()
    return this.tasksStore.fetchList()
  }

  init() {
    this.addDisposer(this.tasksStore.dispose)
    this.addDisposer(reaction(
      () => this.props.options,
      options => {
        if (!isOptionsValid(options, SearchType.VideoSlim)) {
          return
        }
        this.fetchTimeline(options)
        this.fetchTasks()
      },
      { fireImmediately: true }
    ))
  }
}

const slimCountMsg = {
  cn: '瘦身次数',
  en: 'Slimming times'
}

function getLineSeries(data: Omit<IVideoSlimUsageTimelineData, 'total'>) {
  if (isEmpty(data) || data.time.length !== data.value.length) {
    return []
  }
  return transformNormalLineSeries({
    time: data.time,
    value: data.value.map(v => v.slimCount)
  },
  () => slimCountMsg)
}
