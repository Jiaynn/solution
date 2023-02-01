import React from 'react'

import { RendererUtils as Renderer } from 'test'

import DomainApis from 'cdn/apis/domain'
import DomainInput, { createState } from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const state = createState(renderer.inject(DomainApis))
  const tree = renderer.createWithAct(
    <DomainInput state={state} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
