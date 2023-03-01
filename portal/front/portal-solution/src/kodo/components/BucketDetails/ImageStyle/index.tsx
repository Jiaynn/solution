/**
 * @file Component ImageStyleContent
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Spin } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { BucketStore, Loading } from 'kodo/stores/bucket'

import { IDetailsBaseOptions as IProps } from 'kodo/routes/bucket'
import Image from './Image'

import styles from './style.m.less'

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalImageStyleContent extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @autobind
  @Toaster.handle()
  fetchBucketInfo() {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @computed
  get isLoading() {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.isLoading(Loading.Details)
  }

  componentDidMount() {
    this.fetchBucketInfo()
  }

  render() {
    return (
      <Spin spinning={this.isLoading}>
        <div className={styles.styleContent}>
          <div className={styles.styleImage}>
            <Image
              bucketName={this.props.bucketName}
              drawerVisible={false}
              onUpdate={this.fetchBucketInfo}
            />
          </div>
        </div>
      </Spin>
    )
  }
}

export default function ImageStyleContent(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalImageStyleContent {...props} inject={inject} />
    )} />
  )
}
