/**
 * @file Source URL Rewrite Config Modal
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useEffect, useCallback } from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import Modal from 'react-icecream/lib/modal'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import { useFormstateX } from 'react-icecream-2/form-x'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { bindFormItem, bindTextArea } from 'portal-base/common/form'

import { textNotBlank } from 'cdn/transforms/form'

import { IModalProps } from 'cdn/stores/modal'

import TipIcon from 'cdn/components/TipIcon'

import { DomainProxyApiException } from 'cdn/apis/clients/domain-proxy'
import DomainApis, { UrlRewriteErrorCode, UrlRewrite, UrlRewriteResp } from 'cdn/apis/domain'

import './style.less'

function createState(info?: UrlRewrite) {
  return new FormState({
    pattern: new FieldState(info?.pattern ?? '').validators(
      v => textNotBlank(v.trim(), '不能为空')
    ),
    repl: new FieldState(info?.repl ?? '').validators(
      v => textNotBlank(v.trim(), '不能为空')
    ),
    inputUrl: new FieldState('').validators(
      v => textNotBlank(v.trim(), '不能为空')
    ),
    testResult: new FieldState('').validators(
      v => textNotBlank(v.trim(), '不能为空')
    )
  })
}

type State = ReturnType<typeof createState>

function getValue(state: State): UrlRewrite {
  const { pattern, repl } = formatValue(state.value)
  return {
    pattern,
    repl
  }
}

function formatValue(value: State['value']) {
  return {
    inputUrl: value.inputUrl.trim(),
    testResult: value.testResult.trim(),
    pattern: value.pattern.trim(),
    repl: value.repl.trim()
  }
}

export interface Props extends IModalProps {
  info?: UrlRewrite
}

export default observer(function ConfigModal({ info, visible, onCancel, onSubmit }: Props) {
  const toaster = useInjection(Toaster)
  const state = useFormstateX(createState, [info])
  const domainApis = useInjection(DomainApis)

  const handleSubmit = useCallback(async () => {
    const { hasError } = await state.validate()
    if (hasError) {
      return
    }

    await checkUrlRewrite(domainApis, state, toaster)

    if (!state.hasError) {
      onSubmit(getValue(state))
    }
  }, [domainApis, onSubmit, state, toaster])

  useEffect(() => {
    if (!visible) {
      state.reset()
    }
  }, [visible, state])

  const title = (
    <>
      {info ? '编辑改写规则' : '添加改写规则'}&nbsp;
      <TipIcon maxWidth="400px" tip={<UrlRewriteConfigTip />} />
    </>
  )

  return (
    <Modal
      title={title}
      onOk={handleSubmit}
      onCancel={onCancel}
      visible={visible}
      className="comp-url-rewrite-modal"
    >
      <div className="url-rewrite-modal-content">
        <Form colon={false}>
          <Form.Item label="匹配规则" {...bindFormItem(state.$.pattern)}>
            <Input.TextArea rows={1} placeholder="请输入匹配规则" {...bindTextArea(state.$.pattern)} />
          </Form.Item>
          <Form.Item label="改写规则" {...bindFormItem(state.$.repl)}>
            <Input.TextArea rows={1} placeholder="请输入改写规则" {...bindTextArea(state.$.repl)} />
          </Form.Item>
          <Form.Item label="测试输入" {...bindFormItem(state.$.inputUrl)}>
            <Input.TextArea rows={1} placeholder="请输入测试 URL" {...bindTextArea(state.$.inputUrl)} />
          </Form.Item>
          <Form.Item label="测试输出" {...bindFormItem(state.$.testResult)}>
            <Input.TextArea rows={1} placeholder="请输入改写结果" {...bindTextArea(state.$.testResult)} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
})

function UrlRewriteConfigTip() {
  return (
    <>
      <span>改写示例：</span>
      <ul style={{ listStyle: 'none' }}>
        <li>匹配规则&nbsp;&nbsp;&nbsp;/w/(\d+)/(\d+)/(.*) </li>
        <li>改写规则&nbsp;&nbsp;&nbsp;/$&#123;3&#125;?imageView/2/w/$&#123;1&#125;</li>
        <li>测试输入&nbsp;&nbsp;&nbsp;/w/300/200/apple</li>
        <li>测试输出&nbsp;&nbsp;&nbsp;/apple?imageView/2/w/300</li>
      </ul>
    </>
  )
}

const checkUrlRewriteFail = '测试 URL 改写失败'

async function checkUrlRewrite(domainApis: DomainApis, state: State, toaster: Toaster) {
  let result: UrlRewriteResp | null = null
  try {
    result = await domainApis.testUrlRewrite(formatValue(state.value))
  } catch (err: unknown) {
    if (!(err instanceof DomainProxyApiException)) {
      state.setError(checkUrlRewriteFail)
      return toaster.error(checkUrlRewriteFail)
    }
    switch (err.code) {
      case UrlRewriteErrorCode.InvalidPatten: {
        state.$.pattern.setError('无效的匹配规则')
        break
      }
      case UrlRewriteErrorCode.InvalidInput: {
        state.$.inputUrl.setError('无效的测试 URL')
        break
      }
      case UrlRewriteErrorCode.InputNonMatch: {
        state.$.inputUrl.setError('测试 URL 匹配失败')
        break
      }
      default: {
        state.setError(checkUrlRewriteFail)
        toaster.error(checkUrlRewriteFail)
        break
      }
    }
  }

  if (result && result.outputUrl !== state.value.testResult) {
    state.$.testResult.setError(`输出与改写结果不匹配，请检查后重新提交，正确的测试输出为：${result.outputUrl}`)
  }
}
