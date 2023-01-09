/**
 * @file component UserInfo
 * @author nighca <nighca@live.cn>
 */

import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { UserInfoStore } from 'portal-base/user/account'
import { useRouteTitle, Link } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'

import { basename } from 'constants/routes'

interface Props {
  //
}

export default observer(function UserInfo(_props: Props) {

  const userInfoStore = useInjection(UserInfoStore)
  const setRouteTitle = useRouteTitle()
  const toasterStore = useInjection(ToasterStore)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userInfoStore.full_name) {
      setRouteTitle(`用户信息 - ${userInfoStore.full_name}`)
    }
  }, [userInfoStore.full_name, setRouteTitle])

  useEffect(() => {
    setIsLoading(true)
    toasterStore.promise(
      userInfoStore.fetch(),
      '获取用户信息成功'
    ).finally(() => setIsLoading(false))
  }, [userInfoStore, toasterStore])

  const main = (
    !userInfoStore.inited || isLoading
    ? (<p>loading...</p>)
    : (<pre>{JSON.stringify(userInfoStore, null, 4)}</pre>)
  )

  return (
    <div>
      <Link to={basename}>Home</Link>
      {main}
    </div>
  )

})
