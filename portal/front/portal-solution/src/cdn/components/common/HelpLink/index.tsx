/**
 * @file help link wrapper
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { isOEM } from 'cdn/constants/env'

export interface IProps {
  href: string
  className?: string
  oemHref?: string
  children?: React.ReactNode
}

export default function HelpLink(props: IProps) {
  const { href, oemHref, className, children = '帮助文档' } = props

  if (isOEM) {
    return (
      oemHref != null
      ? <a className={className} target="_blank" rel="noopener" href={oemHref}>{children}</a>
      : null
    )
  }
  return <a className={className} target="_blank" rel="noopener" href={href}>{children}</a>
}
