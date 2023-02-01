/**
 * @file Bucket setting event card component
 * @description Bucket setting event card
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import { KodoIamStore } from 'kodo/stores/iam'

import { getSettingEventPath } from 'kodo/routes/bucket/setting'
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
  get eventPagePath() {
    return getSettingEventPath(this.props.inject, this.props.bucketName)
  }

  @computed
  get isPermissionDenied() {
    // get & put & delete 三种全部 deny 或者 仅 get deny 情况下设置按钮为 disable
    // 逻辑简化为判断 get 是否 deny
    return this.iamStore.isActionDeny({ actionName: 'GetBucketNotification', resource: this.props.bucketName })
  }
  render() {
    return (
      <SettingCard
        className={styles.cardWithEntry}
        title="事件通知"
        tooltip="通过规则配置，可以及时获得所关心的存储资源操作的消息通知。"
        doc="event"
      >
        <Link to={this.eventPagePath}>
          <Button className={styles.cardOpBtn} {...injectMainBtnClickHookProps('事件通知')} disabled={this.isPermissionDenied}>设置</Button>
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
