/*
 * @file Complete Domain Form component
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'

import { Link } from 'portal-base/common/router'
import Form from 'react-icecream/lib/form'
import Radio from 'react-icecream/lib/radio'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import { bindFormItem, bindTextInput, bindRadioGroup } from 'portal-base/common/form'

import {
  authMethodOptions,
  AuthMethodType,
  encryptOptions,
  EncryptType
} from '../../constants/domain'
import { SSLDomainType, isDVSSLType, CertType, ProductShortName } from '../../constants/ssl'
import MultiDomainInput, { createState as createDomainState } from '../common/MultiDomainInput'
import { shortNameToInfo } from '../../utils/certificate'
import { isMultiDomain } from '../../transforms/complete'
import {
  notEmpty, onlySupportChineseAndCharacter
} from '../../utils/validate'
import HelpLink from '../common/HelpLink'

export interface IValue {
  domain: string
  remarkName: string
  authMethod: AuthMethodType
  encrypt: EncryptType
  dnsNames: string[]
}

export type IState = FormState<{
  domain: FieldState<string>
  remarkName: FieldState<string>
  authMethod: FieldState<AuthMethodType>
  dnsNames: ReturnType<typeof createDomainState>
  encrypt: FieldState<EncryptType>
}>

const defaultDomain = {
  domain: '',
  remarkName: '',
  dnsNames: [],
  authMethod: AuthMethodType.Dns,
  encrypt: EncryptType.Rsa
}

export function createState(value?: IValue): IState {
  value = {
    ...defaultDomain,
    ...value
  }
  const form = new FormState({
    domain: new FieldState(value.domain).validators(notEmpty),
    remarkName: new FieldState(value.remarkName).validators(notEmpty, onlySupportChineseAndCharacter),
    dnsNames: createDomainState(value.dnsNames).validators(dnsNamesValue => {
      const withoutDomainValue = dnsNamesValue.filter(name => name !== form.$.domain.value)
      if (withoutDomainValue.length < dnsNamesValue.length) {
        return '多域名中不能包含通用域名'
      }
    }),
    authMethod: new FieldState(value.authMethod || AuthMethodType.Dns),
    encrypt: new FieldState(value.encrypt || EncryptType.Rsa)
  })
  return form
}

export interface IDomainFormProps {
  state: IState
  isFirst: boolean
  productName?: ProductShortName
  type?: SSLDomainType
  limit: number
  years: number
}

export default observer(function _DomainForm(props: IDomainFormProps) {
  const { state, isFirst, productName, type, limit, years } = props
  const { certType } = shortNameToInfo(productName)

  const authMethodTooltip = years === 2 && (
    <Tooltip title={
      <div>
        DNS_PROXY 验证即 DNS 代理验证。证书颁发后请保留 CNAME 记录，第二年续期会复用 CNAME 配置重新验证域名，详情见&nbsp;
        <HelpLink href="https://developer.qiniu.com/ssl/manual/3667/ssl-certificate-of-free-dns-validation-guide">文档</HelpLink>
      </div>
    }
    >
      <Icon type="question-circle" />
    </Tooltip>
  )

  return (
    <Form layout="horizontal" colon={false} style={{ width: '592px' }}>
      <Form.Item
        {...bindFormItem(state.$.domain)}
        label="域名（通用名称）"
        required
      >
        {
          isFirst
          ? <Input {...bindTextInput(state.$.domain)} placeholder="请输入域名" />
          : <span>{state.$.domain.value}</span>
        }
      </Form.Item>
      {
        isMultiDomain(type) && (
          <Form.Item
            {...bindFormItem(state.$.dnsNames)}
            label="多域名（DNS Names）"
            required
          >
            {
              isFirst
              ? <MultiDomainInput limit={limit} state={state.$.dnsNames} />
              : <MultiDomainForDisplay dnsNames={state.$.dnsNames.value} />
            }
          </Form.Item>
        )
      }
      <Form.Item
        {...bindFormItem(state.$.remarkName)}
        label="证书备注名"
        required
      >
        <Input
          placeholder="支持中英文字符、数字、空格、_、-、*、.、()"
          {...bindTextInput(state.$.remarkName)}
        />
      </Form.Item>
      {
        // DV 证书需要“域名所有权验证”
        isDVSSLType(certType) && (
          <Form.Item
            {...bindFormItem(state.$.authMethod)}
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label="域名所有权验证方式"
            required
          >
            <Radio.Group {...bindRadioGroup(state.$.authMethod)} className="auth-method-radio-group">
              {getAuthMethodRadios(years, certType)}
            </Radio.Group>
            {authMethodTooltip}
          </Form.Item>
        )
      }
      {
        // DV 证书需要“加密算法”
        isDVSSLType(certType) && (
          <Form.Item
            {...bindFormItem(state.$.encrypt)}
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label="加密算法"
            required
          >
            <Radio.Group {...bindRadioGroup(state.$.encrypt)} className="encrypt-radio-group">
              {getEncryptRadios(encryptOptions, certType)}
            </Radio.Group>
            <Tooltip title={
              <>
                <div>证书兼容性简要提示说明</div>
                <div><Link to="https://developer.qiniu.com/ssl/manual/3659/ssl-compatibility-test-report" target="_blank" rel="noopener">了解更多</Link></div>
              </>
            }
            >
              <Icon type="question-circle" />
            </Tooltip>
          </Form.Item>
        )
      }
    </Form>
  )
})

function getEncryptRadios(options: Array<{ value: EncryptType, label: string }>, certType: CertType) {
  if (certType === CertType.DVWildcard) {
    options = options.filter(option => option.value !== EncryptType.Ecc)
  }
  return options.map(
    ({ value, label }) => <Radio key={value} value={value}>{label}</Radio>
  )
}

function getAuthMethodRadios(years: number, certType: CertType) {
  let options = authMethodOptions

  // dv 通配符证书无文件验证方式
  if (certType === CertType.DVWildcard) {
    options = options.filter(option => option.value !== AuthMethodType.File)
  }

  // DV 两年期续期证书只有 DNS_PROXY 验证
  if (years === 2) {
    options = options.filter(option => option.value === AuthMethodType.DnsProxy)
  } else {
    options = options.filter(option => option.value !== AuthMethodType.DnsProxy)
  }

  return options.map(
    ({ value, label }) => <Radio key={value} value={value}>{label}</Radio>
  )
}

interface IMultiDomainForDisplayProps {
  dnsNames: string[]
}

function MultiDomainForDisplay({ dnsNames }: IMultiDomainForDisplayProps) {
  return <span>{dnsNames.join(',')}</span>
}
