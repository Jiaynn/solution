/**
 * @file 视频转码
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { FormItem } from 'react-icecream-2/form-x'
import { Collapse, CollapsePanel } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'

import { ConfigStore } from 'kodo/stores/config'

import { Description } from 'kodo/components/common/Description'

import { PresetSelect } from './PresetSelect'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

type VideoTranscodeFormState = FormState<{
  transcodeId: FieldState<string | null>
}>

type Props = {
  region: string
  isEditMode: boolean
  defaultExpanded: boolean
  formState: VideoTranscodeFormState
  outputFormat: FieldState<string | null>
}

export const VideoTranscodeForm = observer(function VideoTranscodeForm(props: Props) {
  const { formState, outputFormat, defaultExpanded } = props

  const configStore = useInjection(ConfigStore)

  const handleOutputFormatChange = React.useCallback((v?: string) => {
    outputFormat.onChange(v || '')
  }, [outputFormat])

  const formItemTipView = React.useMemo(() => {
    const regionConfig = configStore.getRegion({ region: props.region })
    const description = regionConfig.dora.mediaStyle.video.transcode?.description
    return description ? (<Description dangerouslyText={description} />) : null
  }, [configStore, props.region])

  return (
    <div>
      <Collapse defaultValue={defaultExpanded ? ['default'] : []}>
        <CollapsePanel title="视频转码" value="default">
          <FormItem {...formItemLayout} label="视频转码" tip={formItemTipView}>
            <PresetSelect
              region={props.region}
              disabled={props.isEditMode}
              state={formState.$.transcodeId}
              onOutputFormatChange={handleOutputFormatChange}
            />
          </FormItem>
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
