/**
 * @file component copy content
 * @author linchen <linchen@qiniu.com>
 * @description 在 Popover 内使用该组件需要使用额外的 html element 包装
 * 具体请参考：https://github.com/ant-design/ant-design/issues/15909
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import copy from 'copy-text-to-clipboard'

function useCopyContent(content: string) {
  const toasterStore = useInjection(Toaster)

  const handleCopyContent = React.useCallback(() => {
    if (copy(content) === true) {
      toasterStore.success('复制成功')
    } else {
      toasterStore.error('复制失败，请手动选中复制')
    }
  }, [content, toasterStore])

  return handleCopyContent
}

export interface IProps {
  title: string
  content: string
  className?: string
}

export default function CopyLinkContent({ content, className, title }: IProps) {
  const handleCopyContent = useCopyContent(content)

  return (
    <a
      className={className}
      onClick={handleCopyContent}
    >
      {title}
    </a>
  )
}
