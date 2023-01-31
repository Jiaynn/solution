/**
 * @file Domain component
 * @description 域名管理
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { ConfigStore } from 'kodo/stores/config'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { Auth } from 'kodo/components/common/Auth'

import CDN from './CDN'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

export default observer(function Domain(props: IProps) {
  const configStore = useInjection(ConfigStore)
  const globalConfig = configStore.getFull()

  return (
    <div className={styles.domainCards}>
      {globalConfig.fusion.domain.enable && (
        <Auth featureKeys={['KODO.KODO_DOMAIN_SETTING']}>
          <div>
            <CDN {...props} />
          </div>
        </Auth>
      )}
    </div>
  )
})
