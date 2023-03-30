import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { CheckCircleFilledIcon } from 'react-icecream-2/icons'

import { Button, Divider, Empty, Spin } from 'react-icecream'

import { useLocalStore } from 'qn-fe-core/local-store'

import PageContainer from '../common/PageContainer'
import useInteractMarketingRouter from '../../../routes/useLowcodeRouter'
import AppInfoStore from './store'
import DownloadModal, { ModalContext } from '../common/DownloadModal'

import styles from './style.m.less'
import PiliDomainInfo from './PiliDomainInfo'
import KodoDomainInfo from './KodoDomainInfo'
import PiliHubInfo from './PiliHubInfo'
import RtcAppInfo from './RtcAppInfo'
import RtcImInfo from './RtcImInfo'
import KodoBucketInfo from './KodoBucketInfo'

const PAGE_TITLE = {
  normal: '应用信息',
  create: '创建应用',
  edit: '编辑应用'
} as const

const DESC_TITLE = {
  create: '应用创建完成',
  edit: '应用编辑完成'
} as const

interface AppInfoWithDescriptionProps {
  type: 'normal' | 'create' | 'edit'
}

const SingleLineInfo: React.FC<{ title: string }> = props => {
  const { title, children } = props
  return (
    <div className={styles.info}>
      <div className={styles.title}>{`${title}：`}</div>
      <div className={styles.contentWrapper}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

const GridInfo: React.FC<{ title: string }> = props => {
  const { title, children } = props
  return (
    <div className={styles.info}>
      <div className={styles.title}>{`${title}：`}</div>
      <div className={styles.contentWrapper}>
        <div className={styles.grid}>{children}</div>
      </div>
    </div>
  )
}

const ListInfo: React.FC<{ title: string }> = props => {
  const { title, children } = props
  return (
    <div className={styles.info}>
      <div className={styles.title}>{`${title}：`}</div>
      <div className={styles.contentWrapper}>
        <div className={styles.list}>{children}</div>
      </div>
    </div>
  )
}

const AppInfo: React.FC<AppInfoWithDescriptionProps> = observer(props => {
  const { type } = props
  const showDescription = type === 'create' || type === 'edit'

  const router = useInteractMarketingRouter()
  const infoStore = useLocalStore(AppInfoStore)

  const { appId, downloadable, loading, empty } = infoStore
  const {
    appName,
    appScenariosVo,
    integrationWayVo,
    components,
    hub,
    piliDomain,
    RTCApp,
    IMServer,
    kodo
  } = infoStore.info

  const onClickBtnToPage = useMemo(
    () => (showDescription
        ? () => router.toAppList()
        : () => router.toAppEdit(appId)),
    [showDescription, router, appId]
  )

  const [visible, setVisible] = useState(false)

  return (
    <PageContainer title={PAGE_TITLE[type]}>
      <Spin spinning={loading}>
        {empty
? (
  <Empty />
        )
: (
  <div className={styles.appInfoWrapper}>
    <ModalContext.Provider value={{ visible, setVisible }}>
      <DownloadModal appId={appId} />
    </ModalContext.Provider>
    {showDescription && (
      <>
        <CheckCircleFilledIcon width={60} height={60} color="#52c41a" />

        <div className={styles.descTitle}>{DESC_TITLE[type]}</div>

        <div className={styles.desc}>
          你以完成了低代码电商直播方案的基本配置，详细信息如下，也可以通过应用列表页面再次查看和编辑。
          <br />
          源文件打包生产需要一定的时间，您可以在大约半小时后进入应用列表页操作栏中下载，也可以刷新页面，在下方点击下载。
        </div>
      </>
    )}

    <div className={styles.infoWrapper}>
      <SingleLineInfo title="应用ID">{appId}</SingleLineInfo>
      <SingleLineInfo title="应用名称">{appName}</SingleLineInfo>
      <SingleLineInfo title="应用场景">{appScenariosVo}</SingleLineInfo>
      <SingleLineInfo title="应用名称">{appName}</SingleLineInfo>
      <SingleLineInfo title="集成方式">
        {integrationWayVo}
      </SingleLineInfo>
      <GridInfo title="选装组件">
        {components.map(c => (
          <div className={styles.content} key={c.name}>
            {c.name}
          </div>
        ))}
      </GridInfo>
      <SingleLineInfo title="直播空间">
        <PiliHubInfo hub={hub} />
      </SingleLineInfo>
      <ListInfo title="直播域名">
        <PiliDomainInfo
          type="publishRtmp"
          hub={hub}
          domain={piliDomain.publishRtmp}
        />
        <PiliDomainInfo
          type="liveRtmp"
          hub={hub}
          domain={piliDomain.liveRtmp}
        />
        <PiliDomainInfo
          type="liveHls"
          hub={hub}
          domain={piliDomain.liveHls}
        />
        <PiliDomainInfo
          type="liveHdl"
          hub={hub}
          domain={piliDomain.liveHdl}
        />
      </ListInfo>
      <SingleLineInfo title="RTC应用">
        <RtcAppInfo rtcApp={RTCApp} />
      </SingleLineInfo>
      <SingleLineInfo title="通讯服务">
        <RtcImInfo rtcApp={RTCApp} im={IMServer} />
      </SingleLineInfo>
      {kodo && (
        <>
          {kodo.bucket && kodo.bucket.length && (
            <SingleLineInfo title="RTC应用">
              <KodoBucketInfo bucket={kodo.bucket} />
            </SingleLineInfo>
          )}
          {kodo.addr && kodo.addr.length && (
            <SingleLineInfo title="外链域名">
              <KodoDomainInfo bucket={kodo.bucket} domain={kodo.addr} />
            </SingleLineInfo>
          )}
          {kodo.callback && kodo.callback.length && (
            <SingleLineInfo title="回调域名">
              {kodo.callback}
            </SingleLineInfo>
          )}
        </>
      )}
    </div>
    <Divider />
    <div className={styles.footer}>
      <Button type="primary" onClick={onClickBtnToPage}>
        {showDescription ? '查看应用列表' : '编辑应用'}
      </Button>
      <Button
        type="primary"
        disabled={!downloadable}
        onClick={() => setVisible(true)}
      >
        {downloadable ? '获取源码文件' : '源码文件打包中，请稍等'}
      </Button>
    </div>
  </div>
        )}
      </Spin>
    </PageContainer>
  )
})

export default AppInfo
