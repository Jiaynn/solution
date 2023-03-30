import React, { CSSProperties } from 'react'

import styles from './style.m.less'

interface InputTitleProps {
  title: string
  style?: CSSProperties
  titleStyle?: CSSProperties
  inputStyle?: CSSProperties
}

const InputWrapper: React.FC<InputTitleProps> = props => (
  <div className={styles.inputWrapper} style={props.style}>
    <div
      className={styles.title}
      style={props.titleStyle}
    >{`${props.title}：`}</div>
    <div className={styles.input} style={props.inputStyle}>
      {props.children}
    </div>
  </div>
)

export default InputWrapper
