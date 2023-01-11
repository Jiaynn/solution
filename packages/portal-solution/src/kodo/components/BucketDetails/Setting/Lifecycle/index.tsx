/**
 * @description Bucket setting lifecycle card
 * @author huangbinjie
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import { KodoIamStore } from 'kodo/stores/iam'

import { getSettingLifecyclePath } from 'kodo/routes/bucket/setting'
import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalEventCard extends React.Component<IProps & DiDeps> {
  iamStore = this.props.inject(KodoIamStore)
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get lifecyclePagePath() {
    return getSettingLifecyclePath(this.props.inject, this.props.bucketName)
  }

  @computed
  get isPermissionDenied() {
    // get & put & delete 三种全部 deny 或者 仅 get deny 情况下设置按钮为 disable
    // 逻辑简化为判断 get 是否 deny
    return this.iamStore.isActionDeny({ actionName: 'GetBucketLifecycle', resource: this.props.bucketName })
  }

  render() {
    return (
      <SettingCard
        className={styles.cardWithEntry}
        title="生命周期设置"
        tooltip="通过规则配置可以定期删除相匹配的文件，及时自动清除不需要的数据。"
        doc="lifecycle"
      >
        <Link to={this.lifecyclePagePath}>
          <Button className={styles.cardOpBtn} {...injectMainBtnClickHookProps('生命周期')} disabled={this.isPermissionDenied}>设置</Button>
        </Link>
      </SettingCard>
    )
  }
}

export default function EventCard(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalEventCard {...props} inject={inject} />
    )} />
  )
}
