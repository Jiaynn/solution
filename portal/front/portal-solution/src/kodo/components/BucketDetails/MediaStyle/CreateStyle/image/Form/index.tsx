/**
 * @description form component
 * @author duli <duli@qiniu.com>
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream-2'
import { FormState, FieldState } from 'formstate-x'
import { Form, FormItem, Switch, useFormstateX } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import { useModalState } from 'kodo/hooks'

// 这里复用原来 ImageStyle 那边的组件和逻辑
import CropScale, { createCropFormState, createScaleFormState, Order } from 'kodo/components/BucketDetails/ImageStyle/Drawer/CropScale'
import Watermark, { createWatermarkFormState } from 'kodo/components/BucketDetails/ImageStyle/Drawer/Watermark'
import More, { createMoreConfigForm } from 'kodo/components/BucketDetails/ImageStyle/Drawer/More'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { MediaStyleParsing } from '../../common/MediaStyleParsing'
import { useCommands } from '../../common/command'
import { useMediaStyleImageConfig } from '../../common/hooks'
import { FormController } from '../../common/types'

import { ImageCommandParseResult } from '../command'
import { sourceFormatList } from '../constants'

import { CommonUsedModal } from './CommonUsedModal'
import { BaseOptions, createBaseFormState } from './BaseOptions'
import { BatchCreate, createBatchFormState } from './BatchCreate'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

function createFormState(
  initStyleList: Array<Partial<ImageCommandParseResult>> = [],
  initSourceFormat?: string,
  isEditMode = false,
  _test?: boolean
) {
  const [mainStyle = {}, ...batchEditStyleList] = initStyleList

  const advancedField = new FieldState(mainStyle.advanced || false, 0)

  // 有源文件格式初始值时才使用它
  const sourceFormat = initSourceFormat ?? mainStyle.base?.sourceFormat

  const baseOptions = {
    ...mainStyle.base,
    sourceFormat,
    // 只有 drawer 打开时解析不出 base，也只有在 drawer 打开的时候需要保持 nameSuffix 跟 sourceFormat 一致
    nameSuffix: !mainStyle.base ? sourceFormat : mainStyle.base.nameSuffix
  }

  const baseFormState = createBaseFormState(baseOptions, isEditMode)

  const formState = new FormState({
    base: baseFormState,
    advanced: advancedField,
    scaleCropOrder: new FieldState(mainStyle.scaleCropOrder || Order.ScaleFirst, 0),
    cropForm: createCropFormState(advancedField, mainStyle.cropForm),
    scaleForm: createScaleFormState(advancedField, mainStyle.scaleForm),
    watermarkForm: createWatermarkFormState(baseFormState.$.outputFormat, mainStyle.watermarkForm),
    moreForm: createMoreConfigForm(advancedField, mainStyle.moreForm),
    batchForm: createBatchFormState(baseFormState, batchEditStyleList.map(i => i.base!), isEditMode),
    persistenceEnable: new FieldState(
      mainStyle?.persistenceEnable != null
        ? mainStyle.persistenceEnable
        : false
    )
  })

  // 一些业务关系
  const reactionDispose = reaction(
    () => advancedField.value,
    isAdvanced => {
      if (!isAdvanced) return
      // 当开启高级编辑模式的时候开启自动旋转矫正
      formState.$.moreForm.$.autoOrient.onChange(true)
    }
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

export interface Props {
  bucketName: string
  isEditMode: boolean
  initStyles?: MediaStyle[]
  initSourceFormat?: string
  isForcePersistence: boolean
  persistenceFileKey: string | undefined
  onStyleChange: (style: MediaStyle) => void
  onCreateController: (controller: FormController) => void
}

export default observer(function ImageForm(props: Props) {
  const {
    bucketName,
    isEditMode,
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
  const [parsing, setParsing] = React.useState(false)
  const mediaStyleImageConfig = useMediaStyleImageConfig(bucketName)
  const [initStyles, setInitStyle] = React.useState<MediaStyle[]>(props.initStyles || [])
  const [parsedInitStyles, setParsedInitStyles] = React.useState<ImageCommandParseResult[]>([])

  React.useEffect(() => {
    let ignore = false
    setParsing(true)
    Promise.all(initStyles.map(style => (
      commands.image.parse(style)
    )))
      .then(list => !ignore && setParsedInitStyles(list))
      .finally(() => !ignore && setParsing(false))

    return () => { ignore = true }
  }, [commands.image, initStyles])

  const formState = useFormstateX(createFormState, [
    parsedInitStyles,
    initSourceFormat,
    isEditMode
  ])

  // 必须要有明确的输入格式并且批量创建的表单状态已存在，则显示批量创建表单视图
  const shouldShowBatchCreate = React.useMemo(() => (
    formState.$.base.$.sourceFormat.value
    && (formState.$.batchForm.value.length > 0 || !isEditMode)
  ), [
    isEditMode,
    formState.$.batchForm.value.length,
    formState.$.base.$.sourceFormat.value
  ])

  // 生成最新的 style
  const generateAllStyle = React.useCallback(() => {
    const { batchForm, ...options } = formState.value
    const optionsList: ImageCommandParseResult[] = [
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

    return optionsList.map(item => commands.image.generate(item))
  }, [commands.image, formState])

  // 对当前 formState 上的状态进行校验
  // 如果是 isPreview 状态，仅对核心数据进行校验
  const handleValidate = React.useCallback(async (isPreview = false) => {
    if (isPreview) {
      const resultList = await Promise.all([
        formState.$.cropForm.validate(),
        formState.$.moreForm.validate(),
        formState.$.scaleForm.validate(),
        formState.$.scaleCropOrder.validate(),
        formState.$.watermarkForm.validate()
      ])

      return resultList.some(item => item.hasError)
    }

    const result = await formState.validate()
    return result.hasError
  }, [formState])

  // 向父组件提供 controller
  // 用于父子组件之间的信息交换
  React.useEffect(() => {
    onCreateController({
      validate: handleValidate,
      getStyleList: generateAllStyle
    })
  }, [generateAllStyle, handleValidate, onCreateController])

  // 当前正在编辑的 style 发生变化时
  // 自动触发 onStyleChange 通知外部
  React.useEffect(() => reaction(
    () => formState.value,
    async formStateValue => {
      const hasError = await handleValidate(true)
      if (hasError) return

      try {
        onStyleChange(commands.image.generate(formStateValue))
      } catch (error) { /** 忽略错误 */ }
    },
    { fireImmediately: true }
  ), [commands.image, formState, handleValidate, onStyleChange])

  React.useEffect(() => {
    if (!isForcePersistence) return
    formState.$.persistenceEnable.onChange(true)
  }, [formState.$.persistenceEnable, isForcePersistence])

  // 持久化保存提示
  const persistenceTipView = React.useMemo(() => {
    if (!formState.$.persistenceEnable.value) {
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
        处理后的文件会保存到当前空间{persistenceFileKey ? <span>，文件名示例：{fileNameView}</span> : null}
      </span>
    )
  }, [formState.$.persistenceEnable.value, persistenceFileKey])

  const commonUsedModalState = useModalState(false)

  const handleSceneChange = React.useCallback((sceneCommands: string) => {
    const [, ...rest] = initStyles || []

    const newMainStyle: MediaStyle = {
      name: formState.value.base.name,
      persistence_enable: formState.value.persistenceEnable || false,
      commands: sceneCommands
    }

    setInitStyle([newMainStyle, ...rest])
    commonUsedModalState.close()
  }, [commonUsedModalState, formState.value.base.name, formState.value.persistenceEnable, initStyles])

  if (parsing) return (<MediaStyleParsing />)

  return (
    <Form footer={null} state={formState} className={styles.form} labelAlign="left">
      <CommonUsedModal
        onChange={handleSceneChange}
        visible={commonUsedModalState.visible}
        onCancel={commonUsedModalState.close}
      />
      <BaseOptions
        sourceFormatDisabled={initSourceFormat != null}
        isEditMode={isEditMode}
        formState={formState.$.base}
      />
      <FormItem label="高级编辑" labelVerticalAlign="text" {...formItemLayout} className={styles.advanced}>
        <div className={styles.advancedContent}>
          <Switch state={formState.$.advanced} />
          <Button
            type="text"
            className={styles.commonUsedBtn}
            onClick={commonUsedModalState.open}
          >
            导入常用配置
          </Button>
        </div>
      </FormItem>
      <div className={styles.collapseGroup}>
        <CropScale
          isEditMode={isEditMode}
          advanced={formState.$.advanced}
          cropForm={formState.$.cropForm}
          scaleForm={formState.$.scaleForm}
          scaleCropOrder={formState.$.scaleCropOrder}
        />
        <Watermark
          isEditMode={isEditMode}
          formState={formState.$.watermarkForm}
        />
        <More
          isEditMode={isEditMode}
          formState={formState.$.moreForm}
          isAdvanced={formState.$.advanced.value}
          imageSlimDescription={mediaStyleImageConfig?.imageSlim?.description}
        />
      </div>
      {isForcePersistence && (
        <FormItem {...formItemLayout} labelWidth="90px" label="结果自动保存" tip={persistenceTipView} className={styles.persistence}>
          <Switch state={formState.$.persistenceEnable} disabled={isForcePersistence} />
        </FormItem>
      )}
      {shouldShowBatchCreate && (
        <BatchCreate
          isEditMode={isEditMode}
          baseFormState={formState.$.base}
          formState={formState.$.batchForm}
        />
      )}
    </Form>
  )
})
