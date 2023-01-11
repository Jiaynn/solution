/**
 * @desc component for 视频瘦身
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable, reaction } from 'mobx'
import Form from 'react-icecream/lib/form'
import Disposable from 'qn-fe-core/disposable'
import { useInjection } from 'qn-fe-core/di'
import { Link, RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStoreWithoutEffect } from 'qn-fe-core/local-store'

import { getSearchDomainsParamsForVideoSlim } from 'cdn/transforms/video-slim'

import { VideoSlimRole } from 'cdn/constants/role'
import { videoSlimGuidesName, videoSlimGuideDescriptions } from 'cdn/constants/guide'
import { TaskState, VideoDef } from 'cdn/constants/video-slim'

import { GuideGroup, GuideMocker } from 'cdn/components/common/Guide'
import Role from 'cdn/components/common/Role'

import InlineForm from 'cdn/components/common/InlineForm'
import DomainSelect, * as domainSelect from 'cdn/components/common/DomainSelect' // TODO: 与 Log 里的合并下
import TipIcon from 'cdn/components/TipIcon'

import { IVideoSlimTask } from 'cdn/apis/video-slim'
import DomainApis from 'cdn/apis/domain'

import Routes from 'cdn/constants/routes'

import VideoSlimTaskList, { VideoSlimListInner, LocalStore } from './List'

import './style.less'

export interface IProps {
  domain?: string
}

interface PropsWithDeps extends IProps {
  routerStore: RouterStore
  domainApis: DomainApis
  routes: Routes
}

@observer
export class VideoSlimInner extends React.Component<PropsWithDeps> {
  // 选中的域名
  domainState = domainSelect.createState()

  disposable = new Disposable()

  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get domain() {
    return domainSelect.getValue(this.domainState)
  }

  @computed get domainFormView() {
    const domainState = this.domainState
    return (
      <InlineForm className="domain-form">
        <Role name={VideoSlimRole.DomainSelect}>
          <Form.Item className="form-item-domain" label="域名">
            <DomainSelect
              state={domainState}
              getDomains={params => this.props.domainApis.searchDomains(
                getSearchDomainsParamsForVideoSlim(params)
              )}
            />
          </Form.Item>
        </Role>
        <TipIcon tip="目前仅支持源站在七牛(不含东南亚)、且去参数缓存的普通域名和泛子域名" />
      </InlineForm>
    )
  }

  render() {
    const contentMap = new Map<VideoSlimRole, React.ReactNode>(
      Object.entries(videoSlimGuideDescriptions) as Array<[VideoSlimRole, React.ReactNode]>
    )

    const guideOrder = [
      VideoSlimRole.DomainSelect,
      VideoSlimRole.AddTask,
      VideoSlimRole.PreviewBtn,
      VideoSlimRole.EnableCDN,
      VideoSlimRole.StatisticsLink
    ]

    return (
      <div className="comp-video-slim">
        <GuideGroup name={videoSlimGuidesName} order={guideOrder} contentMap={contentMap}>
          {this.domainFormView}
          <p>
            建议为您的热点视频瘦身，可大幅减少视频体积，画质肉眼感知无变化，预览确认瘦身效果后启用分发（也可配置瘦身成功后自动启用分发），节省 CDN 流量；
            <Link relative to="/preview/demo" target="_blank">Demo 体验视频瘦身效果</Link>
          </p>
          <GuideMocker name={videoSlimGuidesName} mocked={<VideoSlimTaskListForGuide />}>
            <VideoSlimTaskList domain={this.domain} />
          </GuideMocker>
        </GuideGroup>
      </div>
    )
  }

  componentDidMount() {
    // 响应域名信息，获取对应的初始配置信息
    this.disposable.addDisposer(reaction(
      () => this.props.domain,
      domain => {
        if (domain) {
          this.domainState.onChange(domain)
        }
      },
      { fireImmediately: true }
    ))

    // 用户选择域名时，同步到 URL
    this.disposable.addDisposer(reaction(
      () => this.domain,
      domain => this.props.routerStore.replace(`${this.props.routerStore.location!.pathname}?domain=${domain}`)
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default observer(function VideoSlim(props: IProps) {
  const routerStore = useInjection(RouterStore)
  const domainApis = useInjection(DomainApis)
  const routes = useInjection(Routes)

  return (
    <VideoSlimInner routerStore={routerStore} domainApis={domainApis} routes={routes} {...props} />
  )
})

const mockedDomain = 'foo.com'

const mockedTaskInfo: Partial<IVideoSlimTask> = {
  domain: mockedDomain,
  cdnAutoEnable: false,
  avType: 'mp4',
  state: TaskState.SlimSuccess,
  originDef: VideoDef.HD,
  afterDef: VideoDef.HD,
  originDur: 3000,
  originSize: 12345,
  originBr: 1000,
  afterSize: 2345,
  afterDur: 3000,
  afterBr: 1000
}

function VideoSlimTaskListForGuide() {
  const toasterStore = useInjection(ToasterStore)
  const routes = useInjection(Routes)
  const store = useLocalStoreWithoutEffect(LocalStore, { domain: mockedDomain })

  useEffect(() => {
    store.collectionStore.update(
      (Object.keys(TaskState) as Array<keyof typeof TaskState>).map(state => ({
        ...mockedTaskInfo,
        state: TaskState[state],
        id: TaskState[state],
        resource: `/${TaskState[state]}`
      } as any))
    )
  }, [store])

  return (
    <VideoSlimListInner
      toasterStore={toasterStore}
      store={store}
      domain={mockedDomain}
      routes={routes}
    />
  )
}
