import React from 'react'
import { Button } from 'react-icecream'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lowcodePath } from 'utils/router'

import './style.less'

const prefixCls = 'welcome'

export const Welcome = () => {
  const routerStore = useInjection(RouterStore)

  const onClick = () => {
    routerStore.push(`${lowcodePath}/scenes`)
  }

  return (
    <div className={prefixCls}>
      <Button type="primary" onClick={onClick}>/list</Button>
    </div>
  )
}
