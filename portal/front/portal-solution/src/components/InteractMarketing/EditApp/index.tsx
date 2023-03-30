import React, { useEffect, useMemo, useState } from 'react'

import { Redirect, Route, RouterStore, Switch } from 'portal-base/common/router'

import { useInjection } from 'qn-fe-core/di'

import { Button, Divider, Spin } from 'react-icecream'

import { observer } from 'mobx-react'

import AppConfigStore from 'store/interactMarketing/appConfig'

import Integration from './Integration'
import EditStep from './EditStep'
import Components from './Components'
import BasicInfo from './BasicInfo'

import PageContainer from '../common/PageContainer'
import useInteractMarketingRouter from 'routes/useLowcodeRouter'

export interface EditStepHeaderProps {
  updateMode?: boolean
}

const EditApp: React.FC<EditStepHeaderProps> = observer(props => {
  const beforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    const msg = '刷新页面会清空当前未保存的已填写内容信息，请确定是否要继续'
    e.returnValue = msg // chrome or firefox
    return msg // safari
  }

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  })

  const { updateMode = false } = props
  const appConfigStore = useInjection(AppConfigStore)
  const router = useInteractMarketingRouter()
  const appId = router.routerStore.query.appId as string

  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      appConfigStore.resetConfig()
      if (updateMode) {
        await appConfigStore.fetchConfigByAppId(appId)
      }
      setLoadingConfig(false)
    }
    fetchConfig()
  }, [appId, updateMode])

  const routerStore = useInjection(RouterStore)

  const currentStep = useMemo(
    () => Number(routerStore.location?.pathname.split('/').pop() || '0'),
    [routerStore.location?.pathname]
  )

  const isStepping = currentStep < 4
  const showPrev = currentStep > 1

  const onStep1Next = async () => {
    if (!appConfigStore.isAppNameLegal) {
      const el = document.querySelector('#input-app-name') as HTMLInputElement
      el.focus()
      return
    }

    if (updateMode) {
      router.toAppEdit(appId, '2')
    } else {
      router.toAppCreate('2')
      appConfigStore.selectDefaultComp()
    }
  }

  const onStep2Next = async () => {
    if (updateMode) {
      router.toAppEdit(appId, '3')
      return
    }

    router.toAppCreate('3')
  }

  const onStep3Next = () => {
    const {
      hub,
      publishRtmp,
      liveRtmp,
      liveHls,
      liveHdl,
      RTCApp,
      IMServer,
      bucket,
      addr
    } = appConfigStore.config

    const focusElement = (selector: string) => {
      const el = document.querySelector(selector) as HTMLDivElement
      el.tabIndex = 0
      el.focus()
    }

    if (!hub.length) {
      return focusElement('#integration-hub')
    }
    if (!publishRtmp.length) {
      return focusElement('#integration-hub-domains')
    }
    if (!liveRtmp.length) {
      return focusElement('#integration-hub-domains')
    }
    if (!liveHls.length) {
      return focusElement('#integration-hub-domains')
    }
    if (!liveHdl.length) {
      return focusElement('#integration-hub-domains')
    }
    if (!RTCApp.length) {
      return focusElement('#integration-rtc')
    }
    if (!IMServer.length) {
      return focusElement('#integration-im')
    }
    if (appConfigStore.isSelectedSafeComp) {
      if (!bucket?.length) {
        return focusElement('#integration-bucket')
      }
      if (!addr?.length) {
        return focusElement('#integration-addr')
      }
    }

    setLoadingConfig(true)
    if (updateMode) {
      appConfigStore
        .updateApp(appId)
        .then(() => {
          router.toEditCompleted(appId)
        })
        .finally(() => {
          setLoadingConfig(false)
        })
      return
    }

    appConfigStore
      .createApp()
      .then(appIdRes => {
        router.toCreateCompleted(appIdRes || '')
      })
      .finally(() => {
        setLoadingConfig(false)
      })
  }

  const onPrev = () => {
    if (updateMode) {
      router.toAppEdit(appId, (currentStep - 1) as unknown as any)
      return
    }
    router.toAppCreate((currentStep - 1) as unknown as any)
  }

  const onNext = () => {
    const stepClickList = [onStep1Next, onStep2Next, onStep3Next]
    stepClickList[currentStep - 1]?.()
  }

  return (
    <PageContainer title="编辑应用">
      <Switch>
        <Route relative exact path="/">
          <Redirect relative to="/1" />
        </Route>
        <Route
          relative
          exact
          path="/:id"
          component={args => {
            const innerStep = Number(args.match.params.id)

            return (
              <div>
                <EditStep step={innerStep} />
                <Spin spinning={loadingConfig}>
                  {innerStep === 1 && <BasicInfo />}
                  {innerStep === 2 && <Components />}
                  {innerStep === 3 && <Integration />}
                </Spin>

                {isStepping && <Divider />}
                {isStepping && showPrev && (
                  <Button onClick={onPrev}>上一步</Button>
                )}
                {isStepping && (
                  <Button type="primary" onClick={onNext}>
                    下一步
                  </Button>
                )}
              </div>
            )
          }}
        />
      </Switch>
    </PageContainer>
  )
})

export default EditApp
