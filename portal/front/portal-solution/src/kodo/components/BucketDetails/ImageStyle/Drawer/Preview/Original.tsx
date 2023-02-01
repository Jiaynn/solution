/**
 * @description original preview component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { Spin } from 'react-icecream/lib'

import { Section } from './Section'
import Upload, { Phase } from './Upload'
import Image, { useImageStore } from './Image'

export interface Props {
  url: string
  onChange: (url: string) => void
  uploadEnable: boolean
}

export default function Original({ url, onChange, uploadEnable }: Props) {

  const [isUploading, setIsUploading] = React.useState(false)

  const { info, errInfo, isLoading } = useImageStore(url)

  const handleUploadPhaseChange = React.useCallback((res: { phase: Phase, url?: string }) => {
    if (res.url) onChange(res.url)
    setIsUploading(res.phase === Phase.Uploading)
  }, [onChange])

  const uploadView = uploadEnable && <Upload onPhaseChange={handleUploadPhaseChange} />

  return (
    <Section title="原图预览" extra={uploadView}>
      <Spin spinning={isUploading}>
        <Image info={info} errInfo={errInfo} isLoading={isLoading} src={url} />
      </Spin>
    </Section>
  )
}
