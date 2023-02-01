/**
 * @file component QuickEntry of Overview 空间概览里的快速入口
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { Icon, Button } from 'react-icecream/lib'
import { SVGIcon, SvgComponent } from 'portal-base/common/utils/svg'
import { Link } from 'portal-base/common/router'

import styles from './style.m.less'

export interface IProps {
  icon: string | SvgComponent
  title: string
  path?: string
  linkTitle?: string
  onClick?: () => void
}

export default function QuickEntry(props: IProps) {
  return (
    <Link className={styles.entryItem} to={props.path || ''} onClick={e => !props.path && e.preventDefault()}>
      <div className={styles.icon}>
        <Icon component={() => <SVGIcon className={styles.svgIcon} src={props.icon} />} />
      </div>
      <div className={styles.leftGap}>
        <div className={styles.entryTitle}>{props.title}</div>
        <div className={styles.entryRoute}>
          <Button type="link" {...props.onClick && { onClick: props.onClick }}>
            {props.linkTitle ? props.linkTitle : '点击进入'}
          </Button>
        </div>
      </div>
    </Link>
  )
}
