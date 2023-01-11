/**
 * @file test cases for component EditableCell
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import EditableCell from '.'

const value = 'foo'
const editable = true
const uneditable = false
const onChange = (val: any) => { console.log(val) }
const onCancel = () => { console.log('cancelled') }

it('renders correctly when uneditable', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <EditableCell
      value={value}
      editable={uneditable}
      onChange={onChange}
      onCancel={onCancel} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly when editable', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <EditableCell
      value={value}
      editable={editable}
      onChange={onChange}
      onCancel={onCancel} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
