import React from 'react'
import moment from 'moment'

import { RendererUtils as Renderer } from 'test'
import DateRangePicker from './DateRangePicker'

const noop = () => null

it('renders correctly', () => {
  const tree = new Renderer().createWithAct(
    <DateRangePicker value={[moment('2018-08-09'), moment('2018-08-10')]} onChange={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
