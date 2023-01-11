/**
 * @file component BatchFileOperation
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { CSVLink } from 'react-csv'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Button, Dropdown, Icon, Menu, Tooltip } from 'react-icecream/lib'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getKeyAndVersion, getOriginalKey, getResourceProxyUrl } from 'kodo/transforms/bucket/resource'

import { ConfigStore } from 'kodo/stores/config'

import { FileStatus } from 'kodo/constants/bucket/resource'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import Store, { IFileInfo } from './store'
import styles from './style.m.less'

export interface IProps {
  store: Store
  bucketName: string

  onDelete(): void
}

export interface ICSVData {
  object: string
  url: string
}

export type DownLoadData = string

@observer
class InternalBatchFileOperation extends React.Component<IProps & {
  inject: InjectFunc
}> {
  disposable = new Disposable()
  configStore = this.props.inject(ConfigStore)
  constructor(
    props: IProps & {
      inject: InjectFunc
    }
  ) {
    super(props)
    makeObservable(this)
  }

  // 暂不调用
  doBatchDownload(data: string[]) {
    const box = document.createElement('div')
    box.setAttribute('data-role', 'download')

    data.forEach(url => {
      const iframe = document.createElement('iframe')
      iframe.style.height = '0'
      iframe.src = url
      box.appendChild(iframe)
    })

    document.body.appendChild(box)

    // 本来是想在 iframe 的 onload 方法里做清除工作，但经测试发现 onload 方法在不同浏览器的表现不一样
    // chrome 错误的时候会触发，成功下载不触发；firefox 不管错误和成功都会触发，safari 的表现跟 chrome 一样
    // 就目前情况，没有有效和稳定的办法知道各自任务的下载情况，同时触发下载后 iframe 就没有作用了
    // 这里对 iframe 的清除放到组件卸载后做
    this.disposable.addDisposer(() => {
      box.remove()
    })
  }

  getTargetFileData(decoratedKey: string): IFileInfo | null {
    const originalKey = getOriginalKey(decoratedKey)
    const { versionFileMap, newFiles, fileList, isShowingVersion } = this.props.store

    if (!isShowingVersion) {
      return fileList.find(item => item.key === originalKey) || null
    }

    const versionKey = getKeyAndVersion(originalKey)
    const versionFiles = versionFileMap.get(versionKey.key)

    if (versionFiles && versionFiles.length > 0) {
      const target = versionFiles.find(file => file.version === versionKey.version)
      if (target) {
        return target
      }
    }

    // 如果在 versionFileMap 里找不到说明是选的是新上传 newFiles 里的数据
    return newFiles.find(file => file.version === versionKey.version) || null
  }

  @autobind
  handleDownload() {
    const { selectedRowKeys, bucketInfo } = this.props.store

    const downloadUrlData: DownLoadData[] = selectedRowKeys.reduce<string[]>(
      (list, currentFileKey) => {
        const fileInfo = this.getTargetFileData(currentFileKey)!

        if (fileInfo.status !== FileStatus.Disabled) {
          list.push(fileInfo.download_url)
        }

        return list
      },
      []
    )

    // 公司的测试域名目前是 http 协议的，用户的自定义域名也可能是 http 协议，
    // 而 portal 站点是 https，iframe 的加载会被浏览器 block 住，
    // 所以目前采用改成原始的 window.open 方法进行批量处理代替本来以 iframe 处理的 doBatchDownload
    downloadUrlData.forEach(url => {
      // 注意目前我们通过 portal-proxy 对下载请求进行了代理，因此上边提到的 HTTPS 的问题不存在了
      // 不过因为 iframe 的方式还有别的缺陷（详见 https://github.com/qbox/kodo-web/pull/980#issuecomment-879541400 ），
      // 这里继续保持 window.open 的方式，待上述缺陷解决后再改成 iframe 方式
      window.open(getResourceProxyUrl(this.configStore, url, bucketInfo!.region))
    })
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get csvData() {
    const data: Array<{ object: string, url: string }> = []
    const { selectedRowKeys } = this.props.store

    selectedRowKeys.forEach(decoratedKey => {
      const targetFile = this.getTargetFileData(decoratedKey)!

      if (targetFile.status !== FileStatus.Disabled) {
        data.push({
          object: targetFile.key,
          url: targetFile.preview_url
        })
      }
    })

    return data
  }

  @computed
  get isAllOperationDisabled() {
    const { shouldShowDownloadMenu, shouldShowCopyLinkMenu, shouldShowDeleteMenu } = this.props.store
    return !shouldShowDownloadMenu && !shouldShowCopyLinkMenu && !shouldShowDeleteMenu
  }

  @computed
  get isDisabled() {
    return this.props.store.selectedRowKeys.length === 0 || this.isAllOperationDisabled
  }

  @computed
  get menuView() {
    const { shouldShowDownloadMenu, shouldShowCopyLinkMenu, shouldShowDeleteMenu } = this.props.store
    return (
      <Menu>
        {
          shouldShowDownloadMenu && (
            <Menu.Item
              {...sensorsTagFlag('batch-file-operation', 'download')}
              onClick={this.handleDownload}
            >
              下载
              {/* 阻止 Tooltip 的点击事件被 Menu.Item 响应 */}
              <span onClick={e => e.stopPropagation()} className={styles.downloadIcon}>
                <Tooltip
                  title={<>
                    批量下载，需要在浏览器设置允许打开新弹出窗口。
                    <HelpDocLink doc="batchDownload">
                      了解详情
                    </HelpDocLink>
                  </>}
                >
                  <Icon type="question-circle" />
                </Tooltip>
              </span>
            </Menu.Item>
          )
        }
        {
          shouldShowCopyLinkMenu && (
            <Menu.Item>
              <CSVLink
                {...sensorsTagFlag('batch-file-operation', 'export-urls')}
                filename={'export_urls_' + moment().format('YYYY-MM-DD-HH-mm-ss')}
                data={this.csvData}
              >
                导出 URL
              </CSVLink>
            </Menu.Item>
          )
        }
        {
          shouldShowDeleteMenu && (
            <Menu.Item {...sensorsTagFlag('batch-file-operation', 'delete')} onClick={this.props.onDelete}>
              删除文件
            </Menu.Item>
          )
        }
      </Menu>
    )
  }

  render() {
    return (
      <Dropdown overlay={this.menuView} placement="bottomCenter" disabled={this.isDisabled}>
        <Button>批量操作<Icon type="down" className={styles.dropdown} /></Button>
      </Dropdown>
    )
  }
}

export default function BatchFileOperation(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalBatchFileOperation {...props} inject={inject} />
    )} />
  )
}
