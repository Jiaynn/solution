/**
 * @file base options component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, FormState, ValueOf } from 'formstate-x'

import { BaseOptionsForm } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/BaseOptionsForm'

import { styleNameValidator } from '../../../common/command'
import { sourceFormatList, outputFormatList } from '../../constants'
import { ImageBaseOptions } from '../../command'

export function createBaseFormState(initialValue?: Partial<ImageBaseOptions>, isEditMode = false) {
  const {
    name = '',
    nameSuffix = 'jpg',
    outputFormat = '',
    sourceFormat = 'jpg'
  } = initialValue || {}
  const nameField = new FieldState<string>(name)
  const nameSuffixField = new FieldState<string>(nameSuffix)
  const outputFormatField = new FieldState<string>(outputFormat)
  const sourceFormatField = new FieldState<string>(sourceFormat)

  // 格式校验
  nameField
    .disableValidationWhen(() => isEditMode)
    .validators(v => styleNameValidator(v, nameSuffixField.value))

  nameSuffixField
    .disableValidationWhen(() => isEditMode)

  // 业务关系
  const reactionDispose = reaction(
    () => [
      sourceFormatField.value,
      outputFormatField.value
    ],
    ([sourceFormatValue, outputFormatValue]) => {
      // 编辑模式关闭副作用处理
      if (isEditMode) return

      // 如果输出格式切换为具体格式
      // 则设置后缀与其保持相同
      if (outputFormatValue) {
        nameSuffixField.onChange(outputFormatValue)
        return
      }

      // 当源文件格式 = 所有格式
      // 且输出格式是与源文件一致时
      // 后缀只能是不带后缀，即为空
      if (!sourceFormatValue && !outputFormatValue) {
        nameSuffixField.onChange('')
        return
      }

      // 输出格式是与原图一致时
      // 后缀与源文件格式保持一致
      if (!outputFormatValue) {
        nameSuffixField.onChange(sourceFormatValue)
      }
    }
  )

  const combinedFormState = new FormState({
    name: nameField,
    nameSuffix: nameSuffixField,
    outputFormat: outputFormatField,
    sourceFormat: sourceFormatField
  })

  // eslint-disable-next-line dot-notation
  combinedFormState['addDisposer'](reactionDispose)

  return combinedFormState
}

export type BaseFormStateType = ReturnType<typeof createBaseFormState>
export type BaseFormStateValue = ValueOf<BaseFormStateType>

export interface Props {
  isEditMode: boolean
  formState: BaseFormStateType
  sourceFormatDisabled: boolean
}

export const BaseOptions = observer(function BaseOptions(props: Props) {
  const { isEditMode, formState, sourceFormatDisabled } = props

  return (
    <BaseOptionsForm
      state={formState}
      isEditMode={isEditMode}
      sourceFormatList={sourceFormatList}
      outputFormatList={outputFormatList}
      sourceFormatDisabled={sourceFormatDisabled}
    />
  )
})