/**
 * @file component BucketOverview 空间概览
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import OamSvg from 'kodo/styles/icons/fangwen.svg'

import CycleSvg from 'kodo/styles/icons/shengming.svg'

import GroupSvg from 'kodo/styles/icons/kongjian.svg'
import EventSvg from 'kodo/styles/icons/shijian.svg'
import MirrorSvg from 'kodo/styles/icons/mirror.svg'
import S3DomainSvg from 'kodo/styles/icons/s3-domain.svg'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { getSettingPath } from 'kodo/routes/bucket'
import {
  getSettingLifecyclePath, getSettingAuthorizationPath,
  getSettingEventPath
} from 'kodo/routes/bucket/setting'

import { BucketSettingAnchor } from 'kodo/constants/bucket'
import { StorageType } from 'kodo/constants/statistics'

import OverviewStatistics from 'kodo/components/common/OverviewStatistics'
import FtypeTab from 'kodo/components/common/Tabs/FtypeTab'
import { Auth } from 'kodo/components/common/Auth'

import QuickEntry from './QuickEntry'
import Charts from './Charts'
import CDNDomains from './CDNDomains'
import S3DomainModal from './S3DomainModal'
import styles from './style.m.less'

export interface IProps {
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalOverview extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @observable ftype: StorageType = StorageType.Standard
  @observable s3ModalVisible = false

  @computed
  get bucketInfo() {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.getDetailsByName(this.props.bucketName)
  }

  @action.bound
  updateFtype(value: StorageType) {
    this.ftype = value
  }

  @action.bound
  updateS3ModalVisible(visible: boolean) {
    this.s3ModalVisible = visible
  }

  @Toaster.handle()
  fetchBucketByName(bucketName: string) {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.fetchDetailsByName(bucketName)
  }

  componentDidMount() {
    this.fetchBucketByName(this.props.bucketName)
  }

  @computed
  get quickEntryView() {
    const { bucketName } = this.props
    const configStore = this.props.inject(ConfigStore)
    const regionConfig = this.bucketInfo && configStore.getRegion({
      region: this.bucketInfo.region
    })

    return (
      <div className={styles.entryBox}>
        <div className={styles.head}>
          <span>基础配置</span>
        </div>
        <div className={styles.entryLayout}>
          <span className={styles.entryItemGroup}>
            <QuickEntry
              title="访问控制"
              icon={OamSvg}
              path={getSettingPath(this.props.inject, { bucketName })}
            />
            <QuickEntry
              title="生命周期"
              icon={CycleSvg}
              path={getSettingLifecyclePath(this.props.inject, bucketName)}
            />
            {regionConfig && regionConfig.objectStorage.bucketShare.enable && (
              <Auth featureKeys={['KODO.KODO_BUCKET_SHARE']}>
                <QuickEntry
                  title="空间授权"
                  icon={GroupSvg}
                  path={getSettingAuthorizationPath(this.props.inject, bucketName)}
                />
              </Auth>
            )}
            <QuickEntry
              title="事件通知"
              icon={EventSvg}
              path={getSettingEventPath(this.props.inject, bucketName)}
            />
            <QuickEntry
              title="镜像回源"
              icon={MirrorSvg}
              path={getSettingPath(this.props.inject, { bucketName, anchor: BucketSettingAnchor.Source })}
            />
            {regionConfig && regionConfig.objectStorage.domain.awsS3.enable && (
              <QuickEntry
                title="S3 域名"
                linkTitle="点击查看"
                icon={S3DomainSvg}
                onClick={() => this.updateS3ModalVisible(true)}
              />
            )}
          </span>
        </div>
      </div>
    )
  }

  render() {
    const { bucketName } = this.props
    const configStore = this.props.inject(ConfigStore)

    const globalConfig = configStore.getFull()
    const regionConfig = this.bucketInfo && configStore.getRegion({
      region: this.bucketInfo.region
    })

    const isCdnDomainEnable = globalConfig.fusion.domain.enable
    const isSourceS3DomainEnable = regionConfig
      && regionConfig.objectStorage.domain.awsS3.enable

    return (
      <div className={styles.main}>
        {isCdnDomainEnable && (
          <Auth featureKeys={['KODO.KODO_DOMAIN_SETTING']} notIamUser>
            <div className={styles.CDNDomainBox}>
              <CDNDomains bucketName={bucketName} />
            </div>
          </Auth>
        )}
        <div className={styles.frontBox}>
          <Auth featureKeys={['KODO.KODO_BUCKET_SETTING']} notIamUser>
            {this.quickEntryView}
          </Auth>
          {isSourceS3DomainEnable && (
            <S3DomainModal
              bucketName={bucketName}
              visible={this.s3ModalVisible}
              region={this.bucketInfo!.region}
              onClose={() => this.updateS3ModalVisible(false)}
            />
          )}
        </div>
        <div className={styles.ftypeBox}>
          <FtypeTab onChange={this.updateFtype} value={this.ftype} />
        </div>
        <OverviewStatistics
          {...this.props}
          ftype={this.ftype}
          region={this.bucketInfo && this.bucketInfo.region}
        />
        <Charts
          {...this.props}
          ftype={this.ftype}
          region={this.bucketInfo && this.bucketInfo.region}
        />
      </div>
    )
  }
}

export default function Overview(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalOverview {...props} inject={inject} />
    )} />
  )
}
