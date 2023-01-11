/**
 * @file 视频封面
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import {
  Checkbox as RawCheckbox,
  Collapse,
  CollapsePanel,
  Drawer,
  InputGroup,
  InputGroupItem,
  SelectOption,
  TabPane,
  Tabs
} from 'react-icecream-2'
import { HelpIcon } from 'react-icecream-2/icons'
import { FieldState, FormState } from 'formstate-x'
import { FormItem, NumberInput, Select, Checkbox } from 'react-icecream-2/form-x'

import { rangeValidator } from 'kodo/transforms/image-style'

import { ConfigStore } from 'kodo/stores/config'

import { Description } from 'kodo/components/common/Description'

import { ResolutionInput, ResolutionScaleType } from '../../common/ResolutionInput'
import { DurationRangeInput } from '../../common/DurationRangeInput'

import { AvhlsParams, CommandParseResult } from './command'
import { sourceFormatList } from './constants'
import { createBaseFormState } from './BaseOptions'
import { createBatchFormState } from './BatchCreate'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '80px',
  layout: 'horizontal'
} as const

const h256Tip = '浏览器默认不支持 H.265 编码视频的播放，请使用播放器软件播放、查看转码效果。'

function resolutionValidator(mainValue: number | null, secondaryValue: number | null) {
  if (mainValue == null) return '请输入有效数值'
  if (mainValue < 20) return '不得小于 20'

  if (secondaryValue != null) {
    if (secondaryValue > 2160 && mainValue > 2160) {
      return '不得大于 2160'
    }
  }

  if (mainValue > 3840) return '不得大于 3840'
}

export function createFormState(
  initStyleList: Array<Partial<CommandParseResult>> = [],
  initSourceFormat?: string,
  isEditMode = false
) {
  const [parsedOptions = {}, ...batchEditValue] = initStyleList

  const sourceFormat = initSourceFormat ?? parsedOptions.base?.sourceFormat
  const baseFormState = createBaseFormState({ ...parsedOptions.base, sourceFormat }, isEditMode)

  type Undefined2Null<T> = T extends undefined ? null : T

  const sWidth = parsedOptions.transcode?.sWidth || null
  const sHeight = parsedOptions.transcode?.sHeight || null
  let sType: ResolutionScaleType = ResolutionScaleType.None
  if (sWidth != null && sHeight != null) {
    sType = ResolutionScaleType.ScaleWidthHeight
  } else if (sWidth != null) {
    sType = ResolutionScaleType.ScaleWidth
  } else if (sHeight != null) {
    sType = ResolutionScaleType.ScaleHeight
  } else {
    sType = ResolutionScaleType.None
  }

  const transcodeFormState = new FormState({
    segtime: new FieldState<Undefined2Null<AvhlsParams['segtime']>>(parsedOptions.transcode?.segtime ?? 10, 0),
    ss: new FieldState<Undefined2Null<AvhlsParams['ss']>>(parsedOptions.transcode?.ss ?? null, 0),
    ssEnable: new FieldState(!!(parsedOptions.transcode?.ss || parsedOptions.transcode?.t), 0),
    t: new FieldState<Undefined2Null<AvhlsParams['t']>>(parsedOptions.transcode?.t ?? null, 0),
    ab: new FieldState<Undefined2Null<AvhlsParams['ab']>>(parsedOptions.transcode?.ab ?? null, 0),
    abForce: new FieldState(parsedOptions.transcode?.abForce || false, 0),
    ar: new FieldState<Undefined2Null<AvhlsParams['ar']>>(parsedOptions.transcode?.ar ?? null, 0),
    r: new FieldState<Undefined2Null<AvhlsParams['r']>>(parsedOptions.transcode?.r ?? null, 0),
    vb: new FieldState<Undefined2Null<AvhlsParams['vb']>>(parsedOptions.transcode?.vb ?? null, 0),
    vbForce: new FieldState(parsedOptions.transcode?.vbForce || false, 0),
    vcodec: new FieldState<NonNullable<AvhlsParams['vcodec']>>(parsedOptions.transcode?.vcodec ?? 'libx264', 0),
    acodec: new FieldState<NonNullable<AvhlsParams['acodec']>>(parsedOptions.transcode?.acodec ?? 'libfdk_aac', 0),
    sType: new FieldState<ResolutionScaleType>(sType, 0),
    sWidth: new FieldState<Undefined2Null<AvhlsParams['sWidth']>>(parsedOptions.transcode?.sWidth ?? null, 0),
    sHeight: new FieldState<Undefined2Null<AvhlsParams['sHeight']>>(parsedOptions.transcode?.sHeight ?? null, 0)
  })

  transcodeFormState.$.segtime.validators(value => {
    if (value == null) return
    return rangeValidator(2, 120, 3)(value)
  })

  transcodeFormState.$.ss
    .disableValidationWhen(() => (
      !transcodeFormState.$.ssEnable.value
    ))
    .validators(rangeValidator(0, undefined, 3))

  transcodeFormState.$.t
    .disableValidationWhen(() => (
      !transcodeFormState.$.ssEnable.value
    ))
    .validators(rangeValidator(0.001, undefined, 3))

  transcodeFormState.$.ab.validators(value => {
    if (value == null) return
    return rangeValidator(1, 600, 1)(value)
  })

  transcodeFormState.$.ar.validators(value => {
    if (value == null) return
    return rangeValidator(8000, 100000)(value)
  })

  transcodeFormState.$.r.validators(value => {
    if (value == null) return
    return rangeValidator(1, 60)(value)
  })

  transcodeFormState.$.vb.validators(value => {
    if (value == null) return
    return rangeValidator(10, 60000, 1)(value)
  })

  let focusOn: 'scaleWidth' | 'scaleHeight' | null = null

  // 缩放宽度和高度改变后相应的校验对方的值
  const reactionDispose1 = reaction(
    () => transcodeFormState.$.sWidth.value,
    () => {
      focusOn = 'scaleWidth'
    }
  )
  const reactionDispose2 = reaction(
    () => transcodeFormState.$.sHeight.value,
    () => {
      focusOn = 'scaleHeight'
    }
  )

  const reactionDispose3 = reaction(
    () => transcodeFormState.$.sType.value,
    type => {
      if (type === ResolutionScaleType.None) {
        transcodeFormState.$.sWidth.set(null)
        transcodeFormState.$.sHeight.set(null)
      }
      if (type === ResolutionScaleType.ScaleWidth) {
        transcodeFormState.$.sHeight.set(null)
      }
      if (type === ResolutionScaleType.ScaleHeight) {
        transcodeFormState.$.sWidth.set(null)
      }
    }
  )
  // eslint-disable-next-line dot-notation
  transcodeFormState['addDisposer'](reactionDispose1)
  // eslint-disable-next-line dot-notation
  transcodeFormState['addDisposer'](reactionDispose2)
  // eslint-disable-next-line dot-notation
  transcodeFormState['addDisposer'](reactionDispose3)

  transcodeFormState.$.sWidth.validators(value => (
    focusOn === 'scaleWidth' && resolutionValidator(value, transcodeFormState.$.sHeight.value)
  )).disableValidationWhen(() => [
    ResolutionScaleType.ScaleHeight,
    ResolutionScaleType.None
  ].includes(transcodeFormState.$.sType.value))

  transcodeFormState.$.sHeight.validators(value => (
    focusOn === 'scaleHeight' && resolutionValidator(value, transcodeFormState.$.sWidth.value)
  )).disableValidationWhen(() => [
    ResolutionScaleType.ScaleWidth,
    ResolutionScaleType.None
  ].includes(transcodeFormState.$.sType.value))

  const formState = new FormState({
    base: baseFormState,
    transcode: transcodeFormState,
    batchForm: createBatchFormState(baseFormState, batchEditValue.map(i => i.base!), isEditMode),
    persistenceEnable: new FieldState(
      parsedOptions.persistenceEnable != null
        ? parsedOptions.persistenceEnable
        : true
    )
  })

  // 当 sourceFormat 发生变化时
  // 重新创建 batchFormState
  const reactionDispose4 = reaction(
    () => [baseFormState.$.sourceFormat.value],
    ([sourceFormatValue]) => {
      // 编辑模式时不产生副作用
      if (isEditMode) return

      // 如果用户的源文件格式是任意格式
      // 则不开启批量创建，也不需要创建对应的 formState
      if (!sourceFormatValue) {
        // 如果已经存在批量创建的数据则需要清空
        if (formState.$.batchForm.$.length > 0) {
          const disposes = formState.$.batchForm.$.splice(0, formState.$.batchForm.$.length)
          disposes.map(d => d.dispose())
        }
        return
      }

      // 自动生成除了当前配置的主要源文件格式以外的所有格式的默认值，并创建对应的 FormState
      const autoCreateList = sourceFormatList.filter(item => item !== sourceFormatValue).map(item => ({
        sourceFormat: item,
        nameSuffix: formState.$.base.$.outputFormat.value || item
      }))

      formState.$.batchForm.dispose()
      formState.$.batchForm = createBatchFormState(
        baseFormState,
        autoCreateList
      )
    },
    { fireImmediately: true }
  )

  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reactionDispose4)

  return formState
}

interface TranscodeCardProps {
  region: string
  formState: ReturnType<typeof createFormState>['$']['transcode']
}

export const TranscodeCard = observer(function TranscodeCard(props: TranscodeCardProps) {
  const { formState, region } = props
  const configStore = useInjection(ConfigStore)
  const [audioEnable, setAudioEnable] = React.useState(false)
  const [videoVbHelpVisible, setVideoVbHelpVisible] = React.useState(false)
  const [audioVbHelpVisible, setAudioVbHelpVisible] = React.useState(false)
  const [durationOfSliceHelpVisible, setDurationOfSliceHelpVisible] = React.useState(false)
  const [activatedTab, setActivatedTab] = React.useState<'video' | 'audio'>('video')

  const regionConfig = configStore.getRegion({ region })
  const transcodeConfig = regionConfig.dora.mediaStyle.video.transcode

  const handleAudioChange = (v: boolean) => {
    setAudioEnable(v)
    if (v === false) {
      setActivatedTab('video')
      formState.$.acodec.set('libfdk_aac')
      formState.$.ar.set(null)
      formState.$.ab.set(null)
    } else {
      setActivatedTab('audio')
    }
  }

  if ((
    formState.$.acodec.value !== 'libfdk_aac'
    || formState.$.ab.value !== null
    || formState.$.ar.value !== null
  ) && !audioEnable) { setAudioEnable(true) }

  const h256TipView = formState.$.vcodec.value === 'libx265' && (
    <span className={styles.h256Tip}>{h256Tip}</span>
  )

  return (
    <div>
      <Drawer title="视频码率" width={560} footer={null} visible={videoVbHelpVisible} onCancel={() => setVideoVbHelpVisible(false)}>
        <p>1、视频码率，单位：千比特每秒（kbit/s），常用视频码率：128k，1.25m，5m等，码率限制大小为 [10，60000]，支持到小数点后一位。</p>
        <p>2、在不改变视频编码格式时，若指定码率大于源视频码率，则使用源视频码率进行转码。</p>
        <p>3、勾选【强制使用】，可以强制指定码率进行转码。</p>
      </Drawer>
      <Drawer title="音频码率" width={560} footer={null} visible={audioVbHelpVisible} onCancel={() => setAudioVbHelpVisible(false)}>
        <p>1、音频码率，单位：千比特每秒（kbit/s），常用码率：64k，128k，192k，256k，320k等，音频码率限制大小为 [1，600]，支持到小数点后一位。</p>
        <p>2、在不改变音频编码格式时，若指定码率大于源音频码率，则使用源音频码率进行转码。</p>
        <p>3、勾选【强制使用】，可以强制指定码率进行转码。</p>
      </Drawer>
      <Drawer title="切片时长" width={560} footer={null} visible={durationOfSliceHelpVisible} onCancel={() => setDurationOfSliceHelpVisible(false)}>
        <p>1、前 10s 视频转码后的切片时长，会综合关键帧和设置的切片时长确定。</p>
        <p>2、10s 后视频的切片时长将与设置值一致。</p>
      </Drawer>
      <Collapse defaultValue={['default']}>
        <CollapsePanel title="视频转码" value="default">
          <FormItem label="配置项" {...formItemLayout} labelVerticalAlign="text">
            <RawCheckbox disabled checked>视频参数</RawCheckbox>
            <RawCheckbox checked={audioEnable} onChange={handleAudioChange}>音频参数</RawCheckbox>
          </FormItem>
          <Tabs<'video' | 'audio'> value={activatedTab} onChange={setActivatedTab}>
            <TabPane name="视频参数" value="video">
              <FormItem label="编码格式" {...formItemLayout} tip={h256TipView} >
                <Select state={formState.$.vcodec}>
                  <SelectOption value="libx264">H.264</SelectOption>
                  <SelectOption value="libx265">H.265</SelectOption>
                </Select>
              </FormItem>
              <FormItem
                label={(
                  <span className={styles.horizontalAlignmentLabel}>
                    切片时长 <HelpIcon onClick={() => setDurationOfSliceHelpVisible(true)} />
                  </span>
                )}
                {...formItemLayout}
                state={formState.$.segtime}
              >
                <InputGroup>
                  <NumberInput placeholder="请输入切片时长（可选）" state={formState.$.segtime} digits={3} max={120} min={2} />
                  <InputGroupItem>s</InputGroupItem>
                </InputGroup>
              </FormItem>
              <FormItem
                {...formItemLayout}
                state={formState.$.vb}
                label={(
                  <span className={styles.horizontalAlignmentLabel}>
                    码率 <HelpIcon onClick={() => setVideoVbHelpVisible(true)} />
                  </span>
                )}
              >
                <div className={styles.rowInputGroup}>
                  <InputGroup>
                    <NumberInput placeholder="请输入码率（可选）" state={formState.$.vb} digits={1} max={60000} min={10} />
                    <InputGroupItem>kbps</InputGroupItem>
                  </InputGroup>
                  <Checkbox state={formState.$.vbForce}>强制使用</Checkbox>
                </div>
              </FormItem>
              <FormItem label="分辨率" {...formItemLayout}>
                <ResolutionInput
                  type={formState.$.sType}
                  width={formState.$.sWidth}
                  height={formState.$.sHeight}
                />
              </FormItem>
              <FormItem
                label="帧率"
                {...formItemLayout}
                state={formState.$.r}
                tip={
                  transcodeConfig?.frameRate.description
                    ? <Description dangerouslyText={transcodeConfig.frameRate.description} />
                    : null
                }
              >
                <InputGroup>
                  <NumberInput placeholder="请输入帧率（可选）" min={1} max={30} state={formState.$.r} />
                  <InputGroupItem>Hz</InputGroupItem>
                </InputGroup>
              </FormItem>
              <FormItem label="片段截取" {...formItemLayout} labelVerticalAlign="text">
                <DurationRangeInput
                  enable={formState.$.ssEnable}
                  duration={formState.$.t}
                  start={formState.$.ss}
                />
              </FormItem>
            </TabPane>
            {audioEnable && (
              <TabPane name="音频参数" value="audio">
                <FormItem label="编码格式" {...formItemLayout}>
                  <Select state={formState.$.acodec}>
                    <SelectOption value="libmp3lame">MP3</SelectOption>
                    <SelectOption value="libfdk_aac">AAC_HE</SelectOption>
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  state={formState.$.ab}
                  label={(
                    <span className={styles.horizontalAlignmentLabel}>
                      码率 <HelpIcon onClick={() => setAudioVbHelpVisible(true)} />
                    </span>
                  )}
                >
                  <div className={styles.rowInputGroup}>
                    <InputGroup>
                      <NumberInput placeholder="请输入码率（可选）" state={formState.$.ab} digits={1} max={600} min={1} />
                      <InputGroupItem>kbps</InputGroupItem>
                    </InputGroup>
                    <Checkbox state={formState.$.abForce}>强制使用</Checkbox>
                  </div>
                </FormItem>
                <FormItem label="采样率" {...formItemLayout} state={formState.$.ar}>
                  <InputGroup>
                    <NumberInput placeholder="请输入采样率（可选）" state={formState.$.ar} digits={0} min={8000} max={100000} />
                    <InputGroupItem>Hz</InputGroupItem>
                  </InputGroup>
                </FormItem>
              </TabPane>
            )}
          </Tabs>
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
