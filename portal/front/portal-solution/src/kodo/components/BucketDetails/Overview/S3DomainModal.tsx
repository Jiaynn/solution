/**
 * @file component S3Domain 空间概览 s3 域名展示
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Spin, Tooltip, Icon, Modal } from 'react-icecream/lib'

import { BucketListStore } from 'kodo/stores/bucket/list'

import { ConfigStore } from 'kodo/stores/config'

import { DomainStore } from 'kodo/stores/domain'

import { RegionSymbol } from 'kodo/constants/region'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import Prompt from 'kodo/components/common/Prompt'

import styles from './style.m.less'

export interface IProps {
  bucketName: string
  region: RegionSymbol
  visible: boolean
  onClose(): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalS3Domain extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @Toaster.handle()
  fetchBucketBaseInfo(bucketName: string) {
    const bucketListStore = this.props.inject(BucketListStore)
    return bucketListStore.fetchByName(bucketName)
  }

  componentDidMount() {
    this.fetchBucketBaseInfo(this.props.bucketName)
  }

  @computed
  get s3endpoint() {
    const configStore = this.props.inject(ConfigStore)
    const regionConfig = configStore.getRegion({
      region: this.props.region
    })

    if (!regionConfig.objectStorage.domain.awsS3.enable) {
      return null
    }

    return regionConfig.objectStorage.domain.awsS3.sourceHosts[0]
  }

  @computed
  get bucketS3Domain() {
    const bucketListStore = this.props.inject(BucketListStore)
    const bucketBaseInfo = bucketListStore.getByName(this.props.bucketName)
    if (this.s3endpoint != null && bucketBaseInfo != null && bucketBaseInfo.id != null) {
      return `${bucketBaseInfo.id}.${this.s3endpoint}`
    }
  }

  render() {
    const domainStore = this.props.inject(DomainStore)

    return (
      <Modal
        width={560}
        onCancel={this.props.onClose}
        visible={this.props.visible}
        title="S3 域名"
        footer={null}
      >
        <div className={styles.s3Box}>
          <Spin spinning={domainStore.isLoadingS3}>
            <Prompt type="assist">
              空间的 S3 域名仅限通过 AWS S3 兼容 api 对接时使用，且通过该域名访问空间时将产生
              <span className={styles.externalFlow}>外网流出流量</span>。
              <HelpDocLink doc="s3AWS">
                了解 AWS S3 兼容详情。
              </HelpDocLink>
            </Prompt>
            <div className={styles.item}>
              <span>Endpoint（区域节点）：</span>
              <span>{this.s3endpoint || '--'}</span>
            </div>
            <div className={styles.item}>
              <span>
                空间域名
                <Tooltip
                  placement="top"
                  overlayClassName={styles.tooltip}
                  title="s3 域名格式为 <s3空间名>.endpoint，其中 s3 空间名全局唯一（遵循s3协议的要求）。
                  空间名称全局唯一时，s3 空间名=空间名称；空间名称全局不唯一时，系统会为空间自动生成一个 s3 空间名。"
                >
                  <Icon type="question-circle" />
                </Tooltip>
                ：
              </span>
              <span>{this.bucketS3Domain || '--'}</span>
            </div>
          </Spin>
        </div>
      </Modal>
    )
  }
}

export default function S3Domain(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalS3Domain {...props} inject={inject} />
    )} />
  )
}
