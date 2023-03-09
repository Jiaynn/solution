import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { RouterStore } from 'qn-fe-core/router'

import { ImageSidebar } from '../App/image'
import { MessageSidebar } from '../App/message'
import { imagePath, messagePath } from 'utils/router'

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
  return null
})

