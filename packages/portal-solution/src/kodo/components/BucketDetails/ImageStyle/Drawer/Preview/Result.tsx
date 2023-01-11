/**
 * @description result preview component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'

import { Section } from './Section'
import Image, { useImageStore } from './Image'

import styles from './style.m.less'

export interface Props {
  processedUrl: string
  onUpdateCode?: () => boolean | Promise<boolean> // true 表示 code 没有变化
  onOpenFullScreen?: () => void
}

export default function Result({ processedUrl, onUpdateCode, onOpenFullScreen }: Props) {
  const { info, errInfo, isLoading, refresh } = useImageStore(processedUrl)
  const [lazyProcessedUrl, setLazyProcessedUrl] = React.useState(processedUrl)

  const handleClick = React.useCallback(async () => {
    if (isLoading || (onUpdateCode && (await onUpdateCode()))) return

    // 检查 onUpdateCode 的调用结果是否为 false，如果为 false 则调用刷新
    refresh()
    setLazyProcessedUrl(processedUrl)
  }, [isLoading, onUpdateCode, processedUrl, refresh])

  const refreshBtnView = (
    <div className={isLoading ? styles.disabledBtn : undefined} onClick={handleClick}>刷新</div>
  )

  const fullScreenBtnView = onOpenFullScreen && (
    <div className={isLoading ? styles.disabledBtn : undefined} onClick={onOpenFullScreen}>全屏</div>
  )

  const buttonGroupView = (
    <div className={styles.buttonGroup}>
      {fullScreenBtnView}
      {refreshBtnView}
    </div>
  )

  return (
    <Section title="运行结果预览" extra={buttonGroupView}>
      <Image info={info} errInfo={errInfo} isLoading={isLoading} src={lazyProcessedUrl} />
    </Section>
  )
}
