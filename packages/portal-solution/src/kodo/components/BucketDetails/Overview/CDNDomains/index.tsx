/**
 * @file Component CDNDomains
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import classNames from 'classnames'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { DomainStore } from 'kodo/stores/domain'

import TestDomains from './TestDomains'
import AccelerateDomains from './AccelerateDomains'
import styles from './style.m.less'

export interface IProps {
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCDNDomains extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @autobind
  @Toaster.handle()
  fetchDomains() {
    const domainStore = this.props.inject(DomainStore)
    return domainStore.fetchCDNDomainListByBucketName(this.props.bucketName)
  }

  componentDidMount() {
    this.fetchDomains()
  }

  @computed
  get testDomains() {
    const domainStore = this.props.inject(DomainStore)
    return domainStore.getCDNTestDomainListByBucketName(this.props.bucketName) || []
  }

  render() {
    const { bucketName } = this.props
    return (
      <div className={styles.cdnDomain}>
        <div className={classNames(styles.domainBox, this.testDomains.length && styles.gap)}>
          <AccelerateDomains
            bucketName={bucketName}
            fetchDomains={this.fetchDomains}
          />
        </div>
        {
          this.testDomains.length
            ? (<>
              <div className={styles.gapLine}></div>
              <div className={styles.domainBox}>
                <TestDomains bucketName={bucketName} domains={this.testDomains} />
              </div>
            </>)
            : null
        }
      </div>
    )
  }
}

export default function CDNDomains(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCDNDomains {...props} inject={inject} />
    )} />
  )
}
