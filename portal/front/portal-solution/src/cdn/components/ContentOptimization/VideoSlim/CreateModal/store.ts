/**
 * @desc store for 添加视频瘦身任务 Modal Store
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { computed, observable, action, reaction, autorun } from 'mobx'
import moment from 'moment'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { getLatestDuration } from 'cdn/transforms/datetime'

import VideoSlimApis, { IVideoFile, IEffect, ICreateVideoSlimTasksReq } from 'cdn/apis/video-slim'
import * as taskForm from './form'

import { IProps } from '.'

export { AddFileMode, transformValueForSubmit } from './form'

enum Loading {
  AddVideoSlimFile = 'AddVideoSlimFile',
  FetchTopFiles = 'FetchTopFiles'
}

const TOP_N = 50

@injectable()
export class LocalStore extends Store {
  loadings = new Loadings()

  constructor(
    @injectProps() private props: IProps,
    private toasterStore: ToasterStore,
    private videoSlimApis: VideoSlimApis
  ) {
    super()
  }

  @computed get isFetchingTopFiles() {
    return this.loadings.isLoading(Loading.FetchTopFiles)
  }

  // 添加瘦身任务的表单
  @observable.ref form = taskForm.createState()

  @computed get value() {
    return taskForm.getValue(this.form)
  }

  @observable.ref topFiles: IVideoFile[] = []

  @action updateTopFiles(files: IVideoFile[] = []) {
    this.topFiles = files.sort((a, b) => +a.slimed - +b.slimed)
  }

  fetchTopFilesList(domain: string) {
    const [startDate, endDate] = getLatestDuration(moment(), 2, 'd')
    const req = this.videoSlimApis.getTopNVideoFiles({
      domain,
      startDate,
      endDate,
      topN: TOP_N
    }).then(
      (files: IVideoFile[]) => this.updateTopFiles(files)
    )

    return this.loadings.promise(Loading.FetchTopFiles, req)
  }

  doSubmit(value: ICreateVideoSlimTasksReq) {
    const req = this.videoSlimApis.createVideoSlimTasks(value).then(
      result => handleOperationResult(this.toasterStore, result, '添加视频瘦身任务')
    )
    return this.loadings.promise(Loading.AddVideoSlimFile, req)
  }

  @action resetForm(value?: Partial<taskForm.IValue>) {
    this.form = taskForm.createState(value)
  }

  @observable bucketName?: string
  @action updateBucketName(name: string) {
    this.bucketName = name
  }

  init() {
    this.addDisposer(autorun(() => this.addDisposer(this.form.dispose)))
    this.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          // 每次打开 Modal，就重置 form & fetch 热点视频列表
          this.resetForm()
          if (this.props.domain) {
            this.fetchTopFilesList(this.props.domain)
          }
        }
      },
      { fireImmediately: true }
    ))
  }
}

export function handleOperationResult(toasterStore: ToasterStore, result: IEffect<any>, desc: string) { // TODO: 更详细的展示
  const { success, failed } = result
  if (!failed || failed.length === 0) {
    return toasterStore.success(`${desc}成功`)
  }
  if (!success || success.length === 0) {
    return Promise.reject(`${desc}失败`)
  }
  return toasterStore.success(`${desc} ${success.length} 个成功，${failed.length} 个失败`)
}
