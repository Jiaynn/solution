/**
 * @file HelpDocLink component
 * @description HelpDocLink 组件
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { Link, ILinkProps } from 'portal-base/common/router'

import { HelpDocumentKey } from 'kodo/stores/config/types'
import { ConfigStore } from 'kodo/stores/config'

export interface IProps extends Omit<ILinkProps, 'to'> {
  doc: HelpDocumentKey
  anchor?: string
}

export default function HelpDocLink(props: IProps) {
  const configStore = useInjection(ConfigStore)
  const { doc, anchor = '', children, ...others } = props
  const globalConfig = configStore.getFull()
  const docUrl = globalConfig.documentUrls[doc]

  // eslint-disable-next-line multiline-ternary
  return docUrl ? (
    <Link
      rel="noopener"
      target="_blank"
      {...others}
      to={docUrl + anchor}
    >
      {children}
    </Link>
  ) : null
}
