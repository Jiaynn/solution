/**
 * @file Alarm Callback Manage
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import { useFormstateX } from 'react-icecream-2/form-x'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'
import { Link } from 'portal-base/common/router'

import { textPattern } from 'cdn/transforms/form'

import { ModalStore, IModalProps } from 'cdn/stores/modal'

import { useAsync } from 'cdn/hooks/api'

import callbackDoc from 'cdn/docs/alarm-callback.pdf'

import { httpUrl } from 'cdn/constants/pattern'

import TipIcon from 'cdn/components/TipIcon'

import AlarmCallbackApis, { CallbackInfo } from 'cdn/apis/alarm/callback'

import './style.less'

interface ModalProps extends IModalProps {
  title?: string
  visible: boolean
  state: State
}

const CallbackUriModel = observer(function _CallbackUriModel({
  state,
  title,
  visible,
  onCancel,
  onSubmit
}: ModalProps) {

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    state.validate().then(({ hasError }) => {
      if (!hasError) {
        onSubmit()
      }
    })
  }

  return (
    <Modal
      onOk={handleSubmit}
      onCancel={onCancel}
      visible={visible}
      title={title}
    >
      <Form.Item
        colon={false}
        label="告警回调地址"
        {...bindFormItem(state)}
        extra="请输入公网可访问的 URL 地址，设置后将对所有 CDN、DCDN 的域名告警配置生效。"
      >
        <Input {...bindTextInput(state)} />
      </Form.Item>
    </Modal>
  )
})

function createState(info: CallbackInfo) {
  return new FieldState(info.callbackUri || '').validators(
    v => textPattern(httpUrl)(v)
  )
}

type State = ReturnType<typeof createState>

function getValue(state: State) {
  return state.value
}

function useAlarmCallback() {
  const {
    isLoading,
    isIdle,
    isError,
    error,
    run,
    result
  } = useAsync<{ callbackUri?: string }>({ callbackUri: undefined })

  const alarmCallbackApis = useInjection(AlarmCallbackApis)

  const call = React.useCallback(() => (
    run(alarmCallbackApis.getAlarmCallback())
  ), [run, alarmCallbackApis])

  React.useEffect(() => { call() }, [call])

  const toaster = useInjection(Toaster)

  React.useEffect(() => {
    if (isError) {
      toaster.error('查询告警回调信息失败')
    }
  }, [toaster, error, isError])

  return {
    call,
    result,
    isIdle,
    isLoading
  }
}

export default observer(function AlarmCallback() {
  const { call, result, isIdle, isLoading } = useAlarmCallback()
  const alarmCallbackApis = useInjection(AlarmCallbackApis)

  const state = useFormstateX(createState, [result])

  const [modalStore] = React.useState(
    () => new ModalStore<{ title?: string }>()
  )

  const toaster = useInjection(Toaster)

  const doUpsert = React.useCallback((title: string) => {
    toaster.promise(
      modalStore.open({ title }).then(
        () => alarmCallbackApis.upsertAlarmCallback(getValue(state))
      ).then(call)
    )
  }, [alarmCallbackApis, modalStore, toaster, state, call])

  const doDelete = React.useCallback(() => {
    toaster.promise(
      alarmCallbackApis.deleteAlarmCallback().then(call)
    )
  }, [alarmCallbackApis, toaster, call])

  const handleDelete = React.useCallback(() => {
    Modal.confirm({
      title: '删除提示',
      content: '删除后将停止向回调地址发送告警信息，该操作将同时影响 CDN、DCDN 的告警通知回调配置，如需恢复请重新配置。',
      onOk: doDelete
    })
  }, [doDelete])

  const callbackUri = result && result.callbackUri

  const configCnt = callbackUri
    ? (
      <>
        <span className="callback-config-uri">{callbackUri}</span>
        <Button
          onClick={() => doUpsert('修改告警回调地址')}
          className="callback-config-btn"
          type="link"
        >修改</Button>
        <Button
          onClick={handleDelete}
          className="callback-config-btn"
          type="link"
        >删除</Button>
      </>
    )
    : (
      <>
        <span className="callback-config-uri">暂无配置</span>
        <Button
          onClick={() => doUpsert('添加告警回调地址')}
          className="callback-config-btn"
          type="link"
        >添加</Button>
      </>
    )

  const tipContent = (
    <>
      <Link target="_blank" to={callbackDoc} rel="noopener noreferrer">告警通知回调&nbsp;</Link>
      功能支持将已配置的域名告警信息回调到固定的公网 URL，帮助您将告警信息集成到已有运维系统或消息通知系统中。 回调地址支持 http 和 https 协议，配置后会对所有已配置的域名告警立即生效，请保证回调地址处于可访问的状态。
    </>
  )

  return (
    <div className="comp-alarm-callback">
      <Spin spinning={isIdle || isLoading}>
        <div className="callback-config">
          <span className="callback-config-label">
            告警回调地址
            <TipIcon tip={tipContent} />
          </span>
          {configCnt}
        </div>
        <CallbackUriModel
          state={state}
          {...modalStore.bind()}
        />
      </Spin>
    </div>
  )
})
