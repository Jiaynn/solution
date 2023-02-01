/**
 * @description preview component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToasterStore } from 'portal-base/common/toaster'

import { getImagePreviewUrl } from 'kodo/transforms/image-style'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { useDoraImageConfig } from '../../Image'
import { Section } from './Section'
import Original from './Original'
import Result from './Result'

import styles from './style.m.less'

const exampleFileKey = 'sample'

export interface Props {
  style?: MediaStyle
  bucketName: string
  commandsVisible: boolean
  onOpenFullScreen?: (baseUrl: string) => void // 此组件可能选其他的预览文件，所以需要传递 baseUrl 参数给外面
  onUpdateCode?: () => boolean | Promise<boolean> // true 表示 code 没有变化，仅当手动编辑模式下才会有 (TODO: 这个设计有点问题，可以不依赖外面传的这个接口的)
  onFileKeyChange?: (value: string) => void
}

export default observer(function Preview(props: Props) {
  const {
    style,
    bucketName,
    commandsVisible,
    onUpdateCode,
    onFileKeyChange
  } = props

  const toasterStore = useInjection(ToasterStore)
  const doraImageConfig = useDoraImageConfig(bucketName)
  const uploadEnable = !!doraImageConfig?.uploadEnable
  const [url, setUrl] = React.useState(() => doraImageConfig?.defaultImageUrl || '')

  // 用于实际预览的链接，只需要将当前的 url 和 command 拼到一起即可
  // FIXME: 当前这种拼接实现无法支持带签名等自身携带了 query 的 URL
  const previewUrl = React.useMemo(() => (url ? getImagePreviewUrl(url, style?.commands) : ''), [style?.commands, url])

  const copyFeedback = React.useCallback((_: string, state: boolean) => {
    if (state) {
      toasterStore.info('已成功拷贝到剪切板')
    } else {
      toasterStore.error('拷贝失败')
    }
  }, [toasterStore])

  // 每当预览文件发生变动
  // 通过 onFileKeyChange 通知外面
  React.useEffect(() => {
    if (!url || !onFileKeyChange) return
    if (url === doraImageConfig?.defaultImageUrl) {
      onFileKeyChange(exampleFileKey)
      return
    }

    const result = /([^/]*)$/.exec(url)
    if (result != null && result[0]) {
      onFileKeyChange(result[0])
    }
  }, [doraImageConfig?.defaultImageUrl, onFileKeyChange, url])

  const copyBtnViewRender = (value?: string) => (
    <CopyToClipboard onCopy={copyFeedback} text={value}>
      <div>复制</div>
    </CopyToClipboard>
  )

  return (
    <div className={styles.previewWrap}>
      <div className={styles.preview}>
        <Original url={url} uploadEnable={uploadEnable} onChange={setUrl} />
        {commandsVisible && (
          <Section title="处理代码" extra={copyBtnViewRender(style?.commands)}>
            <div className={styles.code}>{style?.commands}</div>
          </Section>
        )}
        <Result
          processedUrl={previewUrl}
          onUpdateCode={onUpdateCode}
        />
      </div>
    </div>
  )
})
