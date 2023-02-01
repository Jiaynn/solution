import React from 'react'

import { createOemRendererWithRouter } from 'test'

import UserSubAccount from '.'

const renderer = createOemRendererWithRouter()

it('renders correctly', () => {
  const tree = renderer.createWithAct(
    <UserSubAccount />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
