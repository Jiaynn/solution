/*
 * @file common info icon for tip
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'

const iconStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'normal',
  color: '#999',
  marginLeft: '4px',
  verticalAlign: '-0.125em',
  cursor: 'pointer'
}

export default function TipIcon(props: {
  tip: React.ReactNode
  className?: string
  maxWidth?: string
  size?: string
  color?: string
}) {
  const iconFinalStyle = { ...iconStyle }
  if (props.size) {
    iconFinalStyle.fontSize = props.size
  }
  if (props.color) {
    iconFinalStyle.color = props.color
  }
  return (
    <Tooltip title={props.tip} overlayStyle={{ fontSize: '12px', lineHeight: '1.5em', maxWidth: props.maxWidth || '300px' }}>
      <Icon className={props.className} style={iconFinalStyle} type="info-circle" />
    </Tooltip>
  )
}
