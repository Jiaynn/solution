/**
 * @file test cases for component InputNumber
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import InputNumber from '.'

const type = 'normal'
const value = 10
const handleUp = (val: string) => { console.log(val) }
const handleDown = (val: string) => { console.log(val) }
const handleChange = (targetType: string) => { console.log(targetType) }
const handleBlur = (targetType: string) => { console.log(targetType) }
const canChange = () => true

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <InputNumber
      type={type}
      value={value}
      handleUp={handleUp}
      handleDown={handleDown}
      handleChange={handleChange}
      handleBlur={handleBlur}
      canChange={canChange}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
