/**
 * @file Bucket setting default index page component
 * @description Bucket setting default index switch
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import { Switch } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { Auth } from 'kodo/components/common/Auth'

import { DefaultIndexApis } from 'kodo/apis/bucket/setting/default-index'
import { injectMainBtnClickHookProps } from '../Card/sensors'

enum Loading {
  UpdateDefaultIndex = 'UpdateDefaultIndex',
  GetBucketInfo = 'GetBucketInfo'
}

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalDefaultIndexSwitch extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  defaultIndexApis = this.props.inject(DefaultIndexApis)

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @computed get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed get isLoading(): boolean {
    return !this.loadings.isAllFinished()
  }

  @computed get isOn(): boolean {
    return (this.bucketInfo && !this.bucketInfo.no_index_page) || false
  }

  @autobind
  @Loadings.handle(Loading.UpdateDefaultIndex)
  updateDefaultIndex(value: boolean) {
    return this.defaultIndexApis.updateDefaultIndexState(this.props.bucketName, +!value)
  }

  @autobind
  @Loadings.handle(Loading.GetBucketInfo)
  fetchBucketInfo() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @autobind
  @Toaster.handle('更新成功')
  handleSwitch(value: boolean) {
    return this.updateDefaultIndex(value).then(this.fetchBucketInfo)
  }

  render() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            disabled={disabled}
            checked={this.isOn}
            loading={this.isLoading}
            onChange={this.handleSwitch}
            {...injectMainBtnClickHookProps('默认首页')}
          />
        )}
      />
    )
  }

  componentDidMount() {
    this.fetchBucketInfo()
  }
}

export default function DefaultIndexSwitch(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalDefaultIndexSwitch {...props} inject={inject} />
    )} />
  )
}
