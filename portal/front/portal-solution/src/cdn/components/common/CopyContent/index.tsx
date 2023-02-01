/**
 * @file component copy content
 * @author linchen <linchen@qiniu.com>
 * @description 在 Popover 内使用该组件需要使用额外的 html element 包装
 * 具体请参考：https://github.com/ant-design/ant-design/issues/15909
 */

import React from 'react'
import cns from 'classnames'
import copy from 'copy-text-to-clipboard'
import { useInjection } from 'qn-fe-core/di'
import Icon from 'react-icecream/lib/icon'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import * as messages from './messages'

import './style.less'

function useCopyContent(content: string) {
  const toasterStore = useInjection(Toaster)

  const handleCopyContent = React.useCallback(() => {
    if (copy(content) === true) {
      toasterStore.success(messages.copySuccess)
    } else {
      toasterStore.error(messages.copyFail)
    }
  }, [content, toasterStore])

  return handleCopyContent
}

export interface ICopyIconProps {
  content: string
  className?: string
}

export function CopyIconContent(props: ICopyIconProps) {
  const handleCopyContent = useCopyContent(props.content)

  return (
    <Icon
      type="copy"
      onClick={handleCopyContent}
      className={cns('comp-copy-icon-content', props.className)}
    />
  )
}

export interface IProps {
  title: string
  content: string
  className?: string
}

export default function CopyLinkContent(props: IProps) {
  const handleCopyContent = useCopyContent(props.content)

  return (
    <a
      className={cns('comp-copy-link-content', props.className)}
      onClick={handleCopyContent}
    >
      {props.title}
    </a>
  )
}
