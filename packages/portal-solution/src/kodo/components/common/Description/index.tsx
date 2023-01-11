/**
 * @file component Description
 * @description 将 html 字符串渲染为 ReactElement，并对一些特定语法进行支持
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'

import { ConfigStore } from 'kodo/stores/config'

import { useReplacement } from '../MagicVarsProvider'

function replaceDocHref(configStore: ConfigStore, href: string): string {
  if (!href.includes('://')) return href

  const [protocol, host] = href.split('://')

  // doc://docKey 使用内置的文档链接
  if (protocol.toLocaleLowerCase() === 'doc' && host != null) {
    const globalConfig = configStore.getFull()
    const docUrl = globalConfig.documentUrls[host]
    return docUrl || href
  }

  return href
}

export interface IProps {
  dangerouslyText: string

  className?: string
  tag?: string
}

export function Description(props: IProps): React.ReactElement {
  const configStore = useInjection(ConfigStore)

  const tag = props.tag || 'span'
  const text = useReplacement(props.dangerouslyText)

  const innerHTML = React.useMemo(() => {
    if (text == null) {
      return null
    }

    const element = document.createElement('section')
    element.innerHTML = text

    // TODO: a 替换成 Link
    const aTagList = Array.from(element.getElementsByTagName('a'))
    aTagList.forEach(aTag => {
      if (aTag.href) {
        aTag.href = replaceDocHref(configStore, aTag.href)
      }

      const relItem = aTag.getAttribute('rel')
      if (relItem == null) {
        aTag.setAttribute('rel', 'noopener')
      }

      const targetItem = aTag.getAttribute('target')
      if (targetItem == null) {
        aTag.setAttribute('target', '_blank')
      }
    })

    return element.innerHTML
  }, [configStore, text])

  const rcElement = React.createElement(tag, {
    className: props.className,
    dangerouslySetInnerHTML: {
      __html: innerHTML
    }
  })

  return rcElement
}
