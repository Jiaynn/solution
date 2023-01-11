/**
 * @file component TestDomains 空间概览里的 CDN 测试域名列表
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { Icon } from 'react-icecream/lib'
import { observer } from 'mobx-react'
import { Link } from 'portal-base/common/router'

import { ICDNDomain } from 'kodo/stores/domain'

import { getCDNDomainDetailPath } from 'kodo/routes/cdn'

import { CDNDomainStatus } from 'kodo/constants/domain'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import styles from './style.m.less'

export interface IProps {
  bucketName: string
  domains: ICDNDomain[]
}

function TestDomains(props: IProps) {
  return (
    <div className={styles.testBox}>
      <div className={styles.header}>
        <span className={styles.title}>CDN 测试域名</span>
      </div>
      <div className={styles.testWarning}>
        <span className={styles.icon}><Icon type="exclamation-circle" /></span>
        <p>
          七牛融合 CDN 测试域名（以 clouddn.com/qiniucdn.com/qnssl.com/qbox.me 结尾），每个域名每日限回源总流量 10GB，每个测试域名自创建起
          <span>30个自然日后系统会自动回收，</span>仅供测试使用并且不支持 Https 访问，详情查看
          <HelpDocLink doc="testDomainAccessRestrictionRules">
            七牛测试域名使用规范。
          </HelpDocLink>
          点击下列域名可查看每个域名剩余回收时间。
        </p>
      </div>
      <ul>
        {
          props.domains.map(domain => (
            <li className={styles.testDomain} key={domain.name}>
              <Link to={getCDNDomainDetailPath(domain.name)} target="_blank" rel="noopener">
                {domain.operatingState === CDNDomainStatus.Frozen ? domain.name + '（已冻结）' : domain.name}
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default observer(TestDomains)
