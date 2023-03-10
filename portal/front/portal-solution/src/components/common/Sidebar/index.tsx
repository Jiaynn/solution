import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { LowcodeSidebar } from 'components/common/App/lowcode'
import { imagePath, lowcodePath, messagePath } from 'utils/router'
import { ImageSidebar } from 'components/common/App/image'
import { MessageSidebar } from 'components/common/App/message'

export const Sidebar = observer(() => {
  const routerStore = useInjection(RouterStore)
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setPathname(routerStore.location.pathname)
    }, 60)
    return () => {
      clearInterval(timer)
    }
  }, [routerStore])

  if (pathname.startsWith(imagePath)) {
    return <ImageSidebar />
  }
  if (pathname.startsWith(messagePath)) {
    return <MessageSidebar />
  }
  if (pathname.startsWith(lowcodePath)) {
    return <LowcodeSidebar />
  }
  return null
})

