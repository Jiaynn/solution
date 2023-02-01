/**
 * @file BackButton component
 * @description BackButton
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore, Link } from 'portal-base/common/router'
import { Icon } from 'react-icecream/lib'

import styles from './style.m.less'

export default function BackButton(props: { path?: string }) {
  const routerStore = useInjection(RouterStore)

  const linkProps = props.path
    ? { to: props.path }
    : { to: '', onClick: e => { e.preventDefault(); routerStore.goBack() } }

  return (
    <Link
      {...linkProps}
      className={styles.link}
    >
      {/* TODO: icecream icon bug, svg 不支持 color */}
      <Icon
        type="left"
        className={styles.icon}
      />
      返回
    </Link>
  )
}
