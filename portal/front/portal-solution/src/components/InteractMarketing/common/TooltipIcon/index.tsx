import React from 'react'
import { Icon, Tooltip } from 'react-icecream'

const TooltipIcon: React.FC<{ title: string }> = ({ title }) => (
  <Tooltip arrowPointAtCenter placement="topLeft" title={title}>
    <Icon type="question-circle" />
  </Tooltip>
)

export default TooltipIcon
