import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import autobind from 'autobind-decorator'

import { injectProps } from 'qn-fe-core/local-store'

import { InteractMarketingApis } from 'apis/interactMarketing'
import { CodeUrl } from 'apis/_types/interfactMarketingType'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'

const downloadJson = (url: string) => {
  const filename = url.split('/').pop() || ''
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const innerUrl = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.setAttribute('href', innerUrl)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.style.display = 'none'
      link.click()
      document.body.removeChild(link)
    })
}

const downloadOnWeb = (url: string) => {
  const filename = url.split('/').pop() || ''

  if (/\.json$/.test(filename)) {
    downloadJson(url)
    return
  }

  const node = document.createElement('iframe')
  node.src = url
  node.style.display = 'none'
  document.body.appendChild(node)
}

@injectable()
export default class DownloadModalStore extends Store {
  constructor(
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore,
    @injectProps() private props: { appId: string }
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }
  @observable.deep urls: CodeUrl = {
    server_fixed_url: '',
    server_url: '',
    android_url: '',
    ios_url: ''
  }
  @action.bound updateUrls(urls: CodeUrl) {
    this.urls = urls
  }

  @observable projectInfo: ProjectInfo = {
    name: '',
    description: '',
    sceneType: 0,
    appId: '',
    createTime: Date.now(),
    platform: []
  }
  @action.bound updateProjectInfo(value: ProjectInfo) {
    this.projectInfo = value
  }
  @computed get platform(): Array<'Android' | 'iOS'> {
    const result: Array<'Android' | 'iOS'> = []
    if (this.selectedUrlTypes.includes('android_url')) {
      result.push('Android')
    }
    if (this.selectedUrlTypes.includes('ios_url')) {
      result.push('iOS')
    }
    return result
  }

  @observable selectedUrlTypes: string[] = []
  @action.bound updateSelectedUrls(list: string[]) {
    this.selectedUrlTypes = list
  }
  @action.bound clearSelectedUrls() {
    this.selectedUrlTypes = []
  }

  @autobind
  createProject() {
    this.projectInfo.platform = this.platform
    window.postMessage(
      {
        type: 'createProject',
        data: {
          name: 'name',
          description: 'description',
          sceneType: 1,
          appId: 'clearslkdfjlkj239r',
          createTime: Date.now(),
          platform: ['IOS']
        }
      },
      window.location.origin || ''
    )
  }

  @autobind
  download() {
    this.selectedUrlTypes.forEach(urlType => {
      const userAgent = navigator.userAgent.toLowerCase()

      // 如果当前环境是electron
      if (userAgent.indexOf(' electron/') > -1) {
        // 使用electron的下载方法
        window.top?.electronBridgeApi.download(this.urls[urlType])
        // 创建项目
        // TODO: fix
        // this.projectInfo.platform = this.platform
        // window.postMessage(
        //   {
        //     type: 'createProject',
        //     data: this.projectInfo
        //   },
        //   window.location.origin
        // )
      } else {
        // 使用网页端的下载方法
        downloadOnWeb(this.urls[urlType])
      }
    })
  }

  @autobind
  @ToasterStore.handle()
  async fetchAppInfo() {
    if (this.props.appId === '') {
      return
    }
    const data = await this.apis.getAppInfo({ appId: this.props.appId })

    if (data && data.urls) {
      this.updateProjectInfo({
        name: data.appName,
        description: data.appDesc,
        sceneType: data.appScenarios,
        appId: data.appId,
        createTime: Date.now(),
        platform: []
      })
      this.updateUrls(data.urls!)
    }
  }

  init(): void | Promise<void> {
    this.fetchAppInfo()
    this.addDisposer(
      reaction(
        () => this.props.appId,
        () => {
          this.fetchAppInfo()
        }
      )
    )
  }
}
