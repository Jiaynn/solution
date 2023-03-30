import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'

import React from 'react'
import { Route, Switch } from 'portal-base/common/router'

import { basenameMap, nameMap, Solution } from 'constants/solutions'
import { UnifyMessage } from 'components/message/UnifyMessage'

const title = nameMap[Solution.Message]

export const messageBasename = basenameMap[Solution.Message]

export const MessageSidebar = observer(() => <SubSidebar title={title}>
  <LinkItem to="/message" relative>通道管理</LinkItem>
</SubSidebar>)

export const MessageRouter = (
  <Route relative title={title} path={messageBasename}>
    <Switch>
      <Route exact relative title={title} path="/">
        <UnifyMessage />
      </Route>

    </Switch>
  </Route>
)
