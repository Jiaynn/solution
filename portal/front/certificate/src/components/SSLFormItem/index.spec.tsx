/**
 * @file test cases for component SSLFormItem
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import Input from 'react-icecream/lib/input'
import Form from 'react-icecream/lib/form'

import { RendererUtils as Renderer } from '../../utils/test'
import { IFormItemProps, SSLFormItem } from '.'

class NecessaryFormClass extends React.Component<any, any> {
  render() {
    const { getFieldDecorator } = this.props.form
    const necessaryProps: IFormItemProps = {
      fieldName: 'foo',
      rules: [{ required: true, message: '必填' }],
      component: <Input type="text" />,
      getFieldDecorator
    }

    return (
      <Form>
        <SSLFormItem {...necessaryProps} />
      </Form>
    )
  }
}
const NecessaryForm = Form.create({})(NecessaryFormClass as any)

class AllFormClass extends React.Component<any, any> {
  render() {
    const { getFieldDecorator } = this.props.form

    const allProps = {
      FormItemClassName: 'form-control',
      label: 'bar',
      required: true,
      layout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      fieldName: 'foo',
      getFieldDecorator,
      rules: [{ required: true, message: '必填' }],
      initialValue: 'text',
      trigger: 'onBlur',
      component: <Input type="text" />,
      addon: <div>plus</div>,
      hasFeedback: true
    }
    return (
      <Form>
        <SSLFormItem {...allProps} />
      </Form>
    )
  }
}
const AllForm = Form.create({})(AllFormClass as any)

it('renders correctly with necessary props', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <NecessaryForm />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with all props', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <AllForm />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
