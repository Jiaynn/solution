/**
 * @file base options component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { FormItem, InputGroup, Select, SelectOption, TextInput } from 'react-icecream-2/form-x'

import FormSection from '../FormSection'

import styles from './style.m.less'

const baseFormItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

type BaseOptionsStateItem<SFT extends string, OFT extends string, NT extends string> = FormState<{
  name: FieldState<string>
  nameSuffix: FieldState<NT>
  sourceFormat: FieldState<SFT>
  outputFormat: FieldState<OFT>
}>

export interface Props<SFT extends string, OFT extends string, NT extends string> {
  isEditMode: boolean
  formLabelWidth?: string
  sourceFormatList: SFT[]
  outputFormatList: OFT[]
  sourceFormatDisabled?: boolean
  outputFormatDisabled?: boolean
  outputFormatInvisible?: boolean
  emptyOutputFormatDisabled?: boolean
  state: BaseOptionsStateItem<SFT, OFT, NT>
}

export const BaseOptionsForm = observer(
  function BaseOptionsForm<SFT extends string, OFT extends string, NT extends string>(props: Props<SFT, OFT, NT>) {

    const {
      name,
      nameSuffix,
      sourceFormat,
      outputFormat
    } = props.state.$

    const {
      isEditMode,
      formLabelWidth,
      sourceFormatList,
      outputFormatList,
      sourceFormatDisabled,
      outputFormatDisabled,
      outputFormatInvisible,
      emptyOutputFormatDisabled
    } = props

    const formItemLayout = {
      ...baseFormItemLayout,
      labelWidth: formLabelWidth || baseFormItemLayout.labelWidth
    }

    const nameSuffixDisabled = React.useMemo(() => (
      (!sourceFormat.value && !outputFormat.value) || isEditMode
    ), [isEditMode, outputFormat.value, sourceFormat.value])

    const nameSuffixFormatList = React.useMemo<string[]>(() => {
      if (!outputFormat.value && sourceFormat.value) {
        return [sourceFormat.value]
      }
      if (outputFormat.value) {
        return [outputFormat.value]
      }
      return []
    }, [outputFormat.value, sourceFormat.value])

    return (
      <FormSection title="样式配置">
        <FormItem
          label="源文件格式"
          state={sourceFormat}
          {...formItemLayout}
          tip={sourceFormat.value && '该样式仅对该文件格式生效，其他格式需要另建样式。'}
        >
          <Select
            searchable
            className={styles.sourceSelect}
            state={sourceFormat}
            disabled={isEditMode || sourceFormatDisabled}
          >
            <SelectOption value="">所有格式</SelectOption>
            {sourceFormatList.map(format => (
              <SelectOption key={format} value={format}>
                {format}
              </SelectOption>
            ))}
          </Select>
        </FormItem>
        <FormItem label="样式名称" state={name} {...formItemLayout} required>
          <InputGroup style={{ width: '100%' }}>
            <TextInput className={styles.nameInput} disabled={isEditMode} placeholder="请输入样式名" state={name} />
            <Select searchable className={styles.nameSuffixSelect} disabled={nameSuffixDisabled} state={nameSuffix}>
              <SelectOption value="">无后缀</SelectOption>
              {nameSuffixFormatList.map(format => (
                <SelectOption key={format} value={format}>
                  {`.${format}`}
                </SelectOption>
              ))}
            </Select>
          </InputGroup>
        </FormItem>
        {!outputFormatInvisible && (
          <FormItem label="输出格式" state={outputFormat} {...formItemLayout}>
            <Select
              searchable
              state={outputFormat}
              className={styles.outputSelect}
              disabled={isEditMode || outputFormatDisabled}
            >
              {!emptyOutputFormatDisabled && (
                <SelectOption value="">与源文件一致</SelectOption>
              )}
              {outputFormatList.map(format => (
                <SelectOption key={format} value={format}>
                  {format}
                </SelectOption>
              ))}
            </Select>
          </FormItem>
        )}
      </FormSection>
    )
  }
)
