/**
 * @description color picker component
 * @author duli <duli@qiniu.com>
 */

import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { InputGroup, InputGroupItem, TextInput, Popover } from 'react-icecream-2'

import { colorReg } from './constants'

import styles from './style.m.less'

interface Props {
  className?: string
  value?: string
  emptyValue?: string
  onChange?: (color: string) => void
  placeholder?: string
}

export default function ColorPicker({ className, value, onChange, placeholder, emptyValue }: Props) {
  const picker = <HexColorPicker color={value} onChange={onChange} />
  const [validatedColor, setValidatedColor] = useState(value && colorReg.test(value) ? value : '#000000')
  useEffect(() => {
    if (value && colorReg.test(value)) {
      setValidatedColor(value)
    }
  }, [value])
  const handleBlur = () => {
    if (!value && !!onChange && !!emptyValue) onChange(emptyValue)
  }
  return (
    <div className={`${styles.colorPickerWrap} ${className || ''}`}>
      <InputGroup style={{ width: '120px' }}>
        <TextInput inputProps={{ onBlur: handleBlur }} value={value} onChange={onChange} placeholder={placeholder} />
        <InputGroupItem className={styles.color} style={{ backgroundColor: validatedColor }}>
          <Popover overlayClassName={styles.picker} content={picker} trigger="click" placement="top">
            <div style={{ width: '100%', height: '100%' }} />
          </Popover>
        </InputGroupItem>
      </InputGroup>
    </div>
  )
}
