import React from 'react'
import { reaction } from 'mobx'
import classnames from 'classnames'
import { FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import { RefreshIcon } from 'react-icecream-2/icons'
import { Select, SelectOption } from 'react-icecream-2/form-x'
import { ToasterStore } from 'portal-base/common/toaster'

import { ImageStyleApis, TranscodePreset } from 'kodo/apis/bucket/image-style'

import { outputFormatList } from '../../constants'

import styles from './style.m.less'

interface Props {
  region: string
  disabled: boolean
  state: FieldState<string | null>
  onOutputFormatChange: (value?: string) => void
}

export function PresetSelect(props: Props) {
  const { state, onOutputFormatChange } = props

  const isMountedRef = React.useRef(false)
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApi = useInjection(ImageStyleApis)
  const [loading, setLoading] = React.useState(false)
  const [presetList, setPresetList] = React.useState<TranscodePreset[]>([])

  const refresh = React.useCallback(() => {
    setLoading(true)
    const req = imageStyleApi.getTranscodePreset()
    toasterStore.promise(req)
    req
      .finally(() => isMountedRef.current && setLoading(false))
      .then(data => isMountedRef.current && setPresetList(data.filter(item => {
        if (!outputFormatList.includes(item.params?.format || '')) return false
        return item.region === props.region || !item.region
      })))
  }, [imageStyleApi, props.region, toasterStore])

  const handleRefresh = React.useCallback(() => {
    if (!loading) refresh()
  }, [loading, refresh])

  React.useEffect(() => reaction(
    () => state.$,
    () => {
      if (!state.$ || presetList.length === 0) {
        return
      }

      const selected = presetList.find(item => item.id === state.$)
      onOutputFormatChange(selected?.params?.format)
    }
  ), [state, onOutputFormatChange, presetList])

  React.useEffect(
    () => refresh(),
    [props.region, refresh]
  )

  React.useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  return (
    <span className={styles.presetSelect}>
      <Select<string>
        searchable
        state={props.state}
        clearable={!props.disabled}
        placeholder="请选择一个转码预设"
        disabled={loading || props.disabled}
      >
        {presetList.map(preset => {
          const keySet: string[] = []
          if (preset.params) {
            keySet.push(`分辨率: ${preset.params?.s ?? '与源文件一致'}`)
            keySet.push(`码率: ${preset.params?.vb ?? '与源文件一致'}`)
          }

          const keySetString = keySet.length > 0 ? `（${keySet.join('，')}）` : ''

          return (
            <SelectOption key={preset.id} value={preset.id}>
              {preset.name}{keySetString}
            </SelectOption>
          )
        })}
      </Select>
      <span className={classnames([styles.refresh, { [styles.spin]: loading }])} onClick={handleRefresh}>
        <RefreshIcon />
      </span>
    </span>
  )
}
