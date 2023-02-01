import React from 'react'

import { OemRendererUtils as Renderer } from 'test'

import { DateMocker } from 'cdn/test/utils'

import Financial from '.'

it('renders correctly', () => new DateMocker().mock(() => {
  const tree = new Renderer().createWithAct(
    <Financial />
  ).toJSON()
  expect(tree).toMatchSnapshot()
}))

