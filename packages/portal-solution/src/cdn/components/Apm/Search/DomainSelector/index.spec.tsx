import React from 'react'

import { RendererUtils as Renderer } from 'test'
import { IDomainSelectorProps } from './store'
import DomainSelector from '.'

const noop = () => null

it('renders correctly', () => {
  const props: IDomainSelectorProps = {
    value: undefined,
    onChange: noop
  }
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <DomainSelector {...props} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
