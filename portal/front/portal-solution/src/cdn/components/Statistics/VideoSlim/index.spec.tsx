import React from 'react'
import moment from 'moment'

import { RendererUtils as Renderer } from 'test'

jest.mock('react-icecream-charts/lib/area', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AreaChart: (props: React.PropsWithChildren<{}>) => <p>{JSON.stringify(props, null, 2)}</p>
}))

jest.mock('antd/lib/spin', () => ({
  __esModule: true,
  default: (props: React.PropsWithChildren<{}>) => <div className="mock-antd-spin">{props.children || null}</div>
}))

import StatisticsVideoSlim from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <StatisticsVideoSlim options={{
      domains: [],
      startDate: moment('20180613'),
      endDate: moment('20180613')
    }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with domains', () => {
  const renderer = new Renderer()

  const tree = renderer.createWithAct(
    <StatisticsVideoSlim options={{
      domains: ['portal.qiniu.com'],
      startDate: moment('20180613'),
      endDate: moment('20180613')
    }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
