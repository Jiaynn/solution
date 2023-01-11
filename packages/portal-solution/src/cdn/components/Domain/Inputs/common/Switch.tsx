/*
 * @file common Switch
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import IcecreamSwitch from 'react-icecream/lib/switch'

export default function Switch(props: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  checkedChildren?: string
  unCheckedChildren?: string
}) {
  return (
    <IcecreamSwitch
      checkedChildren={props.checkedChildren || '开启'}
      unCheckedChildren={props.unCheckedChildren || '关闭'}
      {...props}
    />
  )
}
