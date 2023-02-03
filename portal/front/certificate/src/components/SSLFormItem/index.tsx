/*
 * @file component certificate utils for Form
 * @author Yao Jingtian <yncst233@gmail.com>
 */
import React from 'react'

import Form from 'react-icecream/lib/form'

const FormItem = Form.Item

export interface IFormItemProps {
  FormItemClassName?: string,
  label?: React.ReactNode,
  required?: boolean,
  layout?: {labelCol?: {span: number}, wrapperCol?: {span: number}},
  fieldName: string,
  getFieldDecorator: (name: string, options: any) => any,
  rules: object[],
  initialValue?: any,
  trigger?: string,
  component: any,
  addon?: any,
  hasFeedback?: boolean
}

export function SSLFormItem(props: IFormItemProps) {
  const {
    FormItemClassName, label, required, layout, fieldName,
    getFieldDecorator, rules, initialValue, trigger, component,
    addon, hasFeedback
  } = props

  return (
    <FormItem
      label={label || ''}
      className={FormItemClassName || ''}
      required={required || false}
      hasFeedback={hasFeedback || false}
      {...layout || null}
    >
      {
        getFieldDecorator(fieldName || '', {
          rules,
          initialValue: initialValue || undefined,
          validateTrigger: trigger || 'onChange'
        })(component)
      }
      {
        addon || null
      }
    </FormItem>
  )
}
