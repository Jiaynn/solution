/**
 * @file Bucket setting main component
 * @description Bucket 设置主页
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'
import Role from 'portal-base/common/components/Role'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { IRegion } from 'kodo/stores/config/types'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { BucketSettingRole } from 'kodo/constants/role'
import { BucketSettingAnchor } from 'kodo/constants/bucket'
import { bucketSettingGuideName, bucketSettingGuideSteps } from 'kodo/constants/guide'

import { Auth } from 'kodo/components/common/Auth'
import GuideGroup from 'kodo/components/common/Guide'

import Access from './Access'
import StaticPage from './StaticPage'
import OriginalProtected from './OriginalProtected'
import MaxAge from './MaxAge'
import Version from './Version'
import Referrer from './Referrer'
import Encryption from './Encryption'
import Authorization from './Authorization'
import CrossOrigin from './CrossOrigin'
import TagManage from './TagManage'
import Lifecycle from './Lifecycle'
import Source from './Source'
import Censor from './Censor'
import Event from './Event'
import Log from './Log'
import Remark from './Remark'
import Routing from './Routing'
import ObjectLock from './ObjectLock'
import DeleteBucket from './DeleteBucket'
import SMSG from './SMSG'

import styles from './style.m.less'

export interface Props extends IDetailsBaseOptions {
  regionConfig: IRegion | undefined
}

interface DiDeps {
  featureStore: FeatureConfigStore
}

@observer
class InternalSettingMain extends React.Component<Props & DiDeps> {

  componentDidMount() {
    let anchorName = window.location.hash
    if (anchorName) {
      anchorName = anchorName.replace('#', '')
      const anchorElement = document.getElementById(anchorName)
      if (anchorElement) {
        // 查了兼容性，目前主流浏览器支持的都不错
        anchorElement.scrollIntoView()
      }
    }
  }

  @computed
  get originalProtectedEnabled() {
    if (!this.props.regionConfig || !this.props.regionConfig.dora.image.enable) {
      return false
    }

    // 检查 feature
    if (this.props.featureStore.isDisabled('KODO.KODO_IMAGE_PROCESS')) {
      return false
    }

    return true
  }

  render() {
    return (
      <GuideGroup name={bucketSettingGuideName} steps={bucketSettingGuideSteps}>
        <div className={styles.contentBox}>
          <Auth notIamUser>
            <Role name={BucketSettingRole.Access}>
              <div className={styles.cardColumn}>
                <Access {...this.props} />
              </div>
            </Role>
          </Auth>
          <Auth notIamUser>
            <Role name={BucketSettingRole.StaticPage}>
              <div className={styles.cardColumn}>
                <StaticPage {...this.props} />
              </div>
            </Role>
          </Auth>
          {this.props.regionConfig && this.props.regionConfig.objectStorage.bucketRemark.enable && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.Remark}>
                <div className={styles.cardColumn}>
                  <Remark bucketName={this.props.bucketName} />
                </div>
              </Role>
            </Auth>
          )}
          <Auth notIamUser>
            <Role name={BucketSettingRole.MaxAge}>
              <div className={styles.cardColumn}>
                <MaxAge {...this.props} />
              </div>
            </Role>
          </Auth>
          {this.props.regionConfig && this.props.regionConfig.objectStorage.bucketLog.enable && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.Log}>
                <div className={styles.cardColumn}>
                  <Log {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {(this.props.regionConfig && this.props.regionConfig.dora.censor.enable) && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.Censor}>
                <div className={styles.cardColumn}>
                  <Censor {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {this.props.regionConfig && this.props.regionConfig.objectStorage.bucketRoutingRule.enable && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.Routing}>
                <div className={styles.cardColumn} id={BucketSettingAnchor.Routing}>
                  <Routing {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          <Auth notIamUser>
            <Role name={BucketSettingRole.Tag}>
              <div className={styles.cardColumn} id={BucketSettingAnchor.Tag}>
                <TagManage {...this.props} />
              </div>
            </Role>
          </Auth>
          {this.props.regionConfig && this.props.regionConfig.objectStorage.bucketShare.enable && (
            <Auth featureKeys={['KODO.KODO_BUCKET_SHARE']} notIamUser>
              <Role name={BucketSettingRole.Authorization}>
                <div className={styles.cardColumn}>
                  <Authorization {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {this.props.regionConfig && this.props.regionConfig.objectStorage.referrerVerification.enable && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.Referrer}>
                <div className={styles.cardColumn}>
                  <Referrer {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          <Auth notIamUser>
            <Role name={BucketSettingRole.CrossOrigin}>
              <div className={styles.cardColumn}>
                <CrossOrigin {...this.props} />
              </div>
            </Role>
          </Auth>
          <Role name={BucketSettingRole.Lifecycle}>
            <div className={styles.cardColumn}>
              <Lifecycle {...this.props} />
            </div>
          </Role>
          <Role name={BucketSettingRole.Event}>
            <div className={styles.cardColumn}>
              <Event {...this.props} />
            </div>
          </Role>
          <Auth notIamUser>
            <Role name={BucketSettingRole.Source}>
              <div className={styles.cardColumn} id={BucketSettingAnchor.Source}>
                <Source {...this.props} />
              </div>
            </Role>
          </Auth>
          {this.props.regionConfig && this.props.regionConfig.objectStorage.bucketEncryption.enable && (
            <Auth featureKeys={['KODO.KODO_ENCRYPTION']} notIamUser>
              <Role name={BucketSettingRole.Encryption}>
                <div className={styles.cardColumn}>
                  <Encryption {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {this.props.regionConfig && this.props.regionConfig.objectStorage.fileMultiVersion.enable && (
            <Auth featureKeys={['KODO.KODO_VERSION']} notIamUser>
              <Role name={BucketSettingRole.Version}>
                <div className={styles.cardColumn}>
                  <Version {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {(this.props.regionConfig && this.props.regionConfig.objectStorage.worm.enable) && (
            <Auth featureKeys={['KODO.KODO_BUCKET_WORM']} notIamUser>
              <Role name={BucketSettingRole.ObjectLock}>
                <div className={styles.cardColumn}>
                  <ObjectLock {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          {this.originalProtectedEnabled && (
            <Auth notIamUser>
              <Role name={BucketSettingRole.OriginalProtected}>
                <div className={styles.cardColumn}>
                  <OriginalProtected {...this.props} />
                </div>
              </Role>
            </Auth>
          )}
          <Auth featureKeys={['KODO.KODO_STREAM_PUSH']} notIamUser>
            <Role name={BucketSettingRole.StreamMediaStorageGateway}>
              <div className={styles.cardColumn}>
                <SMSG {...this.props} />
              </div>
            </Role>
          </Auth>
          <Role name={BucketSettingRole.DeleteBucket}>
            <div className={styles.cardColumn}>
              <DeleteBucket {...this.props} />
            </div>
          </Role>
        </div>
      </GuideGroup>
    )
  }
}

export default function SettingMain(props: Props) {
  const featureStore = useInjection(FeatureConfigStore)
  return <InternalSettingMain {...props} featureStore={featureStore} />
}
