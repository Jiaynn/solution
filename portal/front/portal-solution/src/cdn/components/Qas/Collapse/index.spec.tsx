/*
 * @file cases for collapse component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'
import Collapse, { Panel, CollapseStore } from '.'

it('renders correctly without panel', () => {
  const tree = new Renderer().createWithAct(
    <Collapse />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with panel', () => {
  const store = new CollapseStore(['panel1', 'panel2'])
  const tree = new Renderer().createWithAct(
    <Collapse>
      <Panel title="test panel 1" key="panel1" store={store} />
      <Panel title="test panel 2" key="panel2" store={store} />
    </Collapse>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
