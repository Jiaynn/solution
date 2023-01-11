import React from 'react'
import moment from 'moment'

import { RendererUtils as Renderer } from 'test'

jest.mock('react-icecream/lib/spin', () => ({
  __esModule: true,
  default: (props: React.PropsWithChildren<{}>) => <div>{props.children}</div>
}))

jest.mock('react-icecream-charts/lib/map', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  MapChart: (props: React.PropsWithChildren<{}>) => <p>{JSON.stringify(props, null, 2)}</p>
}))

import { isps } from 'cdn/constants/isp'
import { areas } from 'cdn/constants/region'
import StatisticsSpeed from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <StatisticsSpeed options={{
      domains: [],
      startDate: moment('20180613'),
      endDate: moment('20180613'),
      region: [areas.global],
      isp: isps.all
    }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with domains', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <StatisticsSpeed options={{
      domains: ['portal.qiniu.com'],
      startDate: moment('20180613'),
      endDate: moment('20180613'),
      region: [areas.global],
      isp: isps.all
    }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with regions & isp', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <StatisticsSpeed options={{
      domains: ['portal.qiniu.com'],
      startDate: moment('20180613'),
      endDate: moment('20180613'),
      region: [areas.global],
      isp: isps.all
    }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
