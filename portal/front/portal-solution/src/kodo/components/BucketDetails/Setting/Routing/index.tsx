import * as React from 'react'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'
import { Button } from 'react-icecream-2'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getSettingRoutingPath } from 'kodo/routes/bucket/setting'
import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'

import styles from './style.m.less'

interface Props extends IDetailsBaseOptions { }
interface DiDeps {
  inject: InjectFunc
}

const InternalRoutingSettingCard = observer(function InternalRoutingSettingCard(props: Props & DiDeps) {
  const routingPagePath = getSettingRoutingPath(props.inject, props.bucketName)
  return (
    <>
      <SettingCard
        title="重定向"
        doc="routingRuleDetail"
        tooltip="可以实现请求者访问空间并触发指定的条件时，按⾃定义的跳转规则进⾏重定向"
        className={styles.card}
      >
        <Link to={routingPagePath}>
          <Button {...sensorsTagFlag('portalKodo@bucketSetting', 'routing')}>
            设置
          </Button>
        </Link>
      </SettingCard>
    </>
  )
})

export default function RoutingSettingCard(props: Props) {
  return (
    <Inject render={({ inject }) => (
      <InternalRoutingSettingCard {...props} inject={inject} />
    )} />
  )
}
