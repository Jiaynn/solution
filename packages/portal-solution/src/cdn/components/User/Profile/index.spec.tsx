import React from 'react'
import { RouterStore } from 'portal-base/common/router'

import { createRendererWithRouter } from 'test'

import UserProfile from '.'

const renderer = createRendererWithRouter()

it('renders correctly', () => {
  const routerStore = renderer.inject(RouterStore)
  routerStore.push('/user/profile')
  const tree = renderer.create(
    <UserProfile />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
