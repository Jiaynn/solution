/**
 * @file component Dragger
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Accept } from 'kodo-base/lib/components/ObjectManager'

import styles from './style.m.less'

interface IProps {
  accepts: Accept[]
  onFile(file: File): void
  children: React.ReactElement
}

export function Dragger(props: IProps): React.ReactElement {
  const toasterStore = useInjection(ToasterStore)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const onClick = () => {
    if (!inputRef.current) return
    inputRef.current.value = ''
    inputRef.current.click()
  }

  const checkAccept = (file: File): boolean => {
    if (props.accepts.length > 0) {
      const execResult = /\.[^.]+$/.exec(file.name)
      const suffix = execResult ? execResult[0] : null
      const mainType = (file.type || '').split('?')[0]

      const hitAccept = props.accepts.some(accept => {
        const { mimeTypes = [], suffixes = [], maxSize } = accept
        const hitMimeType = mimeTypes.length === 0 || mimeTypes.includes(mainType)
        const hitSuffix = suffixes.length === 0 || (suffix != null && suffixes.includes(suffix))

        return hitMimeType && hitSuffix && file.size <= maxSize
      })

      if (!hitAccept) {
        toasterStore.warning('不支持该文件格式或大小超出限制，请重新选择文件')
        return false
      }
    }

    return true
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!event || !event.dataTransfer || !event.dataTransfer.files) return
    const file = event.dataTransfer.files[0]
    if (file != null && checkAccept(file)) {
      props.onFile(file)
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputRef || !event || !event.target || !event.target.files) return
    const file = event.target.files[0]
    if (file != null && checkAccept(file)) {
      props.onFile(file)
    }
  }

  // 阻止默认的拖入文件处理
  React.useEffect(() => {
    const handler = (e: any) => e.preventDefault()
    document.addEventListener('dragover', handler)
    return () => {
      document.removeEventListener('dragover', handler)
    }
  }, [])

  return (
    <div
      onDrop={onDrop}
      onClick={onClick}
      className={styles.dragger}
    >
      <div className={styles.draggerContent}>
        <input
          type="file"
          ref={inputRef}
          onChange={onChange}
          accept={props.accepts.map(i => (i.mimeTypes || []).join(',')).filter(Boolean).join(',')}
        />
        {props.children}
      </div>
    </div>
  )
}
