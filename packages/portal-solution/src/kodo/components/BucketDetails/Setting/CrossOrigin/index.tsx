/**
 * @description CrossOriginCard card
 * @author yinxulai TODO: add card
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import { IDetailsBaseOptions, getSettingPath } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCrossOriginCard extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get crossOriginPagePath() {
    return getSettingPath(
      this.props.inject,
      { ...this.props, path: '/cross-origin' }
    )
  }

  render() {
    return (
      <SettingCard
        title="跨域设置"
        doc="crossOrigin"
        className={styles.cardWithEntry}
        tooltip="设置 CORS 规则，可以根据需求允许或者拒绝相应的 JavaScript 跨域请求。"
      >
        <Link to={this.crossOriginPagePath}>
          <Button className={styles.cardOpBtn} {...injectMainBtnClickHookProps('跨域设置')}>设置</Button>
        </Link>
      </SettingCard>
    )
  }
}

export default function CrossOriginCard(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCrossOriginCard {...props} inject={inject} />
    )} />
  )
}
