/**
 * @file Link Prevent Default
 * @author linchen <gakiclin@gmail.com>
 * @description
 * 这个组件是为了在不需要超链接（to）前提下，模拟 portal-base 2.x 版本的 Router Link
 * 组件正常状态下没有样式，禁用状态下的样式参考自：
 * https://github.com/qbox/portal-base/blob/v2.x/common/components/Router/Link/style.less
 */

import classNames from 'classnames'
import React, { useCallback, MouseEvent, AnchorHTMLAttributes } from 'react'

import styles from './style.m.less'

type AnchorClick = MouseEvent<HTMLAnchorElement>

export interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  // 是否禁用
  disabled?: boolean
}

export default function LegacyLink(props: Props) {
  const { disabled, className, ...propsForAnchor } = props

  const handleClick = useCallback((e: AnchorClick) => {
    e.preventDefault()
    if (!disabled) {
      props.onClick?.(e)
    }
  }, [props, disabled])

  return (
    <a
      className={classNames(className, styles.link, disabled && styles.linkDisabled)}
      {...propsForAnchor}
      onClick={handleClick}
    />
  )
}
