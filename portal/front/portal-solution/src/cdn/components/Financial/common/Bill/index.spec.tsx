import React from 'react'
import MockDate from 'mockdate'

import { OemRendererUtils } from 'test'

MockDate.set('2020-05-01')

import Bill from '.'

it('renders correctly', () => {
  const tree = new OemRendererUtils().createWithAct(
    <Bill queryOptions={{ uid: 10086 }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
  MockDate.reset()
})
