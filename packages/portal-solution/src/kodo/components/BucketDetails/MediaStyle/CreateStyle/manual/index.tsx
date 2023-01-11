/**
 * @description manual form component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Form, Card, CardTitle } from 'react-icecream-2'
import { FormItem, InputGroup, Select, SelectOption, Switch, TextArea, TextInput, useFormstateX } from 'react-icecream-2/form-x'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { FormController } from '../common/types'
import { getCommandNameList, parseStyleName, styleNameValidator } from '../common/command'

import {
  sourceFormatList as imageSourceFormatList,
  outputFormatList as imageOutputFormatList
} from '../image/constants'
import {
  // sourceFormatList as videoCoverSourceFormatList,
  outputFormatList as videoCoverOutputFormatList
} from '../video/utils'

// import {
//   sourceFormatList as videoWatermarkSourceFormatList,
//   outputFormatList as videoWatermarkOutputFormatList
// } from '../video/Watermark/constants'

import { getTsFileName } from '../video/Transcode/command'

import {
  // sourceFormatList as videoTranscodeSourceFormatList,
  outputFormatList as videoTranscodeOutputFormatList
} from '../video/Transcode/constants'

import styles from './style.m.less'

const allowNameSuffixList = Array.from(new Set([
  ...imageSourceFormatList,
  ...imageOutputFormatList,
  // ...videoCoverSourceFormatList,
  ...videoCoverOutputFormatList,
  // ...videoTranscodeSourceFormatList,
  ...videoTranscodeOutputFormatList
  // ...videoWatermarkSourceFormatList,
  // ...videoWatermarkOutputFormatList
]))

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

export interface Props {
  isEditMode: boolean
  initValue?: MediaStyle[]
  isForcePersistence: boolean
  persistenceFileKey: string | undefined
  onStyleChange: (style: MediaStyle) => void
  onCreateController: (controller: FormController) => void
}

function createFormState(initValue?: MediaStyle, isEditMode = false) {
  const nameInfo = initValue && parseStyleName(
    initValue.name,
    allowNameSuffixList
  )

  const name = new FieldState<string>(nameInfo?.name || '')
  const nameSuffix = new FieldState<string>(nameInfo?.nameSuffix || '')

  const commands = new FieldState<string>(initValue?.commands || '')
  const persistenceEnable = new FieldState<boolean>(
    initValue?.persistence_enable != null
      ? initValue.persistence_enable
      : false
  )

  name
    .disableValidationWhen(() => isEditMode)
    .validators(v => styleNameValidator(v, nameSuffix.value))

  nameSuffix.disableValidationWhen(() => isEditMode)

  commands.validators(value => {
    if (!value) return '命令不能为空'
    const commandNameList = getCommandNameList(value)
    if (commandNameList.includes('avthumb')) {
      return '暂不支持 avthumb 命令'
    }
    if (commandNameList.includes('avhls')) {
      if (!/avhls\/m3u8/.test(value)) return 'avhls 输出格式只能是 m3u8'
      if (value.includes('|')) return 'avhls 无法使用管道（｜）与其他命令组合使用'
      if (value.includes('/destKey/') || value.includes('/pattern/')) return 'avhls 禁止使用 pattern、destKey 参数'
    }
  })

  return new FormState({
    name,
    nameSuffix,
    commands,
    persistenceEnable
  })
}

export const ManualForm = observer(function ManualForm(props: Props) {
  const {
    isEditMode,
    initValue = [],
    onStyleChange,
    onCreateController,
    persistenceFileKey,
    isForcePersistence
  } = props

  const formState = useFormstateX(createFormState, [
    initValue[0],
    isEditMode
  ])

  // 生成最新的 style
  const generateStyle = React.useCallback((): MediaStyle => {
    const formValue = formState.value
    return {
      name: formValue.nameSuffix
        ? `${formValue.name}.${formValue.nameSuffix}`
        : formValue.name,
      commands: formValue.commands,
      persistence_enable: formValue.persistenceEnable
    }
  }, [formState])

  // 对当前 formState 上的状态进行校验
  // 如果是 isPreview 状态，仅对核心数据进行校验
  const handleValidate = React.useCallback(async (isPreview = false) => {
    if (isPreview) {
      const result = await formState.$.commands.validate()
      return result.hasError
    }

    const result = await formState.validate()
    return result.hasError
  }, [formState])

  // 当前正在编辑的 style 发生变化时
  // 自动触发 onStyleChange 通知外部
  React.useEffect(() => reaction(
    () => formState.value,
    async () => {
      try {
        onStyleChange(generateStyle())
      } catch (error) { /** 忽略错误 */ }
    },
    { fireImmediately: true }
  ), [formState, generateStyle, handleValidate, onStyleChange])

  // 向父组件提供 controller
  // 用于父子组件之间的信息交换
  React.useEffect(() => {
    onCreateController({
      validate: handleValidate,
      getStyleList: () => [generateStyle()]
    })
  }, [generateStyle, handleValidate, onCreateController])

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

    const commandNameList = getCommandNameList(formState.value.commands)
    const hasAvhls = commandNameList.includes('avhls')
    const tsFileName = getTsFileName(persistenceFileKey || '')
    const tsFileNameView = hasAvhls && persistenceFileKey && (
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
        处理后的文件会保存到当前空间{
          persistenceFileKey
            ? (<span>，文件名示例：{fileNameView}{tsFileNameView ? '、' : ''}{tsFileNameView} </span>)
            : null
        }
        {isForcePersistence && (
          <>
            <br />
            包含音视频相关处理时、将强制开启自动保存，避免重复触发处理、提升访问体验
          </>
        )}
      </span>
    )
  }, [formState.$.persistenceEnable.value, formState.value, isForcePersistence, persistenceFileKey])

  return (
    <div>
      <h3 className={styles.title}>样式配置</h3>
      <Form className={styles.form} labelAlign="left" footer={null}>
        <FormItem label="样式名称" state={formState.$.name} {...formItemLayout} required>
          <InputGroup style={{ width: '100%' }}>
            <TextInput style={{ width: '100%' }} disabled={isEditMode} placeholder="请输入样式名" state={formState.$.name} />
            <Select style={{ flex: '0 0 120px' }} disabled={isEditMode} searchable state={formState.$.nameSuffix}>
              <SelectOption value="">无后缀</SelectOption>
              {allowNameSuffixList.map(format => (
                <SelectOption
                  key={format}
                  value={format}
                >
                  .{format}
                </SelectOption>
              ))}
            </Select>
          </InputGroup>
        </FormItem>
        <FormItem state={formState.$.commands}>
          <Card
            type="bordered"
            className={styles.textAreaCard}
            title={(
              <CardTitle
                title="编辑处理接口"
                style={{ background: '#FAFAFA' }}
                extra={(
                  <HelpDocLink className={styles.descriptionLink} doc="mediaStyle">
                    查看多媒体处理使用说明
                  </HelpDocLink>
                )}
              />
            )}
          >
            <TextArea state={formState.$.commands} />
          </Card>
        </FormItem>
        {isForcePersistence && (
          <FormItem {...formItemLayout} labelWidth="90px" label={<span>结果自动保存</span>} labelVerticalAlign="text" tip={persistenceTipView}>
            <Switch state={formState.$.persistenceEnable} disabled={isForcePersistence} />
          </FormItem>
        )}
      </Form>
    </div>
  )
})
