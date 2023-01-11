/**
 * @file 视频转码
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Form } from 'react-icecream-2'
import { FieldState, FormState } from 'formstate-x'
import { FormItem, Switch, useFormstateX } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { useCommands } from '../../common/command'
import { FormController } from '../../common/types'
import { MediaStyleType } from '../../common/constants'

import { CommandParseResult } from './command'
import { outputFormatList, sourceFormatList } from './constants'
import { BaseOptions, createBaseFormState } from './BaseOptions'
import { BatchCreate, createBatchFormState } from './BatchCreate'
import { createWatermarkFormState } from './Watermark/WatermarkFormCard'

// 这里原本包含一个老版本的转码功能，后来又因为业务上的调整
// 转码被另一个转码替代并独立了出去，所以在这面还可以看到一些
// 转码相关的代码片段
import WatermarkFormCard from './Watermark'
// import { VideoTranscodeForm } from './Transcode'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

type Props = {
  region: string
  bucket: string
  isEditMode: boolean
  defaultType: MediaStyleType.VideoWatermark // | MediaStyleType.VideoTranscode
  isForcePersistence: boolean
  persistenceFileKey: string | undefined
  initStyles?: MediaStyle[]
  initSourceFormat?: string // 如果提供该值，则禁止修改输入输出格式
  onStyleChange: (style: MediaStyle) => void
  onCreateController(controller: FormController): void
}

function createFormState(
  defaultType: MediaStyleType.VideoTranscode | MediaStyleType.VideoWatermark,
  initStyleList: Array<Partial<CommandParseResult>> = [],
  initSourceFormat?: string,
  isEditMode = false
) {
  const [parsedOptions = {}, ...batchEditValue] = initStyleList

  const sourceFormat = initSourceFormat ?? parsedOptions.base?.outputFormat
  // 初始化后缀名规则：当初始源文件格式有初始值且不是所有文件时，与它保持一致
  const initNameSuffix = initSourceFormat || undefined
  // 只有刚打开 drawer 时（只有这种场景，base 才为空）用初始值
  const nameSuffix = parsedOptions.base ? parsedOptions.base.nameSuffix : initNameSuffix
  const baseFormState = createBaseFormState({ ...parsedOptions.base, sourceFormat, nameSuffix }, isEditMode)

  const defaultWatermarkFormValue = defaultType === MediaStyleType.VideoWatermark
    ? undefined
    : []

  const formState = new FormState({
    base: baseFormState,
    activeIndex: new FieldState(0, 0),
    watermarkForm: createWatermarkFormState(parsedOptions.watermarkForm || defaultWatermarkFormValue),
    transcodeId: new FieldState<string | null>(parsedOptions.transcodeId || null),
    batchForm: createBatchFormState(baseFormState, batchEditValue.map(i => i.base!), isEditMode),
    persistenceEnable: new FieldState(
      parsedOptions.persistenceEnable != null
        ? parsedOptions.persistenceEnable
        : true
    )
  })

  const reactionDispose = reaction(
    () => [
      formState.$.transcodeId.value,
      baseFormState.$.sourceFormat.value
    ],
    ([transcodeIdValue, sourceFormatValue]) => {
      // 编辑模式关闭副作用处理
      if (isEditMode) return

      // 没有转码 id 则根据源文件格式设置输出格式
      if (sourceFormatValue && !transcodeIdValue) {
        baseFormState.$.outputFormat.onChange(sourceFormatValue)
      }

      // 没有转码 id 和源文件则重置输出格式为默认值
      if (!sourceFormatValue && !transcodeIdValue) {
        baseFormState.$.outputFormat.reset()
      }
    },
    { fireImmediately: true }
  )

  // 当 sourceFormat 发生变化时
  // 重新创建 batchFormState
  const reactionDispose2 = reaction(
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
  formState['addDisposer'](reactionDispose)

  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reactionDispose2)

  return formState
}

export const WatermarkForm = observer(function WatermarkForm(props: Props) {
  const {
    isEditMode,
    defaultType,
    initStyles = [],
    onStyleChange,
    onCreateController,
    persistenceFileKey,
    isForcePersistence
  } = props

  const initSourceFormat = props.initSourceFormat && (
    sourceFormatList.includes(props.initSourceFormat)
      ? props.initSourceFormat
      : ''
  )

  const commands = useCommands()
  const preStyleRef = React.useRef<MediaStyle>()
  const [expandedTypes, setExpandedTypes] = React.useState<MediaStyleType[]>()
  const [parsedInitStyles, setParsedInitStyles] = React.useState<CommandParseResult[]>([])

  React.useEffect(() => {
    let ignore = false
    Promise.all(initStyles.map(style => (
      commands.videoWatermark.parse(style)
    ))).then(list => !ignore && setParsedInitStyles(list))

    return () => { ignore = true }
  }, [commands.videoWatermark, initStyles])

  const formstate = useFormstateX(createFormState, [
    defaultType,
    parsedInitStyles,
    initSourceFormat,
    isEditMode
  ])

  const getStyleList = React.useCallback(() => {
    const { batchForm, ...options } = formstate.value

    const optionsList: any[] = [
      options
    ]

    if (batchForm && batchForm.length > 0) {
      for (const batchItem of batchForm) {
        optionsList.push({
          ...options,
          base: {
            ...batchItem,
            outputFormat: options.base.outputFormat
          }
        })
      }
    }

    return optionsList.map(item => commands.videoWatermark.generate(item))
  }, [formstate, commands.videoWatermark])

  // 对当前 formState 上的状态进行校验
  // 如果是 isPreview 状态，仅对核心数据进行校验
  const handleValidate = React.useCallback(async (isPreview = false) => {
    if (isPreview) {
      const resultList = await Promise.all([
        formstate.$.transcodeId.validate(),
        formstate.$.watermarkForm.validate()
      ])

      return resultList.some(item => item.hasError)
    }

    const result = await formstate.validate()
    if (result.hasError) {
      result.error = '' // 只提示水印表单异常
      if (formstate.$.watermarkForm.$.length > 1 && formstate.$.watermarkForm.hasError) {
        result.error = formstate.$.watermarkForm.$
          .map((item, index) => (item.hasError ? `视频水印-${index + 1}` : null))
          .filter(Boolean)
          .join('、')
          + ' 参数不合法'
      }
    }

    return result
  }, [formstate])

  // 持久化保存提示
  const persistenceTipView = React.useMemo(() => {
    if (!formstate.$.persistenceEnable.value) {
      return (
        <span className={styles.persistenceTip}>
          处理后的文件会保存到当前空间
        </span>
      )
    }

    const fileNameView = (
      <MiddleEllipsisSpan
        key={persistenceFileKey}
        style={{ color: '#e28b00' }}
        title={persistenceFileKey}
        text={persistenceFileKey || ''}
        maxRows={2}
      />
    )
    return (
      <span className={styles.persistenceTip}>
        处理后的文件会保存到当前空间{persistenceFileKey ? (<span>，文件名示例：{fileNameView}</span>) : null}
        <br />
        包含音视频相关处理时、将强制开启自动保存，避免重复触发处理、提升访问体验
      </span>
    )
  }, [formstate.$.persistenceEnable.value, persistenceFileKey])

  // 必须要有明确的输入格式并且批量创建的表单状态已存在，则显示批量创建表单视图
  const shouldShowBatchCreate = React.useMemo(() => (
    formstate.$.base.$.sourceFormat.value
    && (formstate.$.batchForm.value.length > 0 || !isEditMode)
  ), [
    isEditMode,
    formstate.$.batchForm.value.length,
    formstate.$.base.$.sourceFormat.value
  ])

  // 当没有确定的输出格式时，用户必须要手动选择一个
  const shouldDisableOutputFormat = React.useMemo(() => (
    !!formstate.$.transcodeId.$ || !!formstate.$.base.$.sourceFormat.$
  ), [formstate.$.transcodeId.$, formstate.$.base.$.sourceFormat.$])

  // 向父组件提供 controller
  // 用于父子组件之间的信息交换
  React.useEffect(() => {
    onCreateController({
      getStyleList,
      validate: handleValidate
    })
  }, [getStyleList, handleValidate, onCreateController])

  // 当前正在编辑的 style 发生变化时
  // 自动触发 onStyleChange 通知外部
  React.useEffect(() => reaction(
    () => formstate.value,
    async formStateValue => {
      const hasError = await handleValidate(true)
      if (hasError) {
        const style = commands.videoWatermark.generate(formStateValue, false)

        // 错误时，给一个空命令
        onStyleChange({ name: style.name, commands: preStyleRef.current?.commands || style.commands })
        return
      }

      try {
        const style = commands.videoWatermark.generate(formStateValue)
        preStyleRef.current = style
        onStyleChange(style)
      } catch (error) { /** 忽略错误 */ }
    },
    { fireImmediately: true }
  ), [commands, formstate, handleValidate, onStyleChange])

  // 如果指定了样式，则根据样式
  // 依次检查水印、转码是否展开
  React.useEffect(() => {
    if (!props.initStyles || !props.initStyles[0]) {
      if (props.defaultType) setExpandedTypes([props.defaultType])
      return
    }

    let ignore = false
    commands.videoWatermark.parse(props.initStyles[0])
      .then(result => {
        if (ignore) return
        const newExpandedTypes: MediaStyleType[] = []

        if ((result.watermarkForm && result.watermarkForm.length > 0)) {
          newExpandedTypes.push(MediaStyleType.VideoWatermark)
        }

        if (result.transcodeId) {
          newExpandedTypes.push(MediaStyleType.VideoTranscode)
        }

        // 如果啥也没有，默认转码
        if (newExpandedTypes.length === 0) {
          newExpandedTypes.push(MediaStyleType.VideoTranscode)
        }
        setExpandedTypes(newExpandedTypes)
      }).catch(() => { /***/ })

    return () => { ignore = true }
  }, [commands.videoWatermark, props.defaultType, props.initStyles])

  React.useEffect(() => {
    if (!isForcePersistence) return
    formstate.$.persistenceEnable.onChange(true)
  }, [formstate.$.persistenceEnable, isForcePersistence])

  return (
    <Form footer={null}>
      <BaseOptions
        isEditMode={isEditMode}
        formState={formstate.$.base}
        outputFormatList={outputFormatList}
        sourceFormatList={sourceFormatList}
        sourceFormatDisabled={initSourceFormat != null}
        outputFormatDisabled={shouldDisableOutputFormat}
      />
      {expandedTypes && (
        <>
          {/* 此转码功能下线，隔壁的另外一套替代了这个 VideoTranscodeForm */}
          {/* <div className={styles.cardGap}>
            <VideoTranscodeForm
              region={props.region}
              formState={formstate}
              isEditMode={isEditMode}
              outputFormat={formstate.$.base.$.outputFormat}
              defaultExpanded={expandedTypes?.includes(MediaStyleType.VideoTranscode)}
            />
          </div> */}
          <div className={styles.cardGap}>
            <WatermarkFormCard
              bucketName={props.bucket}
              activeIndex={formstate.$.activeIndex}
              watermarkForm={formstate.$.watermarkForm}
              defaultExpanded={expandedTypes?.includes(MediaStyleType.VideoWatermark)}
            />
          </div>
        </>
      )}
      {isForcePersistence && (
        <FormItem {...formItemLayout} labelWidth="90px" label="结果自动保存" className={styles.persistence} tip={persistenceTipView}>
          <div style={{ marginTop: 5 }}>
            <Switch disabled={isForcePersistence} state={formstate.$.persistenceEnable} />
          </div>
        </FormItem>
      )}
      {
        shouldShowBatchCreate && (
          <BatchCreate
            isEditMode={isEditMode}
            baseFormState={formstate.$.base}
            formState={formstate.$.batchForm}
            sourceFormatList={sourceFormatList}
          />
        )
      }
    </Form >
  )
})
