import React from 'react'

import { RendererUtils as Renderer } from 'test'

import Swiper from '.'

class MockedSwiper {
  static use = jest.fn()
}

jest.mock('swiper/dist/js/swiper.esm', () => ({
  Swiper: MockedSwiper,
  Navigation: jest.fn(),
  Pagination: jest.fn(),
  Scrollbar: jest.fn()
}))

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <Swiper />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
