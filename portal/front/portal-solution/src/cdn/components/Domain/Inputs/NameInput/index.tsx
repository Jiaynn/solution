/**
 * @file Input for normal domains' name or wildcard domain's name
 * @author nighca <nighca@live.cn>
 */

import React, { ReactNode } from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import { Link } from 'portal-base/common/router'
import { useInjection } from 'qn-fe-core/di'
import { bindTextInput } from 'portal-base/common/form'

import { getNameForWildcardDomain } from 'cdn/transforms/domain'

import { textRequired, textPattern } from 'cdn/transforms/form'

import { useDomainIcp } from 'cdn/hooks/domain'

import { hostname } from 'cdn/constants/pattern'
import { DomainType } from 'cdn/constants/domain'

import OEMDisabled from 'cdn/components/common/OEMDisabled'
import TipIcon from 'cdn/components/TipIcon'

import DomainApis from 'cdn/apis/domain'

import Routes from 'cdn/constants/routes'
import { DomainProxyApiException } from 'cdn/apis/clients/domain-proxy'

import Error from '../common/Error'
import NoIcpWarning from '../common/NoIcpWarning'
import MultiInputs from '../MultiInputs'

import './style.less'

export type State = FormState<SingleNameState[]>

export type Value = string[]

export function createState(domainApis: DomainApis, domains: string[], getDomainType: () => DomainType): State {
  return new FormState((domains || []).map(domain => createSingleNameState(domainApis, domain, getDomainType)))
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
  limit: number
  domainType: DomainType
  shouldCheckIcp: boolean
}

export function DomainNameInputLabel({
  limit,
  shouldShowIcpTips
}: { limit: number, shouldShowIcpTips: boolean }) {
  const tipLinks = (
    <OEMDisabled>
      <a target="_blank" rel="noopener noreferrer" href="https://developer.qiniu.com/fusion/kb/6000/the-icp-registration-process">
        如何进行 ICP 备案？
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https://developer.qiniu.com/fusion/kb/5992/the-web-site-public-security-registration-process">
        如何进行公安网备案？
      </a>
    </OEMDisabled>
  )

  let tip: ReactNode = null

  if (!shouldShowIcpTips) {
    if (limit > 1) {
      tip = (
        <>最多支持批量添加 {limit} 个域名，添加多个域名时，配置必须全部一致，且这些域名默认使用 HTTP 协议</>
      )
    }
  } else {
    tip = (
      limit && limit > 1
      ? (
        <>
          1. 加速的域名请先完成在中国大陆的 ICP 备案，同时建议进行公安网备案。
          {tipLinks}
          <br />
          2. 最多支持批量添加 {limit} 个域名，添加多个域名时，配置必须全部一致，且这些域名默认使用 HTTP 协议。
        </>
      )
      : (
        <>
          加速的域名请先完成在中国大陆的 ICP 备案，同时建议进行公安网备案。
          {tipLinks}
        </>
      )
    )
  }

  return (
    <>
      加速域名 {tip && <TipIcon tip={tip} />}
    </>
  )
}

type SingleNameState = FieldState<string>

function createSingleNameState(domainApis: DomainApis, name: string, getDomainType: () => DomainType): SingleNameState {
  return new FieldState(name != null ? name : '', 500)
    .validators(
      v => textRequired(v, '输入域名不能为空'),
      v => textPattern(hostname)(v, '域名格式不合法，请检查后再输入'),
      v => checkDomainExistence(domainApis, getExactDomainName(v, getDomainType())!),
      v => checkDomainConflict(domainApis, getExactDomainName(v, getDomainType())!)
    )
}

export enum ValidateError {
  IsAlreadyExisted = 'isAlreadyExisted',
  IsConflictAndFinding = 'isconflict.isfinding',
  IsConflict = 'isconflict'
}

interface SingleNameInputProps {
  domainType: string
  state: SingleNameState
  shouldCheckIcp: boolean
}

const SingleNameInput = observer(function _SingleNameInput({
  domainType,
  state,
  shouldCheckIcp
}: SingleNameInputProps) {
  const inputProps = {
    type: 'text',
    name: 'names',
    placeholder: shouldCheckIcp ? '请输入已备案的加速域名' : '请输入加速域名',
    ...bindTextInput(state)
  }

  const input = (
    domainType === DomainType.Normal
      ? <Input {...inputProps} />
      : <Input {...inputProps} addonBefore="*." placeholder="example.com" />
  )

  const domain = getExactDomainName(state.value, domainType)!
  const icpWarning = useDomainIcp(domain, shouldCheckIcp)

  return (
    <div className="comp-single-name-input">
      <div className="text-input-wrapper">{input}</div>
      <NameTip name={domain} error={state.error} icpWarning={icpWarning} />
    </div>
  )
})

function NameTip(props: { name: string, error?: string, icpWarning?: string }) {
  const icpWarning = props.icpWarning ? <NoIcpWarning /> : null
  return (
    props.error
      ? <NameError name={props.name} error={props.error} />
      : icpWarning
  )
}

function NameError(props: { name: string, error: string }) {
  const routes = useInjection(Routes)

  if (props.error === ValidateError.IsAlreadyExisted) {
    return (
      <Error>
        您已经创建过该域名，可
        <Link to={routes.domainDetail(props.name)}>点击查看</Link>
      </Error>
    )
  }

  if (props.error === ValidateError.IsConflict) {
    const conflictPageUrl = routes.domainConflict(props.name)
    return (
      <Error>
        域名冲突，该域名在其他账号被创建过或被某个泛域名覆盖。如果需要找回该域名，可
        <Link to={conflictPageUrl}>点击找回</Link>
      </Error>
    )
  }
  if (props.error === ValidateError.IsConflictAndFinding) {
    return (
      <Error error="域名冲突，该域名已经在找回中，不能再找回" />
    )
  }
  return (
    <Error error={props.error} />
  )
}

// domain conflict 检查只能检查存在且非当前账号的域名冲突，
// 这里检查下创建的目标域名在当前账号下是否存在
export async function checkDomainExistence(domainApis: DomainApis, domainName: string) {
  try {
    const exists = await domainApis.getDomainExistence(domainName)
    return exists ? ValidateError.IsAlreadyExisted : null
  } catch (e) {
    return '无法检查域名是否已经存在'
  }
}

function checkDomainConflict(domainApis: DomainApis, domainName: string) {
  return domainApis.getDomainState(domainName).then(
    state => {
      if (!state.isconflict) {
        return null
      }
      return state.isfinding
          ? ValidateError.IsConflictAndFinding
          : ValidateError.IsConflict
    },
    (exception: unknown) => {
      // TODO 当前检查 hostname 合法性的正则跟后端的校验规则不匹配，所以加了个错误提示
      // 理论上所有用到 `hostname regexp` 的地方都要优化。但是后端不是通过正则来做的，目前这个方案需要优化
      if (exception instanceof DomainProxyApiException && exception.code === 400003000) {
        return '域名格式不合法，请检查后再输入'
      }
      return '检查域名冲突失败'
    }
  )
}

function getExactDomainName(domainName: string, domainType: string) {
  return (
    domainType === DomainType.Wildcard
    ? getNameForWildcardDomain(domainName)
    : domainName
  )
}

export default observer(function DomainNameInput(props: Props) {
  const { domainType, shouldCheckIcp, limit, state } = props

  const domainApis = useInjection(DomainApis)

  const handleAddInput = React.useCallback(() => {
    runInAction(() => {
      state.$.push(createSingleNameState(domainApis, '', () => domainType))
    })
  }, [state, domainType, domainApis])

  const handleDeleteInput = React.useCallback((index: number) => {
    runInAction(() => {
      const inputs = state.$.splice(index, 1)
      inputs.forEach(it => it.dispose())
    })
  }, [state])

  return (
    <div className="domain-name-input-wrapper">
      <MultiInputs
        state={state.$}
        limit={limit}
        onAdd={handleAddInput}
        onDelete={handleDeleteInput}
        renderInput={s => (
          <SingleNameInput
            domainType={domainType}
            shouldCheckIcp={shouldCheckIcp}
            state={s}
          />
        )}
      />
    </div>
  )
})
