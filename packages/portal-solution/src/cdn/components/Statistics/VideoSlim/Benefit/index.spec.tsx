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

import VideoSlimBenefit from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <VideoSlimBenefit options={{ domains: ['foo.com'], startDate: moment('2018-12-01'), endDate: moment('2018-12-04') }} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
