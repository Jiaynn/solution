import React from 'react'
import { observer } from 'mobx-react'
import Button from 'react-icecream/lib/button'

import TipIcon from 'cdn/components/TipIcon'

export interface IConfigureButtonProps {
  shouldForbid?: string
  onClick: () => void
  children?: any
}

export default observer(function ConfigureButton(props: IConfigureButtonProps) {
  const { shouldForbid, onClick, children } = props

  if (!shouldForbid) {
    return (
      <Button onClick={onClick}>{children}</Button>
    )
  }

  return (
    <p>
      <Button disabled onClick={onClick}>{children}</Button>
      <TipIcon className="configure-tip" tip={shouldForbid} />
    </p>
  )
})
