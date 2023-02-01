/**
 * @file 视频封面
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Form } from 'react-icecream-2'
import { FormItem, Switch, useFormstateX } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import { Nullable } from 'kodo/types/ts'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { useCommands } from '../../common/command'
import { FormController } from '../../common/types'

import { AvhlsParams, CommandParseResult, getTsFileName } from './command'
import { outputFormatList, sourceFormatList } from './constants'
import { BaseOptions } from './BaseOptions'
import { BatchCreate } from './BatchCreate'
import { createFormState, TranscodeCard } from './Form'

import styles from './style.m.less'

export { TranscodeCommand } from './command'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

type Props = {
  region: string
  isEditMode: boolean
  isForcePersistence: boolean
  previewFileKey: string | undefined
  persistenceFileKey: string | undefined
  initStyles?: MediaStyle[]
  initSourceFormat?: string // 如果提供该值，则禁止修改输入输出格式
  onStyleChange: (style: MediaStyle) => void
  onCreateController(controller: FormController): void
}

export const TranscodeForm = observer(function TranscodeForm(props: Props) {
  const {
    isEditMode,
    initStyles = [],
    onStyleChange,
    onCreateController,
    previewFileKey,
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
  const [parsedInitStyles, setParsedInitStyles] = React.useState<CommandParseResult[]>([])

  React.useEffect(() => {
    let ignore = false
    Promise.all(initStyles.map(style => (
      commands.videoTranscode.parse(style)
    ))).then(list => !ignore && setParsedInitStyles(list))

    return () => { ignore = true }
  }, [commands.videoTranscode, initStyles])

  const formstate = useFormstateX(createFormState, [
    parsedInitStyles,
    initSourceFormat,
    isEditMode
  ])

  const getStyleList = React.useCallback(() => {
    const { batchForm, ...options } = formstate.value

    const optionsList: Array<CommandParseResult<Nullable<AvhlsParams>>> = [
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

    return optionsList.map(item => commands.videoTranscode.generate(item))
  }, [formstate.value, commands.videoTranscode])

  // 对当前 formState 上的状态进行校验
  // 如果是 isPreview 状态，仅对核心数据进行校验
  const handleValidate = React.useCallback(async (isPreview = false) => {
    if (isPreview) {
      const result = await formstate.$.transcode.validate()
      return result.hasError
    }

    const result = await formstate.validate()
    return result.hasError
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

    const fileNameView = persistenceFileKey && (
      <MiddleEllipsisSpan
        maxRows={2}
        key={persistenceFileKey}
        text={persistenceFileKey}
        title={persistenceFileKey}
        style={{ color: '#e28b00' }}
      />
    )

    const tsFileName = getTsFileName(persistenceFileKey || '')
    const tsFileNameView = persistenceFileKey && (
      <MiddleEllipsisSpan
        maxRows={2}
        key={tsFileName}
        text={tsFileName}
        title={tsFileName}
        style={{ color: '#e28b00' }}
      />
    )

    return (
      <span className={styles.persistenceTip}>
        处理后的文件会保存到当前空间{persistenceFileKey ? (<span>，文件名示例：{fileNameView}、{tsFileNameView}</span>) : null}
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
      const data: CommandParseResult<Nullable<AvhlsParams>> = formStateValue
      const hasError = await handleValidate(true)
      if (hasError) {
        // 错误时，给一个空命令
        const style = commands.videoTranscode.generate(data, false)
        onStyleChange({ name: style.name, commands: preStyleRef.current?.commands || style.commands })
        return
      }

      try {
        const style = commands.videoTranscode.generate(data)
        preStyleRef.current = style
        onStyleChange(style)
      } catch (error) { /** 忽略错误 */ }
    },
    { fireImmediately: true }
  ), [commands, formstate.value, handleValidate, onStyleChange, previewFileKey])

  React.useEffect(() => {
    if (!isForcePersistence) return
    formstate.$.persistenceEnable.onChange(true)
  }, [formstate.$.persistenceEnable, isForcePersistence])

  return (
    <Form footer={null}>
      <BaseOptions
        outputFormatDisabled
        isEditMode={isEditMode}
        formState={formstate.$.base}
        outputFormatList={outputFormatList}
        sourceFormatList={sourceFormatList}
        sourceFormatDisabled={initSourceFormat != null}
      />
      <div style={{ marginTop: '24px' }}>
        <TranscodeCard region={props.region} formState={formstate.$.transcode} />
      </div>
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
