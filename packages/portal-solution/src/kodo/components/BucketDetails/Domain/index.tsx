/**
 * @file Domain component
 * @description 域名管理
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { Auth } from 'kodo/components/common/Auth'

import Card from './Card'

import CDN from './CDN'
import Source from './Source'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

export default observer(function Domain(props: IProps) {
  const { bucketName } = props
  const bucketStore = useInjection(BucketStore)
  const configStore = useInjection(ConfigStore)
  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  const globalConfig = configStore.getFull()
  const regionConfig = bucketInfo && configStore.getRegion({ region: bucketInfo.region })

  return (
    <div className={styles.domainCards}>
      {globalConfig.fusion.domain.enable && (
        <Auth featureKeys={['KODO.KODO_DOMAIN_SETTING']}>
          <Card
            doc="domain"
            title="自定义 CDN 加速域名"
            description="为空间绑定自定义 CDN 加速域名，通过 CDN 边缘节点缓存数据，提高存储空间内的文件访问响应速度。"
          >
            <CDN {...props} />
          </Card>
        </Auth>
      )}
      {(bucketInfo && regionConfig!.objectStorage.domain.enable) && (
        <Auth featureKeys={['KODO.KODO_SOURCE_DOMAIN']}>
          <Card
            doc="domain"
            title="自定义源站域名"
            description={regionConfig!.objectStorage.domain.description}
          >
            <Source region={bucketInfo.region} {...props} />
          </Card>
        </Auth>
      )}
    </div>
  )
})
