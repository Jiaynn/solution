/**
 * @file component AccelerateDomains 空间概览里的 CDN 加速域名列表
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Icon } from 'react-icecream/lib'
import { Link } from 'portal-base/common/router'
import { SVGIcon } from 'portal-base/common/utils/svg'

import EditSvg from 'kodo/styles/icons/edit.svg'

import { getCDNCreateBucketDomainPath } from 'kodo/routes/cdn'

import { Auth } from 'kodo/components/common/Auth'
import Domains from 'kodo/components/common/AccelerateDomain'

import styles from './style.m.less'

export interface IProps {
  bucketName: string
  fetchDomains(): void
}

function AccelerateDomains(props: IProps) {
  return (
    <div className={styles.acceleratBox}>
      <div className={styles.header}>
        <span className={styles.title}>CDN 加速域名</span>
        <Auth
          notProtectedUser
          render={disabled => (
            <Link
              to={getCDNCreateBucketDomainPath(props.bucketName)}
              disabled={disabled}
              target="_blank"
              rel="noopener"
            >
              <Icon component={() => <SVGIcon className={styles.svgIcon} src={EditSvg} />} />
              自定义域名
            </Link>
          )}
        />
      </div>
      <Domains bucketName={props.bucketName} fetchDomains={props.fetchDomains} scrollHeight={200} />
    </div>
  )
}

export default observer(AccelerateDomains)
