/*
 * @file cases for qas specification component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'
import Specification from '.'

it.only('renders correctly', () => {
  const tree = new Renderer().createWithAct(
    <Specification />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
