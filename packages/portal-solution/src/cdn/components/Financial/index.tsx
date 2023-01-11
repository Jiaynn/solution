/**
 * @file Financial Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import Page from 'portal-base/common/components/Page'

import User from './User'
import Bill from './common/Bill'

export default observer(function SubAccountFinancial() {
  const userInfoStore = useInjection(UserInfo)

  return (
    <Page>
      {
        userInfoStore.parent_uid !== 0
          ? <Bill queryOptions={{ uid: userInfoStore.uid! }} />
          : <User />
      }
    </Page>
  )
})
