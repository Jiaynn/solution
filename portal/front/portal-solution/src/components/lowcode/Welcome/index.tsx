import React from 'react'
import { Button } from 'react-icecream'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { lowcodePath } from 'utils/router'

export const LowcodeWelcome = () => {
  const routerStore = useInjection(RouterStore)

  const onClick = () => {
    routerStore.push(`${lowcodePath}/scene/list`)
  }

  return <Button type="primary" onClick={onClick}>/list</Button>
}
