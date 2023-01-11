import React from 'react'

import { RendererUtils as Renderer } from 'test'
import AlarmItemInput, * as alarmItemInput from './AlarmItemInput'

it('renders AlarmFiedlInput correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <AlarmItemInput state={alarmItemInput.createState()} deletable onDelete={() => null} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
