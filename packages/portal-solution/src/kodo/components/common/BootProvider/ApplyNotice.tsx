/**
 * @file ApplyNotices
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { UserInfoStore } from 'portal-base/user/account'
import { NotificationStore } from 'portal-base/common/notification'

import { ConfigStore } from 'kodo/stores/config'

import { RegionApplyStore } from 'kodo/stores/region-apply'

import { App } from 'kodo/constants/app'
import { RegionSymbol } from 'kodo/constants/region'

interface Props {
  region: RegionSymbol
}

const ApplyNotice = observer((props: Props) => {
  const { region } = props
  const configStore = useInjection(ConfigStore)
  const userInfoStore = useInjection(UserInfoStore)
  const regionApplyStore = useInjection(RegionApplyStore)
  const notificationStore = useInjection(NotificationStore)
  const [noticeLoaded, setNoticeLoaded] = React.useState(false)

  const configStoreFullLoaded = configStore.isFullLoaded

  const isApplyEnable = React.useMemo(() => {
    if (!configStoreFullLoaded) return false
    if (!userInfoStore.isLoaded) return false
    if (userInfoStore.isIamUser) return false
    if (!configStore.isApp(App.Fog) && !configStore.isApp(App.Kodo)) return false

    const regionConfig = configStore.getRegion({ region })
    if (!regionConfig || regionConfig.invisible) return false

    return regionApplyStore.isApplyEnable(region)
  }, [
    region,
    configStore,
    regionApplyStore,
    configStoreFullLoaded,
    userInfoStore.isLoaded,
    userInfoStore.isIamUser
  ])

  React.useEffect(() => {
    if (!isApplyEnable) return
    if (noticeLoaded) return

    let ignore = false
    regionApplyStore.fetchApplyRecordList()
      .catch(() => { /** */ })
      .then(() => {
        if (ignore) return
        if (regionApplyStore.isApproved(region)) return
        const regionInfo = configStore.getRegion({ region })
        const link = (<a onClick={() => regionApplyStore.open(region)}>立即申请使用</a>)
        const noticeView = (<span>对象存储上线新区域 {regionInfo.name}，{link}。</span>)
        notificationStore.addItem({ type: 'info', content: noticeView })
        setNoticeLoaded(true)
      })
    return () => { ignore = true }
  }, [configStore, noticeLoaded, notificationStore, region, regionApplyStore, isApplyEnable])

  return null
})

export const ApplyNotices = observer(() => {
  const configStore = useInjection(ConfigStore)
  const userInfoStore = useInjection(UserInfoStore)

  if (userInfoStore.isGuest) return <></>
  if (!configStore.isFullLoaded) return <></>

  const allRegions = configStore.getRegion({ allRegion: true })
  const needApplyWithNotice = allRegions.filter(region => {
    if (region.invisible) return
    if (!region.apply?.enable) return
    if (!region.apply?.notice?.enable) return
    return true
  })

  if (needApplyWithNotice.length === 0) return <></>

  return (
    <>
      {needApplyWithNotice.map(region => (
        <ApplyNotice
          key={region.symbol}
          region={region.symbol}
        />
      ))}
    </>
  )
})
