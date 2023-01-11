import React from 'react'
import { observer } from 'mobx-react'
import { Iamed } from 'portal-base/user/iam'

import Link, { Props as LinkProps } from './common/Link/LegacyLink'

export default observer(function IamedLink(props: {
  actions: string[]
  resources?: string[]
} & LinkProps) {
  const { actions, resources, children, ...propsForLink } = props

  return (
    <Iamed actions={actions}
      resources={resources}
      component={({ shouldDeny }) => (
        <Link {...propsForLink} disabled={shouldDeny}>
          {children}
        </Link>
      )}
    />
  )
})
