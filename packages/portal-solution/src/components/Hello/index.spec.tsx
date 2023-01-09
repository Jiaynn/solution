import React from 'react'
import { RouterStore } from 'portal-base/common/router'

import { basename } from 'constants/routes'
import { RendererUtils as Renderer } from 'utils/test'
import Hello from '.'

it('render result should match snapshot', () => {
  const renderer = new Renderer()
  renderer.inject(RouterStore).push(`${basename}/hello`)
  const tree = renderer.createWithAct(
    <Hello test="???" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
