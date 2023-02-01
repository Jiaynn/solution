/*
 * @file component Error
 * @author nighca <nighca@live.cn>
 */

import React, { CSSProperties, ReactNode } from 'react'

import { ValidatorError, isEmpty } from 'cdn/transforms/form'

const defaultStyle: CSSProperties = {
  color: '#e55c5c',
  display: 'block',
  verticalAlign: 'middle',
  marginTop: '8px',
  lineHeight: '20px'
}

export interface Props {
  style?: CSSProperties
  error?: ValidatorError
  children?: ReactNode
}

export default function Error(props: Props) {
  if (isEmpty(props.error) && !props.children) {
    return null
  }

  return (
    <span
      className="error-wrapper"
      style={{ ...defaultStyle, ...props.style }}
    >
      {props.children || props.error}
    </span>
  )
}
