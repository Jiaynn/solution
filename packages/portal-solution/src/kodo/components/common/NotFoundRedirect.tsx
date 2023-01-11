/**
 * @file component NotFoundRedirect
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { Identifier, useContainer } from 'qn-fe-core/di'

import { getNotFoundUrl } from 'kodo/routes/not-found'
import { GuestLayout } from './Layout/GuestLayout'

export function NotFoundRedirect() {
  const container = useContainer()
  const inject = React.useCallback(function inject<T>(identifier: Identifier<T>) {
    return container.get(identifier)
  }, [container])

  React.useEffect(() => {
    window.location.href = getNotFoundUrl(inject)
  }, [inject])

  return <GuestLayout />
}
