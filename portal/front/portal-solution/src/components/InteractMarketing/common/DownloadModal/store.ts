import { action, makeObservable, observable, reaction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import autobind from 'autobind-decorator'

import { injectProps } from 'qn-fe-core/local-store'

import { InteractMarketingApis } from 'apis/interactMarketing'
import { CodeUrl } from 'apis/_types/interactMarketingType'
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

export const downloadOnWeb = (url: string) => {
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
    sceneType: 1,
    appId: '',
    createTime: Date.now(),
    package: {
      android: {
        fileName: '',
        filePath: ''
      },
      ios: {
        fileName: '',
        filePath: ''
      }
    }
  }

  @action.bound updateAndroid(value: { fileName: string; filePath: string }) {
    this.projectInfo.package.android = value
  }

  @action.bound updateIOS(value: { fileName: string; filePath: string }) {
    this.projectInfo.package.ios = value
  }

  @action.bound updateProjectInfo(value: ProjectInfo) {
    this.projectInfo = value
  }


  @observable selectedUrlTypes: (keyof CodeUrl)[] = []
  @action.bound updateSelectedUrls(list: (keyof CodeUrl)[]) {
    this.selectedUrlTypes = list
  }
  @action.bound clearSelectedUrls() {
    this.selectedUrlTypes = []
  }

  @autobind
  download() {
    this.selectedUrlTypes.forEach(urlType => {
      downloadOnWeb(this.urls[urlType])
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
        sceneType: 1,
        appId: data.appId,
        createTime: data.createTime * 1000, // 从秒转换成毫秒
        package: {
          android: {
            fileName: '',
            filePath: ''
          },
          ios: {
            fileName: '',
            filePath: ''
          }
        }
      })
      this.updateUrls(data.urls)
    }
  }

  init(): void | Promise<void> {
    this.addDisposer(
      reaction(
        () => this.props.appId,
        () => {
          this.fetchAppInfo()
        }
      )
    )
    this.fetchAppInfo()
  }
}
